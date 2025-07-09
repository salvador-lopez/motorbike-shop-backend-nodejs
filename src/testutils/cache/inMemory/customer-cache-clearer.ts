import {CustomerCacheClearer} from "../customer-cache-clearer";
import {CustomerDTO} from "../../../application/services/customer";

export class InMemoryCustomerCacheClearer implements CustomerCacheClearer {
    private memory: Map<string, CustomerDTO>;

    constructor({customerCacheMemory}: {customerCacheMemory: Map<string, CustomerDTO>}) {
        this.memory = customerCacheMemory;
    }

    async clear(): Promise<void> {
        this.memory.clear();
    }

    async disconnect(): Promise<void> {
    }
}