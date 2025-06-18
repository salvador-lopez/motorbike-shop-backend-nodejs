import {CustomerCacheClearer} from "./customer-cache-clearer";

export class CustomerCacheClearerFactory {
    private readonly inMemoryImpl: CustomerCacheClearer;
    private readonly redisImpl: CustomerCacheClearer;
    constructor(inMemoryImpl: CustomerCacheClearer, redisImpl: CustomerCacheClearer) {
        this.inMemoryImpl = inMemoryImpl;
        this.redisImpl = redisImpl;
    }

    create(cacheImpl: string): CustomerCacheClearer {
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