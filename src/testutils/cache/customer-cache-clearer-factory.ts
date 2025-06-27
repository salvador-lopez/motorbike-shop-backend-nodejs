import {CustomerCacheClearer} from "./customer-cache-clearer";

export class CustomerCacheClearerFactory {
    private readonly inMemoryImpl: CustomerCacheClearer;
    private readonly redisImpl: CustomerCacheClearer;
    constructor(
        {
            inMemoryCustomerCacheClearer,
            redisCustomerCacheClearer
        }: {
            inMemoryCustomerCacheClearer: CustomerCacheClearer,
            redisCustomerCacheClearer: CustomerCacheClearer
        }
    ) {
        this.inMemoryImpl = inMemoryCustomerCacheClearer;
        this.redisImpl = redisCustomerCacheClearer;
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