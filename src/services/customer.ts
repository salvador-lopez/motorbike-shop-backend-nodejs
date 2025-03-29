import {Customer, CustomerRepository} from "../domain/customer";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string): Promise<void> {
        const newCustomer = new Customer(id)
        await this.repository.create(newCustomer);
    }
}