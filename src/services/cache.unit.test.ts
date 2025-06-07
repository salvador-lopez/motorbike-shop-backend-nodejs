import {v4 as UUID} from "uuid";
import {CustomerDTO} from "./customer";
import {InMemoryCustomerCache, CustomerCache} from "./cache";

let cacheService: CustomerCache;

const ttl = 10000;

beforeEach(async () => {
    jest.useFakeTimers();
    cacheService = new InMemoryCustomerCache();

});

afterEach(async () => {
    expireCache();
    jest.useRealTimers();
});

function expireCache() {
    jest.advanceTimersByTime(ttl);
    jest.runOnlyPendingTimers();
}

describe("InMemoryCustomerCache", () => {

    it("should cache a customerDto", async () => {
        const id = UUID()
        const email = "email@example.com";
        const availableCredit = 0;
        const expectedCustomerDTO = new CustomerDTO(id, email,availableCredit);

        await cacheService.set(expectedCustomerDTO, ttl);

        const customerCachedDTO = await cacheService.get(id);

        expect(customerCachedDTO).toBe(expectedCustomerDTO);
    });

    it("should get all customerDto cached", async () => {
        const customerDTO1 = new CustomerDTO(UUID(),'example1@gmail.com',1)
        const customerDTO2 = new CustomerDTO(UUID(),'example2@gmail.com',2)
        const customerDTO3 = new CustomerDTO(UUID(),'example3@gmail.com',3)

        await cacheService.set(customerDTO1, ttl);
        await cacheService.set(customerDTO2, ttl);
        await cacheService.set(customerDTO3, ttl);

        const customerCachedDTOs = await cacheService.getAll();

        expect(customerCachedDTOs.length).toBe(3);
        expireCache();
    });

    it("should return null if ttl expires", async () => {
        const id = UUID()
        const customerDTO = new CustomerDTO(id,'example1@gmail.com',1)

        await cacheService.set(customerDTO, ttl);

        expireCache();

        expect(await cacheService.get(id)).toBeNull();
    });
})