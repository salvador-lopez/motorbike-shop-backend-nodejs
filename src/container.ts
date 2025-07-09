import {createContainer, asClass, asValue, InjectionMode, asFunction, AwilixContainer} from 'awilix';
import {CustomerService, CustomerDTO} from './application/services/customer';
import {CustomerController} from './controllers/rest/customer';
import {RedisCustomerCache} from './application/services/cache/redis/customer-redis';
import {InMemoryCustomerCache} from './application/services/cache/inMemory/customer-in-memory';
import {createClient} from 'redis';
import { DataSource} from 'typeorm';
import { TypeOrmCustomer} from './database/typeorm/data-model';
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomerRepository} from "./database/typeorm/customer-repository";
import {defaultDataSource, testDataSource} from "./database/typeorm/data-source";
import {NoOpCustomerCacheClearer} from "./testutils/cache/customer-cache-clearer";
import {RedisCustomerCacheClearer} from "./testutils/cache/redis/customer-cache-clearer";
import {InMemoryCustomerCacheClearer} from "./testutils/cache/inMemory/customer-cache-clearer";
import {CustomerCacheClearerFactory} from "./testutils/cache/customer-cache-clearer-factory";
import {Bus} from "@node-ts/bus-core";
import {AwilixContainerAdapter} from "./messaging/node-ts-bus/awilix-container-adapter";
import {CreateCustomerHandler} from "./application/command/commands/create-customer";

const registerTestServices = (container: AwilixContainer): void => {
    container.register({
        customerCacheClearerFactory: asClass(CustomerCacheClearerFactory)
    });

    if (container.resolve('cacheImpl') === 'redis') {
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

const registerCustomerCache = async (container: AwilixContainer) => {
    if (container.resolve('cacheImpl') === 'redis') {
        const redisClient = createClient({
            url: process.env.REDIS_URL,
        });
        await redisClient.connect();
        container.register(
            {
                redisCustomerPrefix: asValue(process.env.REDIS_CUSTOMER_PREFIX),
                redisClient: asValue(redisClient),
                customerCache: asClass(RedisCustomerCache).scoped(),
            }
        );
    }

    const customerCacheMemory = new Map<string, CustomerDTO>();
    container.register({customerCacheMemory: asClass(RedisCustomerCache).scoped()});

    container.register(
        {
            customerCacheMemory: asValue(customerCacheMemory),
            customerCache: asClass(InMemoryCustomerCache).scoped(),
        }
    );

    return new InMemoryCustomerCache({customerCacheMemory: customerCacheMemory});
}

const getCustomerRepositoryConn = ({ dataSource }: { dataSource: DataSource }): Repository<TypeOrmCustomer> => {
    return dataSource.getRepository(TypeOrmCustomer);
}

const registerCommandBus = async (container: AwilixContainer) => {
    container.register({
        createCustomerHandler: asFunction(
            ({ customerService }) => new CreateCustomerHandler(customerService)
        ).scoped(),
    });

    const commandBus = Bus.configure()
        .withContainer(new AwilixContainerAdapter(container))
        .withHandler(CreateCustomerHandler)
        .build();

    await commandBus.initialize();
    await commandBus.start()

    container.register({
        commandBus: asValue(commandBus)
    })
}

export const createAppContainer = async () => {
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
    });

    const env = process.env.NODE_ENV;

    const cacheImpl = process.env.CACHE_IMPL ?? 'inMemory';
    container.register({cacheImpl: asValue(cacheImpl)});

    let dataSource: DataSource = defaultDataSource;
    if (env === 'test') {
        dataSource = testDataSource;
        registerTestServices(container);
    }

    await dataSource.initialize();

    container.register({
        dataSource: asValue(dataSource),
        customerRepositoryConn: asFunction(getCustomerRepositoryConn).scoped(),
        customerRepository: asClass(TypeOrmCustomerRepository).scoped(),
        customerService: asClass(CustomerService).scoped(),
        customerController: asClass(CustomerController).scoped(),
    });

    await registerCustomerCache(container);
    await registerCommandBus(container);

    return container;
};
