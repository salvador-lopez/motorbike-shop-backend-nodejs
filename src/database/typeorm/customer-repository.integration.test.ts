import {testDataSource} from "./data-source";
import {EntityId, Email, Credit} from "../../domain/common";
import {Customer} from "../../domain/customer";
import { v4 as UUID} from 'uuid';
import {TypeOrmCustomerRepository} from "./customer-repository";
import {TypeOrmCustomer} from "./data-model";
import {UniqueConstraintError} from "../errors";

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
    it("should throw an unique constraint database error when try to create customer with same id twice", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const newEmail = new Email("new-email@example.com");
        const customer = new Customer(entityId, email);
        const customerWithNewEmail = new Customer(entityId, newEmail);

        await customerRepo.create(customer);

        const resultPromise = customerRepo.create(customerWithNewEmail);

        await expect(resultPromise)
            .rejects.toThrow("SQLITE_CONSTRAINT: UNIQUE constraint failed: customers.id");
        await expect(resultPromise)
            .rejects.toBeInstanceOf(UniqueConstraintError);
    });
    it("should throw an unique constraint database error when try to create customer with same email twice", async () => {
        const entityId = new EntityId(UUID());
        const newEntityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);
        const customerWithSameEmail = new Customer(newEntityId, email);

        await customerRepo.create(customer);

        const resultPromise = customerRepo.create(customerWithSameEmail);

        await expect(resultPromise)
            .rejects.toThrow("SQLITE_CONSTRAINT: UNIQUE constraint failed: customers.email");
        await expect(resultPromise)
            .rejects.toBeInstanceOf(UniqueConstraintError);
    });
    it("should find a customer by it´s id", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customerDataModel = new TypeOrmCustomer(entityId.value, email.value, 0);

        await typeOrmRepo.insert(customerDataModel);

        const customer = await customerRepo.findById(entityId);

        expect(customer).not.toBeUndefined();
        if (customer !== undefined) {
            expect(customer.id).toEqual(entityId);
            expect(customer.email).toEqual(email);
            expect(customer.availableCredit).toEqual(new Credit(0));
        }
    });
});