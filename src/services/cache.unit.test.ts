import {v4 as UUID} from "uuid";
import {CustomerDTO} from "./customer";
import {CacheCustomerService, CustomerCache} from "./cache";

let cacheService: CustomerCache;

beforeEach(async () => {
    cacheService = new CacheCustomerService();

});

const delay1300ms =()=> new Promise((resolve) => {

    setTimeout(()=> {
        resolve(true)
    },1100)
})

describe("Customer Cache Integration Test", () => {
    it("should cache a customerDto", async () => {
        const id = UUID()
        const email = "email@example.com";
        const availableCredit = 0;
        const customerDTO = new CustomerDTO(id, email,availableCredit);

        await cacheService.set(customerDTO, 1000);

        const customerCachedDTO = await cacheService.get(id);

        expect(customerCachedDTO).not.toBeNull();
        if (customerCachedDTO !== null) {
            expect(customerCachedDTO.id).toBe(id);
            expect(customerCachedDTO.email).toBe(email);
            expect(customerCachedDTO.availableCredit).toBe(0);
        }
    });

    it("should get all customerDto cached", async () => {
        const customerDTO1 = new CustomerDTO(UUID(),'example1@gmail.com',1)
        const customerDTO2 = new CustomerDTO(UUID(),'example2@gmail.com',2)
        const customerDTO3 = new CustomerDTO(UUID(),'example3@gmail.com',3)

        await cacheService.set(customerDTO1, 1000);
        await cacheService.set(customerDTO2, 1000);
        await cacheService.set(customerDTO3, 1000);

        const customerCachedDTOs = await cacheService.getAll();

        expect(customerCachedDTOs).not.toBeNull();
        if (customerCachedDTOs !== null) {
            expect(customerCachedDTOs.length).toBe(3);

        }
    });

    it("should return null if ttl expires", async () => {
        const id = UUID()
        const customerDTO1 = new CustomerDTO(id,'example1@gmail.com',1)

        await cacheService.set(customerDTO1, 1000);

        const customerShouldExist = await cacheService.get(id);
        expect(customerShouldExist).not.toBeNull();

        await delay1300ms()

        const customerShouldNull = await cacheService.get(id);

        expect(customerShouldNull).toBeNull();
    });
})