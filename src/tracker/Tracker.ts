import {Principal} from "@dfinity/principal";
import {ApiParameters, GetAnalyticsReceiverApiResult} from "../APIService";
import {createErrResult, createOkResult, hasOwnProperty, isOk, UGResult, UsergeekUtils, warn, log} from "../utils";
import {ReportsStorage} from "./ReportsStorage";
import {KeyValueStoreFacade} from "../store/KeyValueStoreFacade";
import {Configuration, ConfigurationUtil} from "./Configuration";
import {Uploader, UploaderImpl, UploadEventPacketResult} from "./Uploader";
import {EventContent, Report, ReportContent, ReportContentEvent, ReportContentSession, SessionContent} from "./Report";
import {Event, Packet, PacketItem, Session} from "../canisters/analyticsStore.did";
import {DebugConfiguration} from "../UsergeekClient";

const EVENT_NAME_MAX_SIZE = 250

export class Tracker {
    private readonly configuration: Configuration
    private readonly clientPrincipal: Principal
    private readonly debugConfiguration: DebugConfiguration | undefined

    private readonly reportsStorage: ReportsStorage
    private sequence: number

    private uploader: Uploader

    private scheduleUploadTimer?: number
    private scheduleUpload: boolean = false
    private uploading: boolean = false
    private destroyed: boolean = false

    constructor(apiKey: string, clientPrincipal: Principal, initialConfiguration: Partial<Configuration>, debugConfiguration?: DebugConfiguration) {
        this.clientPrincipal = clientPrincipal;
        this.configuration = ConfigurationUtil.makeConfiguration(initialConfiguration)
        this.debugConfiguration = debugConfiguration
        const storeNamespace = `ug-ic${apiKey}.${this.clientPrincipal.toText()}.reportsStorage`;
        this.reportsStorage = new ReportsStorage(KeyValueStoreFacade.createStore(storeNamespace))
        this.sequence = this.reportsStorage.getMaxSequence()
        this.validateSequence()

        if (this.debugConfiguration?.loggerLog) {
            this.debugConfiguration?.loggerLog("ReportStorage created", {
                storeNamespace,
                sequence: this.sequence,
                reportsCount: this.reportsStorage.getReportsCount()
            })
        }
        log(`ReportStorage created with namespace "${storeNamespace}", sequence = ${this.sequence}, unsent reports in storage = ${this.reportsStorage.getReportsCount()}`)
    }

    public isClientPrincipalEqual = (principal: Principal): boolean => {
        return principal?.toText() == this.clientPrincipal?.toText()
    }

    public hasUnsentPackets(): boolean {
        return this.reportsStorage.getReportsCount() > 0
    }

    public async upload(analyticsReceiverApiResult: GetAnalyticsReceiverApiResult | undefined, sessionAlreadyTracked: boolean, apiParameters: ApiParameters, force: boolean): Promise<UGResult<"ok", Error>> {
        try {
            if (analyticsReceiverApiResult) {
                if (analyticsReceiverApiResult.analyticsStoreNotified && !sessionAlreadyTracked) {
                    //for the first time ever user is registered in clientRegistry - it means that there is one extra session report which must be removed
                    //implement it later...
                }
                if (!this.uploader) {
                    this.uploader = new UploaderImpl(analyticsReceiverApiResult.analyticsReceiverApiView, apiParameters)
                }
                this.proceedToUpload(force)
                return createOkResult("ok")
            }
            warn("Tracker.upload: analyticsReceiverApiResult is undefined. upload skipped")
            return createErrResult(new Error("AnalyticsStore unavailable."))
        } catch (e) {
            warn("Tracker.upload", e)
            return createErrResult(e)
        }
    }

    public logSession = () => {
        try {
            const reportSessionContent: SessionContent = {}
            const report: ReportContentSession = {
                session: reportSessionContent
            }
            this.logReport(UsergeekUtils.getCurrentTime(), report)
        } catch (e) {
            //nop
        }
    };

