import { RedisConfig, Status } from './Monitor';
import moment from 'moment';
import IoRedis from 'ioredis';
import IORedis from 'ioredis';
import { now } from './helpers';

type TimeConfigHandler = () =>
    | Record<string, number>
    | Promise<Record<string, number>>;

export interface LastActivityConfig {
    lastActivityKey: string;
    redisConfigs: RedisConfig[];
    timeConfig?: Record<string, number> | TimeConfigHandler;
    defaultTime: number;
}

export interface LastActivity {
    name: string;
    status: Status;
    lastTime: number;
    lastTimeHumanize: string;
    config: number;
    configHumanize: string;
}

export class LastActivityMonitorClient {
    private redis: IORedis.Redis;

    public constructor(
        private redisUri: string,
        private lastActivityKey: string
    ) {
        this.redis = new IoRedis(redisUri);
    }

    public async setLastActivity(name: string) {
        try {
            await this.redis.hset(this.lastActivityKey, name, now());
        } catch (e) {
            console.log('Error setting last activity ', e);
        }
    }
}

export class LastActivityMonitor {
    constructor(private lastActivityConfig: LastActivityConfig) {}

    public async check(): Promise<LastActivity[]> {
        try {
            const errorActivities: LastActivity[] = [];
            const okActivities: LastActivity[] = [];
            const defaultTime = this.lastActivityConfig.defaultTime;
            const redisClients = this.lastActivityConfig.redisConfigs.map(
                (r) => {
                    return new IoRedis(r.uri);
                }
            );
            const timeConfig =
                typeof this.lastActivityConfig.timeConfig === 'function'
                    ? await this.lastActivityConfig.timeConfig()
                    : this.lastActivityConfig.timeConfig;
            for (const client of redisClients) {
                const lastActivities = await client.hgetall(
                    this.lastActivityConfig.lastActivityKey
                );
                for (const [key, value] of Object.entries(lastActivities)) {
                    const lastActivity = parseInt(value);
                    const time = (timeConfig && timeConfig[key]) || defaultTime;
                    const status = LastActivityMonitor.checkTime(
                        lastActivity,
                        time
                    );
                    if (status) {
                        okActivities.push({
                            name: key,
                            status,
                            lastTime: lastActivity,
                            lastTimeHumanize: moment(
                                lastActivity * 1000
                            ).format('YYYY-MM-DD HH:mm:ss'),
                            config: time,
                            configHumanize:
                                moment.duration(time, 'seconds').humanize() ===
                                'a few seconds'
                                    ? `${time} s`
                                    : moment
                                          .duration(time, 'seconds')
                                          .humanize(),
                        });
                    } else {
                        errorActivities.push({
                            name: key,
                            status,
                            lastTime: lastActivity,
                            lastTimeHumanize: moment(
                                lastActivity * 1000
                            ).format('YYYY-MM-DD HH:mm:ss'),
                            config: time,
                            configHumanize:
                                moment.duration(time, 'seconds').humanize() ===
                                'a few seconds'
                                    ? `${time} s`
                                    : moment
                                          .duration(time, 'seconds')
                                          .humanize(),
                        });
                    }
                }
            }
            return [...errorActivities, ...okActivities];
        } catch (error) {
            console.log('Error getting last activities', error.message);
            return [];
        }
    }

    private static checkTime(lastActivity: number, limit: number): Status {
        const diff = now() - lastActivity;
        if (diff > limit) {
            return Status.ERROR;
        }
        return Status.OK;
    }
}
