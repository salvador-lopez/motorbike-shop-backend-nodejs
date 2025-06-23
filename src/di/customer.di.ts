import {container} from "tsyringe"
import {TypeOrmCustomerRepository} from "../database/typeorm/customer-repository";
import {RedisCustomerCache} from "../services/cache/redis/customer-redis";
import {InMemoryCustomerCache} from "../services/cache/inMemory/customer-in-memory";
import {CustomerDTO, CustomerService} from "../services/customer";
import {createClient, RedisClientType} from "redis";
import {getDefaultDataSource} from "../database/typeorm/data-source";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {DataSource, Repository} from "typeorm";
import {CustomerController} from "../controllers/rest/customer";
import {CustomerRepository} from "../domain/customer";
import {CustomerCache} from "../services/cache/customer-cache";
import {
    CUSTOMER_CACHE_TOKEN,
    CUSTOMER_REPOSITORY_TOKEN,
    CUSTOMER_TYPEORM_REPOSITORY_TOKEN,
    CUSTOMER_CACHE_INSTANCE_TOKEN,
    DATABASE_TOKEN
} from "./customer.tokens";


export async function registerCustomerDI() {
    const dataSource = await getDefaultDataSource();

    container.registerInstance<DataSource>(DATABASE_TOKEN, dataSource);

    const repositoryTypeORM: Repository<TypeOrmCustomer> = dataSource.getRepository(TypeOrmCustomer);

    container.registerInstance<Repository<TypeOrmCustomer>>(CUSTOMER_TYPEORM_REPOSITORY_TOKEN,
        repositoryTypeORM
    );
    container.register<CustomerRepository>(CUSTOMER_REPOSITORY_TOKEN, {useClass: TypeOrmCustomerRepository});

    if (process.env.CACHE_IMPL === 'redis') {
        const redisClient: RedisClientType = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

        await redisClient.connect();

        container.registerInstance<RedisClientType>(CUSTOMER_CACHE_INSTANCE_TOKEN, redisClient);
        container.register<CustomerCache>(CUSTOMER_CACHE_TOKEN, {
            useClass: RedisCustomerCache,
        });
    } else {
        container.registerInstance<Map<string,CustomerDTO>>(CUSTOMER_CACHE_INSTANCE_TOKEN, new Map<string,CustomerDTO>);

        container.register<CustomerCache>(CUSTOMER_CACHE_TOKEN, {
            useClass: InMemoryCustomerCache,
        });
    }

    container.register(CustomerService,{useClass: CustomerService});

    container.register(CustomerController,{useClass: CustomerController});
}

export {container}