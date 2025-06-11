import {createClient, RedisClientType} from 'redis'
import {RedisCustomerCache} from "./customer-redis";
import {CustomerDTO} from "../customer";
import { v4 as UUID} from 'uuid';

let redisClient: RedisClientType;
let redisCustomer: RedisCustomerCache;
let prefixKey: string = 'customers:'

afterEach(async () => {
   await redisClient.flushAll();
});

beforeAll(async () => {
redisClient =  createClient({
    url:'redis://localhost:6379'
})

    await redisClient.connect();
    redisCustomer = new RedisCustomerCache(redisClient, prefixKey);
});

afterAll(async () => {
    await redisClient.quit();

});

describe("Customer Redis Integration Test", () => {

    it('get by id',async()=> {
        const customerDTO = new CustomerDTO(UUID(),'email@example.com',0);

        await redisClient.set(`${prefixKey}${customerDTO.id}`,JSON.stringify(customerDTO));

        expect(await redisCustomer.get(customerDTO.id)).toEqual(
            customerDTO
        )
    })

    it('Should cache customer dto', async()=> {
        const customerDTO = new CustomerDTO(UUID(),'email@example.com',0);

        await redisCustomer.set(customerDTO, 10);

        expect(await redisClient.get(`${prefixKey}${customerDTO.id}`)).toEqual(
            JSON.stringify(customerDTO)
        )
    })


    it('Should get all customers dto', async()=> {
        const customerDTO1 = new CustomerDTO(UUID(),'email1@example.com',1);
        const customerDTO2 = new CustomerDTO(UUID(),'email2@example.com',2);
        const customerDTO3 = new CustomerDTO(UUID(),'email3@example.com',3);

        await redisClient.set(`${prefixKey}${customerDTO1.id}`,JSON.stringify(customerDTO1));
        await redisClient.set(`${prefixKey}${customerDTO3.id}`,JSON.stringify(customerDTO3));
        await redisClient.set(`${prefixKey}${customerDTO2.id}`,JSON.stringify(customerDTO2));

        const result = await redisCustomer.getAll();
        expect(result.sort((a,b) => a.availableCredit - b.availableCredit)).toEqual(
            [customerDTO1, customerDTO2, customerDTO3].sort((a,b) => a.availableCredit + b.availableCredit)
        )
    })

})