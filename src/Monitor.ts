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

export type RedisConfig = { uri: string };

export enum Status {
    ERROR,
    OK,
}

export interface Config {
    lastActivity?: LastActivityConfig;
    mongo?: MongoConfig[];
    statusUrl?: StatusUrlConfig[];
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

    public async getStatus() {
        const status: {
            lastActivities?: LastActivity[];
            mongo?: MongoActivity[];
            urls?: UrlActivity[];
        } = {};
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
}
