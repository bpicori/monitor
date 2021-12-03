import { Status } from './Monitor';
import Axios, { AxiosRequestConfig } from 'axios';

export interface StatusUrlConfig {
    uri: string;
    timeout?: number;
    auth?: { username: string; password: string };
}

export interface UrlActivity {
    name: string;
    status: Status;
    errorMessage?: string;
    time?: number;
}

export class StatusUrlMonitor {
    constructor(private statusUrl: StatusUrlConfig[]) {}

    public async check(): Promise<UrlActivity[]> {
        return await Promise.all(this.statusUrl.map((c) => this.checkUrl(c)));
    }

    private async checkUrl(config: StatusUrlConfig): Promise<UrlActivity> {
        const instance = Axios.create();
        const requestStartTime = process.hrtime();
        try {
            await instance({
                url: config.uri,
                auth: config.auth,
            });
            const end = process.hrtime(requestStartTime);
            const requestDuration = Math.round(
                end[0] * 1000 + end[1] / 1000000
            );
            return {
                name: config.uri,
                status: Status.OK,
                time: requestDuration,
            };
        } catch (err) {
            return {
                name: config.uri,
                status: Status.ERROR,
                errorMessage: err.message,
                time: 0,
            };
        }
    }
}
