import {Customer, CustomerRepository} from "../domain/customer";
import {EntityId, Email} from "../domain/common";
import {UniqueConstraintError} from "../database/errors";
import {DomainConflictError, EntityNotFoundError} from "../domain/errors";

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

    async get(id: string): Promise<CustomerDTO> {
        const entityId = new EntityId(id);
        const customer = await this.repository.findById(new EntityId(id));

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        return new CustomerDTO(customer.id.value, customer.email.value);
    }
}

export class CustomerDTO {
    readonly id: string;
    readonly email: string;
    constructor(id: string, email: string) {
        this.id = id;
        this.email = email;
    }
}