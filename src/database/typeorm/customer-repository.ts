import {Customer, CustomerRepository} from "../../domain/customer";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomer} from "./data-model";
import {QueryFailedError} from "typeorm";
import {UniqueConstraintError} from "../errors";


export class TypeOrmCustomerRepository implements CustomerRepository {
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

}