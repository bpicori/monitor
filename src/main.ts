import { MonitorServer } from './Monitor';
import { LastActivityMonitorClient } from './LastActivityMonitor';
import express from 'express';

async function main(): Promise<void> {
    const monitor = new LastActivityMonitorClient(
        'redis://localhost:6379',
        'LAST_ACTIVITY'
    );

    const server = new MonitorServer({
        lastActivity: {
            redisConfigs: [{ uri: 'redis://localhost:6379' }],
            lastActivityKey: 'LAST_ACTIVITY',
            timeConfig: () => {
                return {
                    request: 3,
                };
            },
            defaultTime: 3600,
        },
        mongo: [{ name: 'Local Mongo', uri: 'mongodb://localhost:27017' }],
        statusUrl: [
            { uri: 'https://google.com' },
            { uri: 'https://native.theoptimizer.io' },
        ],
    });
    const app = express();

    app.listen(3001, () => {
        console.log('Application started and Listening on port 3000');
    });

    app.get('/', async (req, res) => {
        res.send(await server.getStatus());
    });
}

main().catch(console.log);
