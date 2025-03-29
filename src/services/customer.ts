import {Customer, CustomerRepository} from "../domain/customer";
import {EntityId} from "../domain/common";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string): Promise<void> {
        const customerId = new EntityId(id);
        const newCustomer = new Customer(customerId)

        await this.repository.create(newCustomer);
    }
}