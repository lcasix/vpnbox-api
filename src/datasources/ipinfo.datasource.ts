import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

const config = {
    name: 'ipinfo',
    connector: 'rest',
    baseURL: 'https://ipinfo.io/',
    crud: false,
    operations: [
        {
            template: {
                method: 'GET',
                url: 'https://ipinfo.io',
                headers: {
                    accepts: "application/json",
                    "content-type": "application/json",
                },
            },
            functions: {
                ipinfo: [],
            },
        },
    ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class IpinfoDataSource extends juggler.DataSource
    implements LifeCycleObserver {
    static dataSourceName = 'ipinfo';
    static readonly defaultConfig = config;

    constructor(
        @inject('datasources.config.ipinfo', { optional: true })
        dsConfig: object = config,
    ) {
        super(dsConfig);
    }
}
