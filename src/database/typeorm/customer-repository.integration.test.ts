import {testDataSource} from "./data-source";
import {EntityId, Email, Credit} from "../../domain/common";
import {BillingAddress, Customer} from "../../domain/customer";
import { v4 as UUID} from 'uuid';
import {TypeOrmCustomerRepository} from "./customer-repository";
import {TypeOrmCustomer} from "./data-model";
import {QueryFailedError} from "typeorm";
import {Repository} from "typeorm/repository/Repository";

let customerRepo: TypeOrmCustomerRepository;
const typeOrmRepo: Repository<TypeOrmCustomer> = testDataSource.getRepository(TypeOrmCustomer);

beforeEach(async () => {
    customerRepo = new TypeOrmCustomerRepository({customerRepositoryConn: typeOrmRepo});
    await typeOrmRepo.clear();
});

beforeAll(async () => {
    await testDataSource.initialize();
});

afterAll(async () => {
    await testDataSource.destroy();
});

describe("Customer Repository Integration Test", () => {
    it("should create a new customer with mandatory data", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);

        await customerRepo.create(customer);

        const customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });

        expect(customerDataModel).not.toBeNull();
        if (customerDataModel !== null) {
            expect(customerDataModel.id).toBe(entityId.value);
            expect(customerDataModel.email).toBe(email.value);
            expect(customerDataModel.availableCredit).toBe(0);
        }
    });

    it("should create a new customer with mandatory and optional data", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const billingAddress = new BillingAddress('Montevideo','Uruapan','Mexico','72000','Narnia');
        const customer = new Customer(entityId, email,billingAddress);

        await customerRepo.create(customer);

        const customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });

        expect(customerDataModel).not.toBeNull();
        if (customerDataModel !== null) {
            expect(customerDataModel.id).toBe(entityId.value);
            expect(customerDataModel.email).toBe(email.value);
            expect(customerDataModel.availableCredit).toBe(0);
            expect(customerDataModel.billingAddress).toEqual(billingAddress);
        }
    });
    
    it("should save a customer", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);
        const billingAddress = new BillingAddress('Montevideo','Uruguayan','Mexico','72000','Mexico');
        const secondaryBillingAddress = new BillingAddress('Paraguay','Parana','Entre Rios','3100','Argentina');

        customer.addBillingAddress(billingAddress)
        customer.addBillingAddress(secondaryBillingAddress)

        await customerRepo.save(customer);

        const customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });

        expect(customerDataModel).not.toBeNull();
        if (customerDataModel !== null) {
            expect(customerDataModel.id).toBe(entityId.value);
            expect(customerDataModel.email).toBe(email.value);
            expect(customerDataModel.availableCredit).toBe(0);
        }
    });

    it("should update the existent user when call to save", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);

        await customerRepo.save(customer);

        const newCreditValue = 10.5;
        customer.addCredit(new Credit(newCreditValue));

        await customerRepo.save(customer);

        const customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });

        expect(customerDataModel).not.toBeNull();
        if (customerDataModel !== null) {
            expect(customerDataModel.id).toBe(entityId.value);
            expect(customerDataModel.email).toBe(email.value);
            expect(customerDataModel.availableCredit).toBe(newCreditValue);
        }
    });

    it("should throw a QueryFailedError when try to save the customer with an email assigned to other customer", async () => {
        const customerAEntityId = new EntityId(UUID());
        const customerAEmail = new Email("customer-a-email@example.com");
        let customerA = new Customer(customerAEntityId, customerAEmail);

        const customerBEntityId = new EntityId(UUID());
        const customerBEmail = new Email("customer-b-email@example.com");
        const customerB = new Customer(customerBEntityId, customerBEmail);

        await customerRepo.create(customerA);
        await customerRepo.create(customerB);

        customerA = new Customer(customerAEntityId, customerBEmail);

        const resultPromise = customerRepo.save(customerA);

        await expect(resultPromise)
            .rejects.toBeInstanceOf(QueryFailedError);
    });

    it("should throw a QueryFailedError when try to create customer with same id twice", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const newEmail = new Email("new-email@example.com");
        const customer = new Customer(entityId, email);
        const customerWithNewEmail = new Customer(entityId, newEmail);

        await customerRepo.create(customer);

        const resultPromise = customerRepo.create(customerWithNewEmail);

        await expect(resultPromise)
            .rejects.toBeInstanceOf(QueryFailedError);
    });

    it("should throw an QueryFailedError when try to create customer with same email twice", async () => {
        const entityId = new EntityId(UUID());
        const newEntityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customer = new Customer(entityId, email);
        const customerWithSameEmail = new Customer(newEntityId, email);

        await customerRepo.create(customer);

        const resultPromise = customerRepo.create(customerWithSameEmail);

        await expect(resultPromise)
            .rejects.toBeInstanceOf(QueryFailedError);
    });

    it("should find a customer by it´s id", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customerDataModel = new TypeOrmCustomer(entityId.value, email.value, 0);

        await typeOrmRepo.insert(customerDataModel);

        const customer = await customerRepo.findById(entityId);

        expect(customer).not.toBeUndefined();
        if (customer) {
            expect(customer.id).toEqual(entityId);
            expect(customer.email).toEqual(email);
            expect(customer.availableCredit).toEqual(new Credit(0));
        }
    });

    it("should return void when find a customer by it´s id but the customer not found", async () => {
        const entityId = new EntityId(UUID());

        const customer = await customerRepo.findById(entityId);
        expect(customer).toBeNull();
    });

    it("should find a customer by it´s email", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        const customerDataModel = new TypeOrmCustomer(entityId.value, email.value, 0);

        await typeOrmRepo.insert(customerDataModel);

        const customer = await customerRepo.findByEmail(email);

        expect(customer).not.toBeUndefined();
        if (customer) {
            expect(customer.id).toEqual(entityId);
            expect(customer.email).toEqual(email);
            expect(customer.availableCredit).toEqual(new Credit(0));
        }
    });

    it("should return void when find a customer by it´s email but the customer not found", async () => {
        const email = new Email("email@example.com");

        const customer = await customerRepo.findByEmail(email);
        expect(customer).toBeNull();
    });

    it("should delete a customer", async () => {
        const entityId = new EntityId(UUID());
        const email = new Email("email@example.com");
        let customerDataModel: TypeOrmCustomer | null = new TypeOrmCustomer(entityId.value, email.value, 0);

        await typeOrmRepo.insert(customerDataModel)
        customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });
        expect(customerDataModel).not.toBeNull();

        const customer = new Customer(entityId, email);
        await customerRepo.delete(customer)
        customerDataModel = await typeOrmRepo.findOneBy({ id: entityId.value });
        expect(customerDataModel).toBeNull();
    });

    it("should find all customers ordered by availableCredit DESC", async () => {
        const customerCredit = new Credit(10.5);
        const otherCustomerCredit = new Credit(24);
        const customerDataModel = new TypeOrmCustomer(UUID(), "email@example.com", customerCredit.value);
        const otherCustomerDataModel = new TypeOrmCustomer(UUID(), "other-email@example.com", otherCustomerCredit.value);

        await typeOrmRepo.insert(customerDataModel);
        await typeOrmRepo.insert(otherCustomerDataModel);

        const customers = await customerRepo.findAll();

        expect(customers).toHaveLength(2);
        expect(customers[0].availableCredit).toEqual(otherCustomerCredit);
        expect(customers[1].availableCredit).toEqual(customerCredit);
    });
});