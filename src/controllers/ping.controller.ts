import { inject, CoreBindings, ApplicationMetadata } from '@loopback/core';
import {
    get,
    response,
    ResponseObject,
} from '@loopback/rest';
import { authenticate } from '@loopback/authentication';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
    description: 'App Info Response',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                title: 'AppInfoResponse',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    version: { type: 'string' },
                }
            },
        },
    },
};


/**
 * A simple controller to get app metadata
 */
@authenticate('jwt')
export class PingController {
    constructor(@inject(CoreBindings.APPLICATION_METADATA) private meta: ApplicationMetadata) {}

    // Map to `GET /ping`
    @get('/ping')
    @response(200, PING_RESPONSE)
    ping(): object {
        // Reply with application information
        return {
            name: this.meta.name,
            version: this.meta.version,
            description: this.meta.description,
        };
    }
}
