import { v4 as uuidv4 } from 'uuid';
import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';
import { Status } from './Monitor';

export type KafkaMonitorConfig = {
    name: string;
    consumerGroupName: string;
    testTopicName: string;
    timeout: number;
} & KafkaConfig;

export interface KafkaActivity {
    name: string;
    status: Status;
    errorMessage?: string;
}

export class KafkaMonitor {
    private isConnected: boolean;
    private producer: Producer | null;
    private consumer: Consumer | null;
    private rpcCallbacks: {
        [correlationId: string]: (err?: Error) => void;
    } = {};
    private kafka: Kafka;

    public constructor(private config: KafkaMonitorConfig) {
        this.isConnected = false;
        this.producer = null;
        this.consumer = null;
        this.kafka = new Kafka(config);
    }

    public async check(): Promise<KafkaActivity> {
        if (!this.isConnected) {
            this.producer = this.kafka.producer();
            await this.producer.connect();
            this.consumer = this.kafka.consumer({
                groupId: this.config.consumerGroupName,
            });
            await this.consumer.connect();
            this.isConnected = true;
            await this.consumer.subscribe({
                topic: this.config.testTopicName,
            });
            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    const key = message.key.toString();
                    if (this.rpcCallbacks[key]) {
                        this.rpcCallbacks[key]();
                        delete this.rpcCallbacks[key];
                    }
                },
            });
        }
        try {
            await this.rpc();
            return {
                name: this.config.name,
                status: Status.OK,
            };
        } catch (err) {
            return {
                name: this.config.name,
                status: Status.ERROR,
            };
        }
    }

    private async rpc(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const correlationId = uuidv4();
            this.rpcCallbacks[correlationId] = (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            };
            setTimeout(() => {
                if (this.rpcCallbacks[correlationId]) {
                    this.rpcCallbacks[correlationId](new Error('RPC TIMEOUT'));
                    delete this.rpcCallbacks[correlationId];
                }
            }, this.config.timeout);
            await this.producer?.send({
                topic: this.config.testTopicName,
                messages: [{ key: correlationId, value: '' }],
            });
        });
    }
}
