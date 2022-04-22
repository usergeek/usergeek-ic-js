import {PageVisibilityApi} from "./PageVisibilityApi";
import {log, warn} from "./../utils";

const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
const LOG_KEY = "pageVisibility"

export class PageVisibilityTracker {

    private started: boolean
    private lastTrackedSessionDayIndex: number

    public start(dayChangedCallback: () => void) {
        if (!this.started) {
            this.started = true
            if (PageVisibilityApi.isSupported()) {
                this.lastTrackedSessionDayIndex = getCurrentDayIndex()
                PageVisibilityApi.addListener(() => {
                    if (PageVisibilityApi.state() == "visible") {
                        let currentDayIndex = getCurrentDayIndex();
                        const diff = currentDayIndex - this.lastTrackedSessionDayIndex
                        if (diff > 0) {
                            this.lastTrackedSessionDayIndex = currentDayIndex
                            log(LOG_KEY, {
                                action: "trackSession",
                                currentDayIndex: this.lastTrackedSessionDayIndex
                            })
                            dayChangedCallback()
                        }
                    }
                })
            } else {
                warn(LOG_KEY, "notSupported")
            }
        }
    }

}

const getCurrentDayIndex = (): number => Math.floor(new Date().getTime() / ONE_DAY_MILLIS)