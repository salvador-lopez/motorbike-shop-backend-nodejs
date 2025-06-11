import {CustomerCache} from "./customer-cache";
import {CustomerDTO} from "../customer";
import {RedisClientType} from 'redis'

export class RedisCustomerCache implements CustomerCache {
    private redisClient: RedisClientType;

    constructor(redisClient: RedisClientType) {
        this.redisClient = redisClient;
    }

    async get(id: string): Promise<CustomerDTO | null> {
        const customer = await this.redisClient.get(id);

        if(!customer) return null;

        return JSON.parse(customer) as CustomerDTO;
    }

    getAll(): Promise<CustomerDTO[]> {
        throw new Error("Method not implemented.");

    }

    set(customer: CustomerDTO, ttl: number): Promise<void> {
        throw new Error("Method not implemented.");
    }


}

