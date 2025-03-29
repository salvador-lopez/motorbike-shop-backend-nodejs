import {Customer, CustomerRepository} from "../domain/customer";
import {EntityId, Email} from "../domain/common";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string, email: string): Promise<void> {
        const newCustomer = new Customer(new EntityId(id), new Email(email));

        await this.repository.create(newCustomer);
    }
}