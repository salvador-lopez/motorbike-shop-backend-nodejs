import {ContainerAdapter} from "@node-ts/bus-core";
import {AwilixContainer} from "awilix";

export class AwilixContainerAdapter implements ContainerAdapter {
    constructor(private readonly container: AwilixContainer) {}

    get<T>(type: new (...args: any[]) => T): T {
        const name = type.name.charAt(0).toLowerCase() + type.name.slice(1);
        return this.container.resolve<T>(name);
    }
}