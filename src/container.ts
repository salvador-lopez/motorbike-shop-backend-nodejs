import {createContainer, asClass, asValue, InjectionMode, asFunction} from 'awilix';
import { CustomerService, CustomerDTO } from './services/customer';
import { CustomerController } from './controllers/rest/customer';
import { RedisCustomerCache } from './services/cache/redis/customer-redis';
import { CustomerCache } from './services/cache/customer-cache';
import { InMemoryCustomerCache } from './services/cache/inMemory/customer-in-memory';
import { createClient, RedisClientType } from 'redis';
import { DataSource } from 'typeorm';
import { TypeOrmCustomer } from './database/typeorm/datamodel/customer';
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomerRepository} from "./database/typeorm/customer-repository";
import {defaultDataSource, testDataSource} from "./database/typeorm/data-source";
import {NoOpCustomerCacheClearer} from "./testutils/cache/customer-cache-clearer";
import {RedisCustomerCacheClearer} from "./testutils/cache/redis/customer-cache-clearer";
import {InMemoryCustomerCacheClearer} from "./testutils/cache/inMemory/customer-cache-clearer";
import {CustomerCacheClearerFactory} from "./testutils/cache/customer-cache-clearer-factory";
import {TypeOrmPurchaseOrder} from "./database/typeorm/datamodel/purchase-order";
import {TypeOrmPurchaseOrderRepository} from "./database/typeorm/purchase-order-repository";
import {PurchaseOrderController} from "./controllers/rest/purchase-order";
import {PurchaseOrderService} from "./services/purchase-order";
import {TypeOrmTransactionManager} from "./database/typeorm/transaction-manager";

export const createAppContainer = async () => {
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
    });
    
    const env = process.env.NODE_ENV;
    const cacheImpl = process.env.CACHE_IMPL ?? 'inMemory';

    const registerTestServices = (): void => {
        container.register({
            customerCacheClearerFactory: asClass(CustomerCacheClearerFactory)
        });
        
        if (cacheImpl === 'redis') {
            container.register({
                inMemoryCustomerCacheClearer: asClass(NoOpCustomerCacheClearer),
                redisCustomerCacheClearer: asClass(RedisCustomerCacheClearer)
            });
            return;
        }
        
        container.register({
            inMemoryCustomerCacheClearer: asClass(InMemoryCustomerCacheClearer),
            redisCustomerCacheClearer: asClass(NoOpCustomerCacheClearer)
        });
    }

    let dataSource: DataSource = defaultDataSource;
    if (env === 'test') {
        dataSource = testDataSource;
        registerTestServices();
    }
    
    await dataSource.initialize();

    const getCustomerRepositoryConn = (): Repository<TypeOrmCustomer> => {
        return dataSource.getRepository(TypeOrmCustomer);
    }

    const getPurchaseOrderRepositoryConn = (): Repository<TypeOrmPurchaseOrder> => {
        return dataSource.getRepository(TypeOrmPurchaseOrder);
    }
    
    const customerCacheMemory = new Map<string, CustomerDTO>();
    let redisClient: RedisClientType;

    if (cacheImpl === 'redis') {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        await redisClient.connect();
        container.register({ redisClient: asValue(redisClient) });
    } else {
        container.register({ customerCacheMemory: asValue(customerCacheMemory) });
    }

    const makeCustomerCache = (): CustomerCache => {
        if (cacheImpl === 'redis') {
            return new RedisCustomerCache({redisClient: redisClient});
        } else {
            return new InMemoryCustomerCache({customerCacheMemory: customerCacheMemory});
        }
    }

    container.register({
        dataSource: asValue(dataSource),
        customerRepositoryConn: asFunction(getCustomerRepositoryConn).scoped(),
        customerRepository: asClass(TypeOrmCustomerRepository).scoped(),
        purchaseOrderRepositoryConn: asFunction(getPurchaseOrderRepositoryConn).scoped(),
        transactionManager: asClass(TypeOrmTransactionManager).scoped(),
        purchaseOrderRepository: asClass(TypeOrmPurchaseOrderRepository).scoped(),
        customerCache: asFunction(makeCustomerCache).scoped(),
        customerService: asClass(CustomerService).scoped(),
        customerController: asClass(CustomerController).scoped(),
        purchaseOrderController: asClass(PurchaseOrderController).scoped(),
        purchaseOrderService: asClass(PurchaseOrderService).scoped(),
        unitOfWork: asFunction(({ transactionManager }) => transactionManager).scoped(),
    });

    return container;
};
