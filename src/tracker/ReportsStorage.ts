import {Report, ReportContent} from "./Report";
import {KeyValueStore} from "../store/KeyValueStore";

export interface ReportsStorage {
    getMaxSequence(): number

    getReportsCount(): number

    putReport(sequence: number, timeMillis: number, reportContent: ReportContent): boolean

    tryToFreeSpace(reportSequence: number, removeReportsPercentWhenFull: number): [boolean, number]

    removeEarlyReports(reportSequence: number): boolean

    getReports(limit?: number): Report[]

    clearAll(): void
}

const KEY_REPORTS = "reports"

export class ReportsStorage implements ReportsStorage {
    private api: KeyValueStore;

    constructor(api: KeyValueStore) {
        this.api = api;
    }

    getMaxSequence(): number {
        let maxSequence = 0;
        this.getReports().forEach((report) => {
            maxSequence = Math.max(report.sequence, maxSequence);
        })
        return maxSequence;
    }

    getReportsCount(): number {
        return this._storage_getReportsSafe().length;
    }

    putReport(sequence: number, timeMillis: number, reportContent: ReportContent): boolean {
        const reports = this._storage_getReportsSafe();
        const report = new Report(sequence, timeMillis, reportContent);
        const reportSerialized = Report.serialize(report)
        reports.push(reportSerialized);
        return this._storage_setReports(reports);
    }

    tryToFreeSpace(reportSequence: number, removeReportsPercentWhenFull: number): [boolean, number] {
        const reportsCount = this.getReportsCount();
        const removeCount = Math.ceil((reportsCount * removeReportsPercentWhenFull) / 100);
        const sequenceForRemove = reportSequence - Math.max(1, reportsCount - removeCount);
        const removeSuccess = this.removeEarlyReports(sequenceForRemove);
        return [removeSuccess, removeCount];
    }

    removeEarlyReports(reportSequence: number): boolean {
        let indexToDeleteTo = -1;
        this.getReports().forEach((report, idx) => {
            if (report.sequence <= reportSequence) {
                indexToDeleteTo = idx;
            }
        })
        if (indexToDeleteTo > -1) {
            const reports = this._storage_getReportsSafe();
            reports.splice(0, indexToDeleteTo + 1);
            return this._storage_setReports(reports);
        }
        return true;
    }

    getReports(limit?: number): Report[] {
        const targetSize = limit !== undefined ? limit : -1;
        const result: Report[] = [];
        const fetchAll = targetSize < 0;
        this._storage_getReportsSafe().some((reportJSONString, idx) => {
            const someResult = fetchAll ? false : idx >= targetSize;
            if (!someResult) {
                const report = Report.deserialize(reportJSONString);
                if (report) {
                    result.push(report);
                }
            }
            return someResult;
        });
        return result;
    }

    clearAll(): void {
        this._storage_clearReports();
    }

    _storage_getReportsSafe(): string[] {
        return this.api.get(KEY_REPORTS) || Array<string>();
    }

    _storage_setReports(reports: string[]): boolean {
        try {
            this.api.set(KEY_REPORTS, reports);
            return true;
        } catch (e) {
            // maybe QuotaExceededError here
            return false;
        }
    }

    _storage_clearReports() {
        this.api.remove(KEY_REPORTS);
    }

}