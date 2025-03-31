import {testDataSource} from "./data-source";
import {EntityId, Email} from "../../domain/common";
import {Customer} from "../../domain/customer";
import { v4 as UUID} from 'uuid';
import {TypeOrmCustomerRepository} from "./customer-repository";
import {TypeOrmCustomer} from "./data-model";

let customerRepo: TypeOrmCustomerRepository;
const typeOrmRepo = testDataSource.getRepository(TypeOrmCustomer);

beforeEach(async () => {
    customerRepo = new TypeOrmCustomerRepository(typeOrmRepo);
    await typeOrmRepo.clear();
});

beforeAll(async () => {
    await testDataSource.initialize();
});

afterAll(async () => {
    await testDataSource.destroy();
});

describe("Customer Repository Integration Test", () => {
    it("should create a new customer", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);

        await customerRepo.create(customer);

        let customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });

        expect(customerDataModel).not.toBeNull();
        if (customerDataModel !== null) {
            expect(customerDataModel.id).toBe(entityId.value);
            expect(customerDataModel.email).toBe(email.value);
            expect(customerDataModel.availableCredit).toBe(0);
        }
    });
});