import {CustomerDTO, CustomerService} from './customer';
import {BillingAddress, Customer, CustomerRepository} from '../domain/customer';
import {BillingAddressDTO} from './customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';
import {
    DomainConflictError,
    EntityNotFoundError,
    EntityWithSameEmailAlreadyExistError,
    EntityWithSameIdAlreadyExistError
} from "../domain/errors";
import {EntityId, Email, Credit} from "../domain/common";

describe('CustomerService', () => {
    const mockRepository = mock<CustomerRepository>();
    const customerService = new CustomerService(mockRepository)

    beforeEach(() => {
        mockReset(mockRepository);
    });

    it('should create a new customer', async () => {
        const id = UUID();
        const email = "email@example.com";
        const expectedCustomer = new Customer(new EntityId(id), new Email(email));
        expect(expectedCustomer.availableCredit.value).toBe(0);

        mockRepository.create.mockImplementationOnce(async () => {});

        await expect(customerService.create(id, email)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);
    });

    it('should create a new customer with billing address', async () => {
        const id = UUID();
        const email = "email@example.com";
        const street = 'Carrer de Llepant';
        const city = 'Barcelona';
        const state = 'Cataluña';
        const zipCode = '08032';
        const country = 'Spain';

        const expectedCustomer = new Customer(
            new EntityId(id),
            new Email(email),
            new BillingAddress(street, city, state, zipCode, country)
        );

        mockRepository.create.mockImplementationOnce(async () => {});

        const billingAddressDTO = new BillingAddressDTO(street, city, state, zipCode, country);
        await expect(customerService.create(id, email, billingAddressDTO)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);
    });

    it('create should throw DomainConflictError when uuid is invalid', async () => {
        const id = "invalid-uuid";
        const email = "email@example.com";
        mockRepository.create.mockImplementationOnce(async () => {});

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("Invalid UUID: invalid-uuid");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    it('create should throw DomainConflictError when email is invalid', async () => {
        const id = UUID();
        const email = "invalid-email";
        mockRepository.create.mockImplementationOnce(async () => {});

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("Invalid email: invalid-email");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    it('create should throw EntityWithSameIdAlreadyExistError', async () => {
        const id = UUID();
        const email = "email@example.com";

        mockRepository.findById.mockImplementationOnce(async () => {
            return new Customer(new EntityId(id), new Email(email));
        });

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow(`Entity with id ${id} already exists.`);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameIdAlreadyExistError);
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    describe('customerService.create - BillingAddress validation', () => {
        const id = UUID();
        const email = "email@example.com";
        mockRepository.create.mockImplementation(async () => {});

        const baseAddress = {
            street: 'Carrer de Llepant',
            city: 'Barcelona',
            state: 'Cataluña',
            zipCode: '08032',
            country: 'Spain',
        };

        it.each([
            ['street', '', "BillingAddress: 'street' must be a non-empty string"],
            ['city', '', "BillingAddress: 'city' must be a non-empty string"],
            ['state', '', "BillingAddress: 'state' must be a non-empty string"],
            ['zipCode', '', "BillingAddress: 'zipCode' must be a non-empty string"],
            ['country', '', "BillingAddress: 'country' must be a non-empty string"],
        ])(
            "should throw DomainConflictError when BillingAddress.%s is empty",
            async (field, value, expectedMessage) => {
                const billingAddressDTO = new BillingAddressDTO(
                    field === 'street' ? value : baseAddress.street,
                    field === 'city' ? value : baseAddress.city,
                    field === 'state' ? value : baseAddress.state,
                    field === 'zipCode' ? value : baseAddress.zipCode,
                    field === 'country' ? value : baseAddress.country,
                );

                const resultPromise = customerService.create(id, email, billingAddressDTO);

                await expect(resultPromise).rejects.toThrow(expectedMessage);
                await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
            }
        );
    });

    it('create should throw EntityWithSameIdAlreadyExistError', async () => {
        const id = UUID();
        const email = "email@example.com";

        mockRepository.findByEmail.mockImplementationOnce(async () => {
            return new Customer(new EntityId(UUID()), new Email(email));
        });

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow(`Entity with email ${email} already exists.`);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameEmailAlreadyExistError);
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    it('create should propagate the Exception thrown by the repository', async () => {
        const id = UUID();
        const email = "email@example.com";
        const expectedErrorMsg = "unexpected error message";
        mockRepository.create.mockImplementationOnce(async () => {
            throw new Error(expectedErrorMsg);
        });

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow(expectedErrorMsg);
        await expect(resultPromise).rejects.toBeInstanceOf(Error);
    });

    it('should get the customer by its id', async () => {
        const id = UUID();
        const email = "email@example.com";
        const availableCredit = 0;

        const entityId = new EntityId(id);

        mockRepository.findById.mockImplementationOnce(async () => {
            return new Customer(entityId, new Email(email));
        });

        const expectedCustomerDTO = new CustomerDTO(id, email, availableCredit);
        const customerDTOFound = await customerService.get(id);

        expect(customerDTOFound).toEqual(expectedCustomerDTO);
        expect(mockRepository.findById).toHaveBeenCalledWith(entityId);
    });

    it('should list all customers', async () => {
        const userAId = UUID();
        const userAEntityId = new EntityId(userAId);
        const userAEmail = "userAEmail@example.com";
        const userBId = UUID();
        const userBEntityId = new EntityId(userBId);
        const userBEmail = "userBemail@example.com";
        const availableCredit = 0;

        const customers: Customer[] = [
            new Customer(userAEntityId, new Email(userAEmail)),
            new Customer(userBEntityId, new Email(userBEmail))
        ];

        mockRepository.findAll.mockImplementationOnce(async () => {
            return customers;
        });

        const expectedCustomerDTOs: CustomerDTO[] = [
            new CustomerDTO(userAId, userAEmail, availableCredit),
            new CustomerDTO(userBId, userBEmail, availableCredit)
        ];

        const customerDTOsFound = await customerService.getAll();

        expect(customerDTOsFound).toEqual(expectedCustomerDTOs);
    });

    it('get should throw EntityNotFoundError when repository findById return Promise<void>', async () => {
        const id = UUID();

        mockRepository.findById.mockImplementationOnce(async () => {
            return null;
        });

        const resultPromise = customerService.get(id);

        await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('should delete the customer by its id', async () => {
        const id = UUID();
        const email = "email@example.com";
        const entityId = new EntityId(id);

        const customer = new Customer(entityId, new Email(email));

        mockRepository.findById.mockImplementationOnce(async () => {
            return customer;
        });
        mockRepository.delete.mockImplementationOnce(async () => {
            return;
        });

        await customerService.delete(id);
        expect(mockRepository.delete).toHaveBeenCalledWith(customer);
    });

    it('delete should throw EntityNotFoundError when repository findById return Promise<void>', async () => {
        const id = UUID();

        mockRepository.findById.mockImplementationOnce(async () => {
            return null;
        });

        const resultPromise = customerService.delete(id);

        await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('should add available credit to the customer', async () => {
        const id = UUID();
        const email = "email@example.com";
        const entityId = new EntityId(id);
        const creditValue = 10.2

        let customerWithAddedCredit = Reflect.construct(Customer, [
            new EntityId(id),
            new Email(email),
        ]);
        (customerWithAddedCredit as any)._availableCredit = new Credit(creditValue);

        mockRepository.findById.mockImplementationOnce(async () => {
            return new Customer(entityId, new Email(email));
        });

        mockRepository.save.mockImplementationOnce(async () => {
            return;
        });

        await customerService.addCredit(id, creditValue);

        expect(mockRepository.save).toHaveBeenCalledWith(customerWithAddedCredit);
    });

    it('addCredit should throw EntityNotFoundError when repository findById return Promise<void>', async () => {
        const id = UUID();
        const creditValue = 50;

        mockRepository.findById.mockImplementationOnce(async () => {
            return null;
        });

        const resultPromise = customerService.addCredit(id, creditValue);

        await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('addCredit should throw DomainConflictError when try to add negative credit', async () => {
        const id = UUID();
        const entityId = new EntityId(id);
        const email = "email@example.com";
        const creditValue = -10;

        mockRepository.findById.mockImplementationOnce(async () => {
            return new Customer(entityId, new Email(email));
        });

        const resultPromise = customerService.addCredit(id, creditValue);

        await expect(resultPromise).rejects.toThrow("Credit cannot be negative");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });
});