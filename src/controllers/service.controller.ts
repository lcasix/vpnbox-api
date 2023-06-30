import { authenticate } from '@loopback/authentication';
import { Model, model, property } from '@loopback/repository';
import { get, getModelSchemaRef, param, response, HttpErrors } from '@loopback/rest';
import { readdir } from 'fs/promises';
import path from 'path';
import _ from 'lodash';

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
        description: 'Service relative URI',
    })
    uri: string;

    @property({
        description: 'Service state',
    })
    active: boolean;

    constructor(data?: Partial<Service>) {
        super(data);
    }
}

type ServiceMeta = Omit<Service, 'active'>;


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
                    items: getModelSchemaRef(Service, {
                        title: 'ServiceInfo',
                        exclude: ['active'],
                    }),
                },
            },
        },
    })
    async services(): Promise<ServiceMeta[]> {
        const files = await readdir('/etc/openvpn');
        const services = files
            .filter(f => path.extname(f).toLowerCase() === '.conf')
            .map(f => path.basename(f, '.conf'))
            .map(service => new Service({ name: service, uri: '/services/' + service }))
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
        const meta: ServiceMeta | undefined = _(await this.services()).find({ 'name': id });
        if (!meta) throw new NotFound(`Service named '${id}' not found`);
        const service = new Service(meta);

        // the is-active command returns an exit code 0 if the unit is active, non-zero otherwise
        try {
            await exec('systemctl is-active --quiet openvpn@' + id);
            service.active = true;
        } catch(e) {
            service.active = false;
        }
        return service;
    }
}
