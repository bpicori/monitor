import { Status } from './Monitor';
import Axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';

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
        instance.interceptors.request.use((config: AxiosRequestConfig) => {
            (config.headers as any).requestStartTime = process.hrtime();
            return config;
        });

        instance.interceptors.response.use((response) => {
            const start =
                (response.config?.headers?.requestStartTime as unknown as [
                    number,
                    number
                ]) || [];
            if (start.length) {
                const end = process.hrtime(start);
                (response.headers as any).requestDuration = Math.round(
                    end[0] * 1000 + end[1] / 1000000
                );
            }
            return response;
        });
        try {
            console.log(config.uri);
            const response = await instance({
                url: config.uri,
                auth: config.auth,
            });
            return {
                name: config.uri,
                status: Status.OK,
                time: response.headers.requestDuration as unknown as number,
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
