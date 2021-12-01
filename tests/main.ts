import { MonitorServer } from '../src/Monitor';
import { LastActivityMonitorClient } from '../src/LastActivityMonitor';

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
    await server.startServer(3000);
}

main().catch(console.log);
