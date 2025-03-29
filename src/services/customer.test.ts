import { CustomerService } from './customer';
import { Customer, CustomerRepository } from '../domain/customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';

describe('CustomerService', () => {
    const mockRepository = mock<CustomerRepository>();
    const customerService = new CustomerService(mockRepository)

    beforeEach(() => {
        mockReset(mockRepository);
    });

    it('should create a new customer', async () => {
        const id = UUID();
        const expectedCustomer = new Customer(id);

        mockRepository.create.mockImplementationOnce(async () => {});

        await expect(customerService.create(id)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);

    });
});