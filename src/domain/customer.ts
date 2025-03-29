import {EntityId, Email} from "./common";

export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
}

export class Customer {
    private id: EntityId;
    private email: Email;

    constructor(id: EntityId, email: Email) {
        this.id = id;
        this.email = email;
    }
}