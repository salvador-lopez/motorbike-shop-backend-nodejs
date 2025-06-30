import {CustomerCacheClearer} from "../customer-cache-clearer";
import {RedisClientType} from "redis";

export class RedisCustomerCacheClearer implements CustomerCacheClearer {
    private redis: RedisClientType;
    constructor( {
        redisClient
    }: { redisClient:RedisClientType }) {
        this.redis = redisClient;
    }
    async clear(): Promise<void> {
       await this.redis.flushAll();
    }

   async disconnect(): Promise<void> {
       await this.redis.quit();
    }
}