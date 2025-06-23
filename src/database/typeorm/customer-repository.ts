import {Customer, CustomerRepository} from "../../domain/customer";
import {Repository} from "typeorm";
import {TypeOrmCustomer} from "./data-model";
import {Credit, Email, EntityId} from "../../domain/common";
import {inject, injectable} from "tsyringe";
import {CUSTOMER_TYPEORM_REPOSITORY_TOKEN} from "../../di/customer.tokens";


@injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
    private typeOrmRepo: Repository<TypeOrmCustomer>;

    constructor(@inject(CUSTOMER_TYPEORM_REPOSITORY_TOKEN) typeOrmRepo: Repository<TypeOrmCustomer>) {
        this.typeOrmRepo = typeOrmRepo;
    }

    async findById(id: EntityId): Promise<Customer | null> {
        const customerDataModel = await this.typeOrmRepo.findOneBy({ id: id.value });
        if (customerDataModel) {
            return this.toDomainEntity(customerDataModel);
        }

        return null;
    }

    async findByEmail(email: Email): Promise<Customer | null> {
        const customerDataModel = await this.typeOrmRepo.findOneBy({ email: email.value });
        if (customerDataModel) {
            return this.toDomainEntity(customerDataModel);
        }

        return null;
    }

    private toDomainEntity(customerDataModel: TypeOrmCustomer): Customer {
        let customer = Reflect.construct(Customer, [
            new EntityId(customerDataModel.id),
            new Email(customerDataModel.email),
        ]);
        (customer as any)._availableCredit = new Credit(customerDataModel.availableCredit);

        return customer;
    }

    async findAll(): Promise<Customer[]> {
        return (await this.typeOrmRepo.find({
            order: {
                availableCredit: "DESC",
            },
        })).map(typeOrmCustomer => this.toDomainEntity(typeOrmCustomer));
    }

    async create(customer: Customer): Promise<void> {
        await this.typeOrmRepo.insert(
            new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value, customer.billingAddress)
        );
    }

    async save(customer: Customer): Promise<void> {
        await this.typeOrmRepo.save(
            new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value, customer.billingAddress, customer.secondaryBillingAddress)
        );

    }

    async delete(customer: Customer): Promise<void> {
        await this.typeOrmRepo.delete(customer.id.value);
    }
}