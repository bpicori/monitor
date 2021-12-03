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
import { KafkaConfig } from 'kafkajs';
import {
    KafkaActivity,
    KafkaMonitor,
    KafkaMonitorConfig,
} from './KafkaMonitor';

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
    kafka?: KafkaMonitorConfig;
}

export interface StatusResponse {
    lastActivities?: LastActivity[];
    mongo?: MongoActivity[];
    urls?: UrlActivity[];
    kafka?: KafkaActivity;
}

export class MonitorServer {
    private lastActivity: LastActivityMonitor | undefined;
    private mongoActivity: MongoMonitor | undefined;
    private statusUrl: StatusUrlMonitor | undefined;
    private kafkaMonitor: KafkaMonitor | undefined;

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
        if (config.kafka) {
            this.kafkaMonitor = new KafkaMonitor(config.kafka);
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
        if (this.config.kafka) {
            status.kafka = await this.kafkaMonitor?.check();
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
