
import {CustomerDTO} from "./customer";

export interface CustomerCache {
    set:(customer:CustomerDTO, ttl: number)=> Promise<void>;
    get:(id:string)=> Promise<CustomerDTO | null>;
    getAll:()=> Promise<CustomerDTO[]>;
}

export class CacheCustomerService implements CustomerCache {
    private cacheInMemory: Map<string, CustomerDTO> = new Map();

    async get(id: string): Promise<CustomerDTO | null> {
        return this.cacheInMemory.get(id) ?? null;
    }

    async getAll(): Promise<CustomerDTO[]> {
        return  [...this.cacheInMemory.values()]
    }

    async set(customerDto: CustomerDTO, ttl: number): Promise<void> {
        this.cacheInMemory.set(customerDto.id, customerDto);

        setTimeout(() => {
            this.cacheInMemory.delete(customerDto.id);
        }, ttl);
    }
}