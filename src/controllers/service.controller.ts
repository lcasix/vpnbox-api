import { authenticate } from '@loopback/authentication';
import { Model, model, property } from '@loopback/repository';
import { get, getModelSchemaRef, response } from '@loopback/rest';
import { readdir } from 'fs/promises';
import path from 'path';


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

    constructor(data?: Partial<Service>) {
        super(data);
    }
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
                    items: getModelSchemaRef(Service),
                }
            }
        }
    })
    async services(): Promise<Service[]> {
        const files = await readdir('/etc/openvpn');
        const services = files
            .filter(f => path.extname(f).toLowerCase() === '.conf')
            .map(f => path.basename(f, '.conf'))
            .map(service => new Service({ name: service, uri: '/services/' + service }))
        return services;
    }
}
