import { IMonitorActivity, Status } from './Monitor';
import Axios from 'axios';
import { hasMessage, IMonitor, isAxiosError } from '.';

export interface StatusUrlConfig {
    uri: string;
    timeout?: number;
    auth?: { username: string; password: string };
    allowedStatusCodes?: number[];
}

export class StatusUrlMonitor implements IMonitor {
    public constructor(private statusUrl: StatusUrlConfig[]) {}

    public category: string = 'URLs Health Check';

    public async check(): Promise<IMonitorActivity[]> {
        return await Promise.all(this.statusUrl.map((c) => this.checkUrl(c)));
    }

    private async checkUrl(config: StatusUrlConfig): Promise<IMonitorActivity> {
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
                metadata: {
                    time: (requestDuration / 1000).toFixed(3) + 's',
                },
            };
        } catch (err) {
            const end = process.hrtime(requestStartTime);
            const requestDuration = Math.round(
                end[0] * 1000 + end[1] / 1000000
            );
            if (isAxiosError(err)) {
                const statusCode = err.response?.status;
                if (
                    statusCode &&
                    config.allowedStatusCodes &&
                    config.allowedStatusCodes.includes(statusCode)
                ) {
                    return {
                        name: config.uri,
                        status: Status.OK,
                        metadata: {
                            time: (requestDuration / 1000).toFixed(3) + 's',
                            statusCode,
                            errorMessage: err.message,
                        },
                    };
                }
            }
            return {
                name: config.uri,
                status: Status.ERROR,
                errorMessage: hasMessage(err) ? err.message : '',
                metadata: {
                    time: (requestDuration / 1000).toFixed(3) + 's',
                },
            };
        }
    }
}
