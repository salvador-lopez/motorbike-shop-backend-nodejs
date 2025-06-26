import {v4 as UUID} from "uuid";
import {CustomerDTO} from "../../customer";
import {InMemoryCustomerCache} from "./customer-in-memory";

describe("InMemoryCustomerCache", () => {

    let cacheService: InMemoryCustomerCache;
    let memory: Map<string, CustomerDTO>;

    const ttl = 10000;

    beforeEach(async () => {
        jest.useFakeTimers();
        memory = new Map<string, CustomerDTO>();
        cacheService = new InMemoryCustomerCache({memory: memory});
    });

    afterEach(async () => {
        expireCache();
        jest.useRealTimers();
    });

    function expireCache() {
        jest.advanceTimersByTime(ttl);
        jest.runOnlyPendingTimers();
    }

    it("should cache a customerDto", async () => {
        const id = UUID()
        const email = "email@example.com";
        const availableCredit = 0;
        const expectedCustomerDTO = new CustomerDTO(id, email,availableCredit);

        await cacheService.set(expectedCustomerDTO, ttl);

        expect(memory.get(id)).toBe(expectedCustomerDTO);
    });

    it("should get all customerDto cached", async () => {
        const customerDTO1 = new CustomerDTO(UUID(),'example1@gmail.com',1)
        const customerDTO2 = new CustomerDTO(UUID(),'example2@gmail.com',2)
        const customerDTO3 = new CustomerDTO(UUID(),'example3@gmail.com',3)

        memory.set(customerDTO1.id, customerDTO1)
            .set(customerDTO2.id, customerDTO2)
            .set(customerDTO3.id, customerDTO3);

        const customerCachedDTOs = await cacheService.getAll();

        expect(customerCachedDTOs).toEqual([customerDTO1, customerDTO2, customerDTO3]);
    });

    it("should return null if ttl expires", async () => {
        const id = UUID()
        const customerDTO = new CustomerDTO(id,'example1@gmail.com',1)

        await cacheService.set(customerDTO, ttl);
        expireCache();

        expect(await cacheService.get(id)).toBeNull();
    });
})