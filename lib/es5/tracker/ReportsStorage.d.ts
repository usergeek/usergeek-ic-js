import { Report, ReportContent } from "./Report";
import { KeyValueStore } from "../store/KeyValueStore";
export interface ReportsStorage {
    getMaxSequence(): number;
    getReportsCount(): number;
    putReport(sequence: number, timeMillis: number, reportContent: ReportContent): boolean;
    tryToFreeSpace(reportSequence: number, removeReportsPercentWhenFull: number): [boolean, number];
    removeEarlyReports(reportSequence: number): boolean;
    getReports(limit?: number): Report[];
    clearAll(): void;
}
export declare class ReportsStorage implements ReportsStorage {
    private api;
    constructor(api: KeyValueStore);
    _storage_getReportsSafe(): string[];
    _storage_setReports(reports: string[]): boolean;
    _storage_clearReports(): void;
}
