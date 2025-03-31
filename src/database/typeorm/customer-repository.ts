import {Customer, CustomerRepository} from "../../domain/customer";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmCustomer} from "./data-model";


export class TypeOrmCustomerRepository implements CustomerRepository {
    private typeOrmRepo: Repository<TypeOrmCustomer>;

    constructor(typeOrmRepo: Repository<TypeOrmCustomer>) {
        this.typeOrmRepo = typeOrmRepo;
    }

    async create(customer: Customer): Promise<void> {
        await this.typeOrmRepo.insert(
            new TypeOrmCustomer(customer.id.value, customer.email.value, customer.availableCredit.value)
        );
    }

}