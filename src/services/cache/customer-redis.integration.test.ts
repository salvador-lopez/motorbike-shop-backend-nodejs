import {createClient, RedisClientType} from 'redis'
import {RedisCustomerCache} from "./customer-redis";
import {CustomerDTO} from "../customer";
import { v4 as UUID} from 'uuid';

describe("Customer Redis Integration Test", () => {
  const id = UUID();
  let redisClient: RedisClientType;
  let redisCustomer: RedisCustomerCache;
  let prefixKey: string = 'customers:'

  function generateKey(paramId: string) {
    return `${prefixKey}${paramId}`
  }

  afterEach(async () => {
    const keys = await redisClient.keys(`${prefixKey}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

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

    it('get by id',async()=> {
        const customerDTO = new CustomerDTO(id,'email@example.com',0);

        await redisClient.set(generateKey(customerDTO.id),JSON.stringify(customerDTO));

        expect(await redisCustomer.get(customerDTO.id)).toEqual(
            customerDTO
        )
    })

    it('Should cache customer dto', async()=> {
        const customerDTO = new CustomerDTO(id,'email@example.com',0);

        await redisCustomer.set(customerDTO, 10);

      expect(await redisClient.get(generateKey(customerDTO.id))).toEqual(
        JSON.stringify(customerDTO)
      )
    })


    it('Should get all customers dto', async()=> {
        const customerDTO1 = new CustomerDTO(id,'email1@example.com',1);
        const customerDTO2 = new CustomerDTO(UUID(),'email2@example.com',2);

        await redisClient.set(generateKey(customerDTO1.id),JSON.stringify(customerDTO1));
        await redisClient.set(generateKey(customerDTO2.id),JSON.stringify(customerDTO2));

        const result = await redisCustomer.getAll();
        expect(result.sort((a,b) => a.availableCredit - b.availableCredit)).toEqual(
            [customerDTO1,customerDTO2].sort((a,b) => a.availableCredit - b.availableCredit)
        )
    })

    it('Should set correct TTL', async () => {
      const customerDTO = new CustomerDTO(id, 'email@example.com', 0)
      const ttl = 10
      await redisCustomer.set(customerDTO, ttl)

      const ttlSet = await redisClient.ttl(generateKey(customerDTO.id))

      expect(ttlSet).toEqual(ttl)
    })
  })