import {CustomerCache} from "../customer-cache";
import {CustomerDTO} from "../../customer";
import {RedisClientType} from 'redis'

export class RedisCustomerCache implements CustomerCache {
    private redisClient: RedisClientType;
    protected readonly prefix

    constructor({redisClient, redisCustomerPrefix}: {redisClient: RedisClientType, redisCustomerPrefix: string}) {
        this.redisClient = redisClient;
        this.prefix = redisCustomerPrefix;
    }

    async get(id: string): Promise<CustomerDTO | null> {
        const customer = await this.redisClient.get(`${this.prefix}${id}`);

        if(!customer) return null;

        return JSON.parse(customer) as CustomerDTO;
    }

    async getAll(): Promise<CustomerDTO[]> {
        let cursor = 0;
        const keys: string[] = [];
        do {
            const result = await this.redisClient.scan(cursor, {
                MATCH: `${this.prefix}*`,
                COUNT: 100
            });
            cursor = result.cursor;
            keys.push(...result.keys);
        } while (cursor !== 0);

        if (keys.length === 0) {
            return [];
        }

        const values = await this.redisClient.mGet(keys);
        return values.reduce<CustomerDTO[]>((acc, value) => {
            if (value !== null) {
                acc.push(JSON.parse(value) as CustomerDTO);
            }
            return acc;
        },[])
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