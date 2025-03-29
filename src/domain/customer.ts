import {EntityId} from "./common";

export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
}

export class Customer {
    private id: EntityId;

    constructor(id: EntityId) {
        this.id = id;
    }
}