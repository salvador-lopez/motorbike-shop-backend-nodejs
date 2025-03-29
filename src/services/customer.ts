import {Customer, CustomerRepository} from "../domain/customer";
import {validate} from "uuid";
import {DomainConflictError} from "../domain/errors";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string): Promise<void> {
        if (!validate(id)) {
            throw new DomainConflictError("Invalid UUID");
        }
        const newCustomer = new Customer(id)
        await this.repository.create(newCustomer);
    }
}