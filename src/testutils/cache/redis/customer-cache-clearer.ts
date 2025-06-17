import {CustomerCacheClearer} from "../customer-cache-clearer";
import {RedisClientType} from "redis";

export class RedisCustomerCacheClearer implements CustomerCacheClearer {
    constructor(private redis:RedisClientType) {
    }
    async clear(): Promise<void> {
       await this.redis.flushAll();
    }

   async disconnect(): Promise<void> {
       await this.redis.quit();
    }
}