import {CustomerCache} from "./customer-cache";
import {CustomerDTO} from "../customer";
import {RedisClientType} from 'redis'

export class RedisCustomerCache implements CustomerCache {
    private redisClient: RedisClientType;
    protected readonly prefix

    constructor(redisClient: RedisClientType, prefix: string = "customers:") {
        this.redisClient = redisClient;
        this.prefix = prefix;
    }

    async get(id: string): Promise<CustomerDTO | null> {
        const customer = await this.redisClient.get(`${this.prefix}${id}`);

        if(!customer) return null;

        return JSON.parse(customer) as CustomerDTO;
    }

    getAll(): Promise<CustomerDTO[]> {
        throw new Error("Method not implemented.");

    }

    /**
     *
     * @param customer - The customer DTO object.
     * @param ttl - Time to live (TTL) in seconds.
     */
    async set(customer: CustomerDTO, ttl: number): Promise<void> {
        const key = `${this.prefix}${customer.id}`;
        await this.redisClient.set(key, JSON.stringify(customer),{ EX: ttl });
    }


}

