import { IMonitorActivity } from '.';
import { MonitorServer, Status } from './Monitor';
import { StatusUrlMonitor } from './StatusUrlMonitor';

async function main(): Promise<void> {
    const server = new MonitorServer({
        monitors: [
            new StatusUrlMonitor([
                { uri: 'https://google.com' },
                { uri: 'https://native.theoptimizer.io' },
                {
                    uri: 'https://webeasyhit.com/cf/r',
                    allowedStatusCodes: [404],
                },
                {
                    uri: 'https://globalvisitclub.com/cf/r',
                },
            ]),
            {
                category: 'Custom Domain Check',
                check: async (): Promise<IMonitorActivity> => {
                    await new Promise<void>((resolve) =>
                        setTimeout(resolve, 1000)
                    );
                    return Promise.resolve({
                        name: 'https://webeasyhit.com',
                        status: Status.OK,
                        message: 'OK',
                    });
                },
            },
            {
                category: 'Custom Domain Check',
                check: async (): Promise<IMonitorActivity> => {
                    await new Promise<void>((resolve) =>
                        setTimeout(resolve, 1000)
                    );
                    return Promise.resolve({
                        name: 'https://globalvisitclub.com',
                        status: Status.ERROR,
                        message: 'ERROR',
                    });
                },
            },
        ],
    });
    await server.startServer(3000);
}

main().catch(console.log);
