import { inject } from '@loopback/core';
import {
    get,
    response,
    ResponseObject,
} from '@loopback/rest';
import { IpinfoService } from "../services";

/**
 * OpenAPI response for getIpInfo()
 */
const IPINFO_RESPONSE: ResponseObject = {
    description: 'Ipinfo Response',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                title: 'IpinfoResponse',
                properties: {
                    ip: {type: 'string'},
                    hostname: {type: 'string'},
                    city: {type: 'string'},
                    region: {type: 'string'},
                    country: {type: 'string'},
                    loc: {type: 'string'},
                    org: {type: 'string'},
                    postal: {type: 'string'},
                    timezone: {type: 'string'},
                }
            }
        }
    }
}


export class IpController {
    constructor(
        @inject('services.IpinfoService')
        protected ipinfoService: IpinfoService,
    ) {}

    @get('/ipinfo')
    @response(200, IPINFO_RESPONSE)
    async getIpInfo(): Promise<object> {
        return await this.ipinfoService.ipinfo();
    }
}
