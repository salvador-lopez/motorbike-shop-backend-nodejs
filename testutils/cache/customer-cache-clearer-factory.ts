import {RedisCustomerCacheClearer} from "./redis/customer-cache-clearer";
import {InMemoryCustomerCacheClearer} from "./inMemory/customer-cache-clearer";

export class CustomerCacheClearerFactory {
    private readonly inMemoryImpl: InMemoryCustomerCacheClearer;
    private readonly redisImpl: RedisCustomerCacheClearer;
    constructor(inMemoryImpl: InMemoryCustomerCacheClearer, redisImpl: RedisCustomerCacheClearer) {
        this.inMemoryImpl = inMemoryImpl;
        this.redisImpl = redisImpl;
    }

    create(cacheImpl: string): CacheClearer {
        switch (cacheImpl) {
            case 'redis':
                return this.redisImpl;
            case 'inMemory':
                return this.inMemoryImpl;
            default:
                throw new Error(`Unsupported CACHE_IMPL: ${cacheImpl}`);
        }
    }
}