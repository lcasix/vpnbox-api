import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {IpinfoDataSource} from '../datasources';

export interface IpinfoService {
    ipinfo(): Promise<object>;
}

export class IpinfoServiceProvider implements Provider<IpinfoService> {
  constructor(
    // ipinfo must match the name property in the datasource json file
    @inject('datasources.ipinfo')
    protected dataSource: IpinfoDataSource = new IpinfoDataSource(),
  ) {}

  value(): Promise<IpinfoService> {
    return getService(this.dataSource);
  }
}
