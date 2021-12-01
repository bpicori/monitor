import {
    LastActivity,
    LastActivityConfig,
    LastActivityMonitor,
} from './LastActivityMonitor';
import { MongoActivity, MongoConfig, MongoMonitor } from './MongoMonitor';
import {
    StatusUrlConfig,
    StatusUrlMonitor,
    UrlActivity,
} from './StatusUrlMonitor';
import express from 'express';
import { html } from './ui/html';

export type RedisConfig = { uri: string };

export enum Status {
    ERROR,
    OK,
}

export interface Config {
    lastActivity?: LastActivityConfig;
    mongo?: MongoConfig[];
    statusUrl?: StatusUrlConfig[];
    displayName?: string;
}

export interface StatusResponse {
    lastActivities?: LastActivity[];
    mongo?: MongoActivity[];
    urls?: UrlActivity[];
}

export class MonitorServer {
    private lastActivity: LastActivityMonitor | undefined;
    private mongoActivity: MongoMonitor | undefined;
    private statusUrl: StatusUrlMonitor | undefined;

    public constructor(private config: Config) {
        if (config.lastActivity) {
            this.lastActivity = new LastActivityMonitor(config.lastActivity);
        }
        if (config.mongo) {
            this.mongoActivity = new MongoMonitor(config.mongo);
        }
        if (config.statusUrl) {
            this.statusUrl = new StatusUrlMonitor(config.statusUrl);
        }
    }

    public async getStatusResponse(): Promise<StatusResponse> {
        const status: StatusResponse = {};
        if (this.config.lastActivity) {
            status.lastActivities = await this.lastActivity?.check();
        }
        if (this.config.mongo) {
            status.mongo = await this.mongoActivity?.check();
        }
        if (this.config.statusUrl) {
            status.urls = await this.statusUrl?.check();
        }
        return status;
    }

    public async startServer(port: number): Promise<void> {
        const app = express();

        app.listen(port, () => {
            console.log(`Monitoring started on port 3000`);
        });

        app.get('/', async (req, res) => {
            const name = this.config.displayName || 'Status Page';
            const status = await this.getStatusResponse();
            const r = html
                .replace(/'{{{__ACTIVITIES__}}}'/, JSON.stringify(status))
                .replace(/{{{__NAME__}}}/, name);
            res.send(r);
        });
        app.get('/json', async (req, res) => {
            res.send(await this.getStatusResponse());
        });
    }
}
