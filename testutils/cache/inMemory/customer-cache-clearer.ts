import {CustomerCacheClearer} from "../customer-cache-clearer";
import {CustomerDTO} from "../../../src/services/customer";

export class InMemoryCustomerCacheClearer implements CustomerCacheClearer {
    private memory: Map<string, CustomerDTO>;

    constructor(memory: Map<string, CustomerDTO>) {
        this.memory = memory;
    }

    async clear(): Promise<void> {
        this.memory.clear();
    }

  async disconnect(): Promise<void> {
       this.memory.clear();
    }
}