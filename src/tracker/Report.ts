import {hasOwnProperty, UsergeekUtils} from "../utils";

export type ReportContentEvent = { event: EventContent }
export type ReportContentSession = { session: SessionContent }
export type ReportContent = ReportContentEvent | ReportContentSession

export type EventContent = { name: string }
export type SessionContent = {}

export class Report {
    sequence: number
    timeMillis: number
    content: ReportContent

    constructor(sequence: number, timeMillis: number, content: ReportContent) {
        this.sequence = sequence
        this.timeMillis = timeMillis
        this.content = content;
    }

    public static serialize(report: Report): string {
        return JSON.stringify({
            sequence: report.sequence,
            timeMillis: report.timeMillis,
            content: JSON.stringify(report.content)
        })
    }

    public static deserialize(serializedReport: string): Report | undefined {
        const reportJSONObject = UsergeekUtils.parseJSONSafe(serializedReport);
        if (reportJSONObject) {
            const sequence = reportJSONObject.sequence;
            const timeMillis = reportJSONObject.timeMillis;
            const content = reportJSONObject.content;
            if (UsergeekUtils.isNumber(sequence) && UsergeekUtils.isNumber(timeMillis) && UsergeekUtils.isString(content)) {
                const reportContentJSONObject = UsergeekUtils.parseJSONSafe(content);
                if (reportContentJSONObject) {
                    if (hasOwnProperty(reportContentJSONObject, "event")) {
                        return new Report(sequence, timeMillis, reportContentJSONObject as ReportContentEvent)
                    } else if (hasOwnProperty(reportContentJSONObject, "session")) {
                        return new Report(sequence, timeMillis, reportContentJSONObject as ReportContentSession)
                    }
                }
            }
        }
        return undefined
    }
}