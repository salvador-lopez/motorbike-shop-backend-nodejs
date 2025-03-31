import {CustomerDTO, CustomerService} from './customer';
import { Customer, CustomerRepository } from '../domain/customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';
import {DomainConflictError, EntityNotFoundError} from "../domain/errors";
import {EntityId, Email, Credit} from "../domain/common";
import {UniqueConstraintError} from "../database/errors";

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

    it('create should throw DomainConflictError when repository throw UniqueConstraintError', async () => {
        const id = UUID();
        const email = "email@example.com";
        mockRepository.create.mockImplementationOnce(async () => {
            throw new UniqueConstraintError("unique constraint error");
        });

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("unique constraint error");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
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