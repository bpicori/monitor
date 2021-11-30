import { MongoClient } from 'mongodb';
import { Status } from './Monitor';

export interface MongoConfig {
    uri: string;
    name: string;
}

export interface MongoActivity {
    name: string;
    status: Status;
    errorMessage?: string;
}

export class MongoMonitor {
    public constructor(private config: MongoConfig[]) {}

    public async check(): Promise<MongoActivity[]> {
        return await Promise.all(
            this.config.map((c) => this.checkConnection(c))
        );
    }

    private async checkConnection(config: MongoConfig): Promise<MongoActivity> {
        try {
            const client: MongoClient = new MongoClient(config.uri, {
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
                errorMessage: error.message,
            };
        }
    }
}
