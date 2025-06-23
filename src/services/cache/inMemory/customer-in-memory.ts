import {CustomerDTO} from "../../customer";
import {CustomerCache} from "../customer-cache";
import {inject, injectable} from "tsyringe";
import {CUSTOMER_CACHE_INSTANCE_TOKEN} from "../../../di/customer.tokens";

@injectable()
export class InMemoryCustomerCache implements CustomerCache {
    private memory: Map<string, CustomerDTO>;

    constructor(@inject(CUSTOMER_CACHE_INSTANCE_TOKEN) memory: Map<string, CustomerDTO>) {
        this.memory = memory;
    }

    async get(id: string): Promise<CustomerDTO | null> {
        return this.memory.get(id) ?? null;
    }

    async getAll(): Promise<CustomerDTO[]> {
        return  [...this.memory.values()]
    }

    async set(customerDto: CustomerDTO, ttl: number): Promise<void> {
        this.memory.set(customerDto.id, customerDto);

        setTimeout(() => {
            this.memory.delete(customerDto.id);
        }, ttl * 1000);
    }
}