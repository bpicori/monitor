import express from 'express';
import { html } from './ui/html';

export type RedisConfig = { uri: string };

export interface IMonitor {
    category: string;
    check(): Promise<IMonitorActivity | IMonitorActivity[]>;
}

export interface IMonitorActivity {
    name: string;
    status: Status;
    message?: string;
    metadata?: Record<string, string | number | undefined>;
}

export enum Status {
    ERROR,
    OK,
}

export interface Config {
    displayName?: string;
    monitors: IMonitor[];
}

export type StatusResponse = Record<
    string,
    {
        status_string: string;
        items: (IMonitorActivity & { status_string: string })[];
    }
>;

export class MonitorServer {
    public constructor(private config: Config) {}

    public async getStatusResponse(): Promise<StatusResponse> {
        const status: StatusResponse = {};
        await Promise.all(
            this.config.monitors.map(async (monitor) => {
                const category = monitor.category;
                const activity = await monitor.check();
                status[category] = status[category] || {
                    items: [],
                    status_string: 'OK',
                };
                if (Array.isArray(activity)) {
                    status[category].items.push(
                        ...activity.map((x) => {
                            return {
                                ...x,
                                status_string:
                                    x.status === Status.OK ? 'OK' : 'ERROR',
                            };
                        })
                    );
                } else {
                    status[category].items.push({
                        ...activity,
                        status_string:
                            activity.status === Status.OK ? 'OK' : 'ERROR',
                    });
                }
                status[category].status_string = status[category].items.some(
                    (x) => x.status === Status.ERROR
                )
                    ? 'ERROR'
                    : 'OK';
            })
        );
        return status;
    }

    public async startServer(port: number): Promise<void> {
        const app = express();

        app.get('/', async (_req, res) => {
            const name = this.config.displayName || 'Status Page';
            const status = await this.getStatusResponse();
            const r = html
                .replace(/'{{{__ACTIVITIES__}}}'/, JSON.stringify(status))
                .replace(/{{{__NAME__}}}/, name);
            res.send(r);
        });

        app.get('/json', async (_req, res) => {
            res.send(await this.getStatusResponse());
        });

        await new Promise<void>((resolve) => {
            app.listen(port, resolve);
        });
        console.log(`Monitor server started on port ${port}`);
    }
}