    public logEvent = (eventName: string) => {
        try {
            const reportEventContent: EventContent = {
                name: String(eventName).trim()
            }
            const report: ReportContentEvent = {
                event: reportEventContent
            }
            this.logReport(UsergeekUtils.getCurrentTime(), report)
        } catch (e) {
            //nop
        }
    };

    public destroy = () => {
        this.destroyed = true
        this.uploader?.destroy()
        window.clearTimeout(this.scheduleUploadTimer)
        this.scheduleUpload = false;
        warn("Tracker: destroyed")
    }

    private logReport = (timeMillis: number, reportContent: ReportContent) => {
        this.validateSequence()
        const reportSequence = ++this.sequence;

        const validationSuccess = this.validateReport(reportContent)
        if (!validationSuccess) {
            return;
        }
        if (this.configuration.dryRunEnabled) {
            if (reportContent && this.debugConfiguration?.loggerLog) {
                this.debugConfiguration?.loggerLog(`Report skipped (dryRun ON)`, {reportContent})
            }
            return
        }

        const putSuccess = this.reportsStorage.putReport(reportSequence, timeMillis, reportContent)
        if (!putSuccess) {
            if (this.debugConfiguration?.loggerError) {
                this.debugConfiguration?.loggerError(`Unable to store data in localStorage. Seems that there is no space left... Will try to remove ${this.configuration.removeReportsPercentWhenFull}% of oldest events`)
            }
            const [tryToFreeSpaceSuccess, removeCount] = this.reportsStorage.tryToFreeSpace(reportSequence, this.configuration.removeReportsPercentWhenFull)
            if (tryToFreeSpaceSuccess) {
                if (this.debugConfiguration?.loggerWarn) {
                    this.debugConfiguration?.loggerWarn(`Number of reports removed: ${removeCount}. Actual reports: ${this.reportsStorage.getReportsCount()}`)
                }
                this.reportsStorage.putReport(reportSequence, timeMillis, reportContent)
            } else {
                if (this.debugConfiguration?.loggerError) {
                    this.debugConfiguration?.loggerError(`Failed to remove ${removeCount} reports. Existing reports: ${this.reportsStorage.getReportsCount()}`)
                }
                this.reportsStorage.clearAll()
            }
        } else {
            if (reportContent && this.debugConfiguration?.loggerLog) {
                this.debugConfiguration?.loggerLog(`Report stored`, {reportSequence, timeMillis, reportContent})
            }
        }

        const reportsCount = this.reportsStorage.getReportsCount()
        if (reportsCount > this.configuration.maxReportsCountInStorage) {
            const [tryToFreeSpaceSuccess, removeCount] = this.reportsStorage.tryToFreeSpace(reportSequence, this.configuration.removeReportsPercentWhenFull)
            if (tryToFreeSpaceSuccess) {
                if (this.debugConfiguration?.loggerWarn) {
                    this.debugConfiguration?.loggerWarn(`Number of reports removed: ${removeCount}. Actual reports: ${this.reportsStorage.getReportsCount()}`)
                }
            } else {
                if (this.debugConfiguration?.loggerError) {
                    this.debugConfiguration?.loggerError(`Failed to remove ${removeCount} reports. Existing reports: ${this.reportsStorage.getReportsCount()}`)
                }
            }
        }
    }

    private proceedToUpload(force: boolean) {
        const reportsCount = this.reportsStorage.getReportsCount()
        if (reportsCount > 0) {
            if (force) {
                window.clearTimeout(this.scheduleUploadTimer)
                this.scheduleUpload = false;
            }
            if (force || reportsCount >= this.configuration.uploadReportsCount) {
                // noinspection JSIgnoredPromiseFromCall
                this.uploadReports()
            } else {
                this.scheduleUploadReports()
            }
        }
    }

