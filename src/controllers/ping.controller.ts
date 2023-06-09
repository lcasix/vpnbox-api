import { inject, CoreBindings, ApplicationMetadata } from '@loopback/core';
import {
    get,
    response,
    ResponseObject,
} from '@loopback/rest';
import { authenticate } from '@loopback/authentication';
import _ from 'lodash';

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
                    author: { type: 'string' },
                    homepage: { type: 'string' },
                }
            },
        },
    },
};

type AppInfo = Pick<ApplicationMetadata, 'name' | 'version' | 'description' | 'author' | 'homepage'>;

/**
 * A simple controller to get app metadata
 */
@authenticate('jwt')
export class PingController {
    constructor(@inject(CoreBindings.APPLICATION_METADATA) private meta: ApplicationMetadata) {}

    // Map to `GET /ping`
    @get('/ping')
    @response(200, PING_RESPONSE)
    ping(): AppInfo {
        // Reply with application information
        return _.pick(this.meta, ['name', 'version', 'description', 'author', 'homepage']);
    }
}
