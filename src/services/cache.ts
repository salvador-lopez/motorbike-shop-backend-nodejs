
import {CustomerDTO} from "./customer";

export interface CustomerCache {
    set:(customer:CustomerDTO, ttl: number)=> Promise<void>;
    get:(id:string)=> Promise<CustomerDTO | null>;
    getAll:()=> Promise<CustomerDTO[]>;
}

export class InMemoryCustomerCache implements CustomerCache {
    private memory: Map<string, CustomerDTO>;

    constructor(memory: Map<string, CustomerDTO>) {
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