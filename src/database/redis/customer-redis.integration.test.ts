import {createClient, RedisClientType} from 'redis'
import {RedisCustomerCache} from "./customer-redis";
import {CustomerDTO} from "../../services/customer";
import { v4 as UUID} from 'uuid';

let redisClient: RedisClientType;
let redisCustomer: RedisCustomerCache;

beforeEach(async () => {
   await redisClient.flushAll();
});

beforeAll(async () => {
redisClient =  createClient({
    url:'redis://localhost:6379'
})

    await redisClient.connect();
    redisCustomer = new RedisCustomerCache(redisClient);
});

afterAll(async () => {
    await redisClient.quit();

});

describe("Customer Redis Integration Test", () => {

    it('get by id',async()=> {
        const customerDTO = new CustomerDTO(UUID(),'email@example.com',0);

        await redisClient.set(customerDTO.id,JSON.stringify(customerDTO));

        expect(await redisCustomer.get(customerDTO.id)).toEqual(
            customerDTO
        )
    })

})