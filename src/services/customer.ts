import {Customer, CustomerRepository} from "../domain/customer";
import {EntityId, Email} from "../domain/common";
import {UniqueConstraintError} from "../database/errors";
import {DomainConflictError} from "../domain/errors";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string, email: string): Promise<void> {
        const newCustomer = new Customer(new EntityId(id), new Email(email));

        try {
            await this.repository.create(newCustomer);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new DomainConflictError(error.message);
            }
            throw error;
        }
    }
}