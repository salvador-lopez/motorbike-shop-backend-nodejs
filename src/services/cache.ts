
import {CustomerDTO} from "./customer";

export interface CustomerCache {
    set:(customer:CustomerDTO, ttl: number)=> Promise<void>;
    get:(id:string)=> Promise<CustomerDTO | null>;
    getAll:()=> Promise<CustomerDTO[]>;
}

export class InMemoryCustomerCache implements CustomerCache {
    private cache: Map<string, CustomerDTO> = new Map();

    async get(id: string): Promise<CustomerDTO | null> {
        return this.cache.get(id) ?? null;
    }

    async getAll(): Promise<CustomerDTO[]> {
        return  [...this.cache.values()]
    }

    async set(customerDto: CustomerDTO, ttl: number): Promise<void> {
        this.cache.set(customerDto.id, customerDto);

        setTimeout(() => {
            this.cache.delete(customerDto.id);
        }, ttl);
    }
}