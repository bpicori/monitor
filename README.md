# Status Page Monitor

Status page monitor for monitoring URLs, databases, Kafka and last activities.

### Last Activities

This feature monitors a business logic like last select/insert in a database, or last login made from user you can use
this service. It uses redis for data storage, and the service ou are going to monitor needs a connection with it.

#### Example

Let's monitor the login of user. In the login handler of the server put this:

```typescript
import Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";

async function main() {
    const monitor = new LastActivityMonitorClient(
        'redis://localhost:6379',
        'LAST_ACTIVITY'
    );
    const server: Server = Hapi.server({
        port: process.env.PORT || 4000,
        host: '0.0.0.0',
    });
    server.route({
        method: 'POST',
        path: '/login',
        handler: async (req, h) => {
            // Login handler

            await monitor.setLastActivity('USER_LOGIN');
        },
    });
}

main().catch(console.log);
```
Then when configuring the monitor server, set the key USER_LOGIN to 600 (seconds). If for 10 minutes no one logged in than the alerts will fire.
```typescript
    const server = new MonitorServer({
        lastActivity: {
            redisConfigs: [{ uri: 'redis://localhost:6379' }],
            lastActivityKey: 'LAST_ACTIVITY',
            timeConfig: () => {
                return {
                    USER_LOGIN: 600,
                };
            },
            defaultTime: 3600,
        },
    });
    await server.startServer(3000);

```

#### Mongo, Kafka, URL

