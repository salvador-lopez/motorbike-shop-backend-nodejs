import {EntityId, Email, Credit} from "./common";

export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
    findById(id: EntityId): Promise<Customer | void>;
    delete(customer: Customer): Promise<void>;
}

export class Customer {
    readonly id: EntityId;
    readonly email: Email;
    readonly availableCredit: Credit

    constructor(id: EntityId, email: Email) {
        this.id = id;
        this.email = email;
        this.availableCredit = new Credit(0);
    }
}