import {createContainer, asClass, asValue, InjectionMode, asFunction} from 'awilix';
import { CustomerService, CustomerDTO } from './services/customer';
import { CustomerController } from './controllers/rest/customer';
import { RedisCustomerCache } from './services/cache/redis/customer-redis';
import { CustomerCache } from './services/cache/customer-cache';
import { InMemoryCustomerCache } from './services/cache/inMemory/customer-in-memory';
import { createClient, RedisClientType } from 'redis';
import { DataSource } from 'typeorm';
import { TypeOrmCustomer } from './database/typeorm/data-model';
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomerRepository} from "./database/typeorm/customer-repository";

export const createAppContainer = async (dataSource: DataSource) => {
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
    });

    await dataSource.initialize();

    const cacheImpl = process.env.CACHE_IMPL ?? 'inMemory';

    const getCustomerRepositoryConn = (): Repository<TypeOrmCustomer> => {
        return dataSource.getRepository(TypeOrmCustomer);
    }

    let redisClient: RedisClientType;
    if (cacheImpl === 'redis') {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        await redisClient.connect();
        container.register({ redisClient: asValue(redisClient) });
    }

    const makeCustomerCache = (): CustomerCache => {
        if (cacheImpl === 'redis') {
            return new RedisCustomerCache({redisClient: redisClient});
        } else {
            return new InMemoryCustomerCache({memory: new Map<string, CustomerDTO>()});
        }
    }

    container.register({
        dataSource: asValue(dataSource),
        customerRepositoryConn: asFunction(getCustomerRepositoryConn).scoped(),
        customerRepository: asClass(TypeOrmCustomerRepository).scoped(),
        customerCache: asFunction(makeCustomerCache).scoped(),
        customerService: asClass(CustomerService).scoped(),
        customerController: asClass(CustomerController).scoped(),
    });

    return container;
};
