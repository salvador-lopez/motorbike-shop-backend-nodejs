import { CustomerService } from './customer';
import { Customer, CustomerRepository } from '../domain/customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';
import {DomainConflictError} from "../domain/errors";
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

    it('should throw DomainConflictError when uuid is invalid', async () => {
        const id = "invalid-uuid";
        const email = "email@example.com";
        mockRepository.create.mockImplementationOnce(async () => {});

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("Invalid UUID: invalid-uuid");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    it('should throw DomainConflictError when email is invalid', async () => {
        const id = UUID();
        const email = "invalid-email";
        mockRepository.create.mockImplementationOnce(async () => {});

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("Invalid email: invalid-email");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });

    it('should throw DomainConflictError when repository throw UniqueConstraintError', async () => {
        const id = UUID();
        const email = "email@example.com";
        mockRepository.create.mockImplementationOnce(async () => {
            throw new UniqueConstraintError("unique constraint error");
        });

        const resultPromise = customerService.create(id, email);

        await expect(resultPromise).rejects.toThrow("unique constraint error");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });
});