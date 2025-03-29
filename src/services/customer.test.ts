import { CustomerService } from './customer';
import { Customer, CustomerRepository } from '../domain/customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';
import {DomainConflictError} from "../domain/errors";
import {EntityId} from "../domain/common";

describe('CustomerService', () => {
    const mockRepository = mock<CustomerRepository>();
    const customerService = new CustomerService(mockRepository)

    beforeEach(() => {
        mockReset(mockRepository);
    });

    it('should create a new customer', async () => {

        const id = UUID();
        const expectedCustomer = new Customer(new EntityId(id));

        mockRepository.create.mockImplementationOnce(async () => {});

        await expect(customerService.create(id)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);

    });

    it('should throw DomainConflictError when uuid is invalid', async () => {
        const id = "invalid-uuid";

        mockRepository.create.mockImplementationOnce(async () => {});

        const resultPromise = customerService.create(id);

        await expect(resultPromise).rejects.toThrowError("Invalid UUID: invalid-uuid");
        await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
    });
});