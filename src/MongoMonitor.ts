import { MongoClient } from 'mongodb';
import { hasMessage, IMonitor, IMonitorActivity } from '.';
import { Status } from './Monitor';

export interface MongoConfig {
    uri: string;
    name: string;
}

export class MongoMonitor implements IMonitor {
    public constructor(private config: MongoConfig[]) {}
    public category: string = 'MongoDB Health Check';

    public async check(): Promise<IMonitorActivity[]> {
        return await Promise.all(
            this.config.map((c) => this.checkConnection(c))
        );
    }

    private async checkConnection(
        config: MongoConfig
    ): Promise<IMonitorActivity> {
        let client: MongoClient | null = null;
        try {
            client = new MongoClient(config.uri, {
                serverSelectionTimeoutMS: 5 * 1000,
            });
            await client.connect();
            return {
                name: config.name,
                status: Status.OK,
            };
        } catch (error) {
            return {
                name: config.name,
                status: Status.ERROR,
                message: hasMessage(error) ? error.message : '',
                metadata: {},
            };
        } finally {
            if (client) {
                try {
                    /*
                     * Disconnect mongo
                     * */
                    await client.close();
                } catch (err) {
                    /*
                     * Ignore disconnect error
                     * */
                }
            }
        }
    }
}
