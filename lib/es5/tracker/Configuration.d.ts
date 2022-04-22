export interface Configuration {
    /**
     * Number of reports (events) sent to the IC in one request
     */
    readonly uploadReportsCount: number;
    /**
     * The time (in millis) between attempts to send events to the IC
     */
    readonly uploadReportsPeriod: number;
    readonly maxReportsCountInStorage: number;
    readonly removeReportsPercentWhenFull: number;
    readonly dryRunEnabled: boolean;
}
export declare const ConfigurationUtil: {
    makeConfiguration: (initialConfiguration: Partial<Configuration>) => Configuration;
};
