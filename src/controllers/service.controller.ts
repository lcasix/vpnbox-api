import { authenticate } from '@loopback/authentication';
import { Model, model, property } from '@loopback/repository';
import { get, getModelSchemaRef, param, response, HttpErrors, patch, requestBody } from '@loopback/rest';
import { readdir } from 'fs/promises';
import path from 'path';

import util from 'util';
const exec = util.promisify(require('child_process').exec);

const NotFound = HttpErrors.NotFound;


@model()
export class Service extends Model {
    @property({
        description: 'Service identifier',
    })
    name: string;

    @property({
        description: 'Service state',
    })
    active: boolean;

    constructor(data?: Partial<Service>) {
        super(data);
    }
}

type ServiceState = Pick<Service, 'active'>;

/**
 * Build an OpenVPN template unit name from a service name.
 * @argument name the service simple name
 * @returns the corresponding OpenVPN unit name
 */
function unit(name: string): string {
    return 'openvpn@' + name;
}


@authenticate('jwt')
export class ServiceController {
    constructor() {}

    @get('/services')
    @response(200, {
        description: 'Array of available services',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                },
            },
        },
    })
    async services(): Promise<string[]> {
        const files = await readdir('/etc/openvpn');
        const services = files
            .filter(f => path.extname(f).toLowerCase() === '.conf')
            .map(f => path.basename(f, '.conf'))
        return services;
    }

    @get('/services/{name}')
    @response(200, {
        description: 'Information about a service',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Service)
            },
        },
    })
    async status(
        @param.path.string('name') id: string,
    ): Promise<Service> {
        const name: string | undefined = (await this.services()).find((i: string) => i === id);
        if (!name) throw new NotFound(`Service named '${id}' not found`);
        const service = new Service({ name });

        // the is-active command returns an exit code 0 if the unit is active, non-zero otherwise
        try {
            await exec('systemctl is-active --quiet ' + unit(name));
            service.active = true;
        } catch (e) {
            service.active = false;
        }
        return service;
    }

    @patch('/services/{name}')
    @response(204, {
        description: 'Service state change',
    })
    async manage(
        @param.path.string('name') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Service, {
                        title: 'ServiceState',
                        exclude: ['name'],
                    }),
                },
            },
        })
        state: ServiceState,
    ): Promise<void> {
        const service: Service = await this.status(id);
        // when rquested state is active service must be started
        const startRequested = state.active;
        // when rquested state is not active service must be stopped
        const stopRequested = !state.active;

        if (!service.active && startRequested) {
            // start service
            await exec('sudo systemctl start ' + unit(id));
        } else if (service.active && stopRequested) {
            // stop service
            await exec('sudo systemctl stop ' + unit(id));
        }
    }
}
