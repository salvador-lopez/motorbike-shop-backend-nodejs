import {Customer, CustomerRepository} from "../../domain/customer";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomer} from "./data-model";
import {QueryFailedError} from "typeorm";
import {UniqueConstraintError} from "../errors";
import {Credit, Email, EntityId} from "../../domain/common";


export class TypeOrmCustomerRepository implements CustomerRepository {
    async findById(id: EntityId): Promise<Customer | null> {
        const customerDataModel = await this.typeOrmRepo.findOneBy({ id: id.value });
        if (customerDataModel) {
            let customer= Reflect.construct(Customer, [
                new EntityId(customerDataModel.id),
                new Email(customerDataModel.email),
            ]);
            (customer as any)._availableCredit = new Credit(customerDataModel.availableCredit);
            return customer;
        }

        return null;
    }
    private typeOrmRepo: Repository<TypeOrmCustomer>;

    constructor(typeOrmRepo: Repository<TypeOrmCustomer>) {
        this.typeOrmRepo = typeOrmRepo;
    }

    async create(customer: Customer): Promise<void> {
        try {
            await this.typeOrmRepo.insert(
                new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value)
            );
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes("UNIQUE constraint failed")) {
                throw new UniqueConstraintError(error.message);
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
                throw new UniqueConstraintError(error.message);
            }
            throw error;
        }
    }

    async delete(customer: Customer): Promise<void> {
        await this.typeOrmRepo.delete(customer.id.value);
    }
}