import {EntityId, Email, Credit} from "./common";

export interface CustomerRepository {
    findById(id: EntityId): Promise<Customer | null>;
    findByEmail(email: Email): Promise<Customer | null>;
    findAll(): Promise<Customer[]>;
    create(customer: Customer): Promise<void>;
    save(customer: Customer): Promise<void>;
    delete(customer: Customer): Promise<void>;
}

export class Customer {
    readonly id: EntityId;
    readonly email: Email;
    private _availableCredit: Credit

    constructor(id: EntityId, email: Email) {
        this.id = id;
        this.email = email;
        this._availableCredit = new Credit(0);
    }

    get availableCredit(): Credit {
        return this._availableCredit;
    }

    addCredit(credit: Credit) {
        this._availableCredit = this._availableCredit.add(credit);
    }
}