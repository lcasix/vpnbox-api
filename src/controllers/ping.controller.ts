import { service } from '@loopback/core';
import {
    get,
    response,
    ResponseObject,
} from '@loopback/rest';
import { AppInfo, ConfigurationService } from '../services/configuration.service';
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
    constructor(@service(ConfigurationService) private config: ConfigurationService) {}

    // Map to `GET /ping`
    @get('/ping')
    @response(200, PING_RESPONSE)
    ping(): AppInfo {
        // Reply with application information
        return this.config.appInfo();
    }
}
