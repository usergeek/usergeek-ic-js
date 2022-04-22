export interface Configuration {

    /**
     * Number of reports (events) sent to the IC in one request
     */
    readonly uploadReportsCount: number
    /**
     * The time (in millis) between attempts to send events to the IC
     */
    readonly uploadReportsPeriod: number

    readonly maxReportsCountInStorage: number
    readonly removeReportsPercentWhenFull: number

    readonly dryRunEnabled: boolean

}

export const ConfigurationUtil = {
    makeConfiguration: (initialConfiguration: Partial<Configuration>): Configuration => {
        return {
            uploadReportsCount: 50,
            uploadReportsPeriod: 5 * 1000, // 5sec
            maxReportsCountInStorage: 1000,
            removeReportsPercentWhenFull: 2,
            dryRunEnabled: false,
            ...initialConfiguration
        }
    }
}