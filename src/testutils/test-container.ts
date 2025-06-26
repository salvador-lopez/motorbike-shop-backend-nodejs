import {asClass} from 'awilix';
import {createAppContainer} from "../container";
import {testDataSource} from "../database/typeorm/data-source";
import {RedisCustomerCacheClearer} from "./cache/redis/customer-cache-clearer";
import {InMemoryCustomerCacheClearer} from "./cache/inMemory/customer-cache-clearer";
import {NoOpCustomerCacheClearer} from "./cache/customer-cache-clearer";
import {CustomerCacheClearerFactory} from "./cache/customer-cache-clearer-factory";

export const createAppTestContainer = async () => {
    const container = await createAppContainer(testDataSource);

    const cacheImpl = process.env.CACHE_IMPL ?? 'inMemory';

    if (cacheImpl === 'redis') {
        container.register({
            inMemoryCustomerCacheClearer: asClass(NoOpCustomerCacheClearer),
            redisCustomerCacheClearer: asClass(RedisCustomerCacheClearer)
        });
    } else {
        container.register({
            inMemoryCustomerCacheClearer: asClass(InMemoryCustomerCacheClearer),
            redisCustomerCacheClearer: asClass(NoOpCustomerCacheClearer)
        });
    }

    container.register({
        customerCacheClearerFactory: asClass(CustomerCacheClearerFactory)
    });

    return container;
};
