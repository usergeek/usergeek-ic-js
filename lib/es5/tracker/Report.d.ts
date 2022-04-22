export declare type ReportContentEvent = {
    event: EventContent;
};
export declare type ReportContentSession = {
    session: SessionContent;
};
export declare type ReportContent = ReportContentEvent | ReportContentSession;
export declare type EventContent = {
    name: string;
};
export declare type SessionContent = {};
export declare class Report {
    sequence: number;
    timeMillis: number;
    content: ReportContent;
    constructor(sequence: number, timeMillis: number, content: ReportContent);
    static serialize(report: Report): string;
    static deserialize(serializedReport: string): Report | undefined;
}
