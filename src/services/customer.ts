import {Customer, CustomerRepository, BillingAddress} from "../domain/customer";
import {EntityId, Email, Credit} from "../domain/common";
import {
    EntityNotFoundError,
    EntityWithSameEmailAlreadyExistError,
    EntityWithSameIdAlreadyExistError
} from "../domain/errors";
import {ICache} from "./cache";

export class CustomerService {
    private repository: CustomerRepository;
    private cache: ICache

    constructor(customerRepository: CustomerRepository,
                customerCache:ICache) {
        this.repository = customerRepository;
        this.cache = customerCache;
    }

    async create(id: string, email: string, billingAddressDTO?: BillingAddressDTO): Promise<void> {
        let billingAddress: BillingAddress | undefined;
        if (billingAddressDTO) {
            billingAddress = new BillingAddress(billingAddressDTO.street, billingAddressDTO.city, billingAddressDTO.state, billingAddressDTO.zipCode, billingAddressDTO.country);
        }
        const newCustomer = new Customer(new EntityId(id), new Email(email), billingAddress);

        let customer = await this.repository.findById(newCustomer.id);
        if (customer) {
            throw new EntityWithSameIdAlreadyExistError(newCustomer.id);
        }
        customer = await this.repository.findByEmail(newCustomer.email);
        if (customer) {
            throw new EntityWithSameEmailAlreadyExistError(newCustomer.email);
        }

        await this.repository.create(newCustomer);
    }

    async get(id: string): Promise<CustomerDTO> {
        const cached = await this.cache.get<CustomerDTO>(id);
        if(cached) return cached;

        const entityId = new EntityId(id);
        const customer = await this.repository.findById(entityId);

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        const customerDto = this.buildCustomerDTO(customer);
        await this.cache.set(customerDto.id,customerDto);

        return customerDto
    }

    async getAll(): Promise<CustomerDTO[]> {
        const cacheKey = 'customers:all';
        const cached = await this.cache.get<CustomerDTO[]>(cacheKey);
        if (cached) return cached;

        const customers = await this.repository.findAll();
        const customersDto = customers.map(
            customer => this.buildCustomerDTO(customer)
        );

        await this.cache.set(cacheKey, customersDto);

        return customersDto
    }

    private buildCustomerDTO(customer: Customer) {
        return new CustomerDTO(customer.id.value, customer.email.value, customer.availableCredit.value);
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

    async addBillingAddress(id: string,billingAddressDTO: BillingAddressDTO){
        const {street,city,state,zipCode,country} = billingAddressDTO
        const billingAddress = new BillingAddress(street,city,state,zipCode,country);
        const entityId = new EntityId(id);

        const customer = await this.repository.findById(entityId);

        if (!customer) {
            throw new EntityNotFoundError(entityId);
        }

        customer.addBillingAddress(billingAddress)

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
}

export class BillingAddressDTO {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
    readonly country: string;

    constructor(street: string, city: string, state: string, zipCode: string, country: string) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }
}