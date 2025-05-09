import {Customer, CustomerRepository} from "../domain/customer";
import {EntityId, Email, Credit} from "../domain/common";

export class CustomerService {
    private repository: CustomerRepository;

    constructor(customerRepository: CustomerRepository) {
        this.repository = customerRepository;
    }

    async create(id: string, email: string): Promise<void> {
        const newCustomer = new Customer(new EntityId(id), new Email(email));

        await this.repository.create(newCustomer);
    }

    async get(id: string): Promise<CustomerDTO> {
        const entityId = new EntityId(id);
        const customer = await this.repository.findById(entityId);

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        return new CustomerDTO(customer.id.value, customer.email.value, customer.availableCredit.value);
    }

    async getAll(): Promise<CustomerDTO[]> {
        const customers = await this.repository.findAll();

        return customers.map(
            customer => new CustomerDTO(customer.id.value, customer.email.value, customer.availableCredit.value)
        );
    }

    async delete(id: string): Promise<void> {
        const entityId = new EntityId(id);
        const customer = await this.repository.findById(entityId);

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        await this.repository.delete(customer);
    }

    async addCredit(id: string, creditValue: number): Promise<void> {
        const entityId = new EntityId(id);
        const credit = new Credit(creditValue);
        const customer = await this.repository.findById(entityId);

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        customer.addCredit(credit);

        await this.repository.save(customer);
    }
}

export class CustomerDTO {
    readonly id: string;
    readonly email: string;
    readonly availableCredit: number;
    constructor(id: string, email: string, availableCredit: number) {
        this.id = id;
        this.email = email;
        this.availableCredit = availableCredit;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            available_credit: this.availableCredit,
        };
    }
}