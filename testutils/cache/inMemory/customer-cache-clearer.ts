import {CustomerCacheClearer} from "../customer-cache-clearer";
import {CustomerDTO} from "../../../src/services/customer";

export class InMemoryCustomerCacheClearer implements CustomerCacheClearer {
    private memory: Map<string, CustomerDTO>;

    constructor(memory: Map<string, CustomerDTO>) {
        this.memory = memory;
    }

    async clear(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}