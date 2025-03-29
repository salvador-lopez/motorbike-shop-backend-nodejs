import {EntityId} from "./common";

export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
}

export class Customer {
    private id: EntityId;
    private email: string;

    constructor(id: EntityId, email: string) {
        this.id = id;
        this.email = email;
    }
}