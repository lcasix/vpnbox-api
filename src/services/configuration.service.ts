import { injectable, inject, BindingScope, CoreBindings, ApplicationMetadata } from '@loopback/core';


export class AppInfo {
    constructor(
        public name: string,
        public version: string,
        public description: string,
    ) {}
}

@injectable({ scope: BindingScope.TRANSIENT })
export class ConfigurationService {
    constructor(@inject(CoreBindings.APPLICATION_METADATA) private metadata: ApplicationMetadata) {}

    public appInfo(): AppInfo {
        return new AppInfo(
            this.metadata.name,
            this.metadata.version,
            this.metadata.description,
        );
    }
}
