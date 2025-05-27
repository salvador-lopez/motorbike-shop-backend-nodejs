import {EntityId, Email, Credit} from "./common";

export interface CustomerRepository {
    findById(id: EntityId): Promise<Customer | null>;
    findByEmail(email: Email): Promise<Customer | null>;
    findAll(): Promise<Customer[]>;
    create(customer: Customer): Promise<void>;
    save(customer: Customer): Promise<void>;
    delete(customer: Customer): Promise<void>;
}

export class BillingAddress {
    readonly street: string
    readonly city: string
    readonly state: string
    readonly zipCode: string
    readonly country: string

    constructor(street: string, city: string, state: string, zipCode: string, country: string) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }
}

export class Customer {
    readonly id: EntityId;
    readonly email: Email;
    private _availableCredit: Credit
    private billingAddress?: BillingAddress;

    constructor(id: EntityId, email: Email, billingAddress?: BillingAddress) {
        this.id = id;
        this.email = email;
        this.billingAddress = billingAddress;
        this._availableCredit = new Credit(0);
    }

    get availableCredit(): Credit {
        return this._availableCredit;
    }

    addCredit(credit: Credit) {
        this._availableCredit = this._availableCredit.add(credit);
    }
}