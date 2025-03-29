import {EntityId, Email, Credit} from "./common";

export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
}

export class Customer {
    private id: EntityId;
    private email: Email;
    private _availableCredit: Credit

    get availableCredit(): Credit {
        return this._availableCredit;
    }

    constructor(id: EntityId, email: Email) {
        this.id = id;
        this.email = email;
        this._availableCredit = new Credit(0);
    }
}