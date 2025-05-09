import {Customer, CustomerRepository} from "../../domain/customer";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomer} from "./data-model";
import {QueryFailedError} from "typeorm";
import {Credit, Email, EntityId} from "../../domain/common";
import {EntityAlreadyExistError} from "../../domain/errors";


export class TypeOrmCustomerRepository implements CustomerRepository {
    private typeOrmRepo: Repository<TypeOrmCustomer>;

    constructor(typeOrmRepo: Repository<TypeOrmCustomer>) {
        this.typeOrmRepo = typeOrmRepo;
    }

    async findById(id: EntityId): Promise<Customer | null> {
        const customerDataModel = await this.typeOrmRepo.findOneBy({ id: id.value });
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
        try {
            await this.typeOrmRepo.insert(
                new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value)
            );
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes("UNIQUE constraint failed")) {
                throw new EntityAlreadyExistError(customer.id);
            }
            throw error;
        }
    }

    async save(customer: Customer): Promise<void> {
        try {
            await this.typeOrmRepo.save(
                new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value)
            );
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes("UNIQUE constraint failed")) {
                throw new EntityAlreadyExistError(customer.id);
            }
            throw error;
        }
    }

    async delete(customer: Customer): Promise<void> {
        await this.typeOrmRepo.delete(customer.id.value);
    }
}