    private async uploadReports() {
        if (this.destroyed) {
            warn("Tracker: uploadReports skipped - destroyed")
            return;
        }
        if (this.uploading) {
            return
        }
        this.uploading = true
        try {
            const limit = this.configuration.uploadReportsCount;
            const reports: Array<Report> = this.reportsStorage.getReports(limit);
            const uploadReportsData = this.buildUploadEventPacket(reports)
            if (uploadReportsData) {
                if (this.debugConfiguration?.loggerLog) {
                    this.debugConfiguration?.loggerLog(`Will send packet`, UsergeekUtils.jsonStringifyWithBigInt({packet: uploadReportsData}))
                }
                const uploadEventPacketResult: UploadEventPacketResult = await this.uploader.uploadEventPacket(uploadReportsData.packet)
                this.handleUploadReportsResult(uploadEventPacketResult, uploadReportsData.maxSequence)
            } else {
                this.uploading = false
            }
        } catch (e) {
            this.uploading = false
            this.scheduleUploadReports()
        }
    }

    private handleUploadReportsResult(uploadEventPacketResult: UploadEventPacketResult, maxSequence: number) {
        this.uploading = false
        if (isOk(uploadEventPacketResult)) {
            this.reportsStorage.removeEarlyReports(maxSequence)
            if (this.debugConfiguration?.loggerLog) {
                this.debugConfiguration?.loggerLog(`Packet sent`)
            }
            // noinspection JSIgnoredPromiseFromCall
            this.uploadReports()
        } else {
            if (this.debugConfiguration?.loggerWarn) {
                this.debugConfiguration?.loggerWarn(`Packet send failed`, UsergeekUtils.jsonStringifyWithBigInt({result: uploadEventPacketResult}))
            }
            this.scheduleUploadReports()
        }
    }

    private scheduleUploadReports() {
        if (this.destroyed) {
            warn("Tracker: scheduleUploadReports skipped - destroyed")
            return;
        }
        if (this.scheduleUpload) {
            return
        } else {
            this.scheduleUpload = true;
        }
        window.clearTimeout(this.scheduleUploadTimer)
        const delay = this.configuration.uploadReportsPeriod
        this.scheduleUploadTimer = window.setTimeout(this.uploadReportsDelayed.bind(this), delay)
    }

    private uploadReportsDelayed() {
        this.scheduleUpload = false;
        // noinspection JSIgnoredPromiseFromCall
        this.uploadReports()
    }

    private buildUploadEventPacket(reports: Array<Report>): {
        packet: Packet, maxSequence: number
    } | undefined {
        if (reports.length > 0) {
            let maxSequence = 0;
            const items: Array<PacketItem> = reports.map<PacketItem>((report) => {
                maxSequence = Math.max(report.sequence, maxSequence)
                if (hasOwnProperty(report.content, "event")) {
                    const event: Event = {
                        name: report.content.event.name,
                        sequence: BigInt(report.sequence),
                        timeMillis: BigInt(report.timeMillis)
                    }
                    const packetItem: PacketItem = {
                        event: event
                    }
                    return packetItem
                } else if (hasOwnProperty(report.content, "session")) {
                    const session: Session = {
                        sequence: BigInt(report.sequence),
                        timeMillis: BigInt(report.timeMillis)
                    }
                    const packetItem: PacketItem = {
                        session: session
                    }
                    return packetItem
                }
            })
            const packet: Packet = {
                items: items
            }
            return {
                packet: packet,
                maxSequence: maxSequence
            }
        }
        return undefined
    }

    private validateSequence = () => {
        // 9007199254740991 = (Math.pow(2, 53) - 1)
        if (this.sequence === 9007199254740991 - 1) {
            this.sequence = 0
        }
    };

    private validateReport(report: ReportContent): boolean {
        if (hasOwnProperty(report, "event")) {
            let error: string | null = null
            const eventName = report.event.name;
            if (UsergeekUtils.isStringEmpty(eventName)) {
                error = "empty"
            } else if (UsergeekUtils.getSize(eventName) > EVENT_NAME_MAX_SIZE) {
                error = "tooLong"
            }
            if (error) {
                if (this.debugConfiguration?.loggerError) {
                    this.debugConfiguration?.loggerError(`Failed to send event!`, {event: report.event, error: error})
                }
                return false
            }
        }
        return true
    }
}