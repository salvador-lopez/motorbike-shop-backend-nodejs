import {EntityId, Email, Credit} from "./common";
import {DomainConflictError} from "./errors";

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
        this.assertNonEmpty('street', street);
        this.assertNonEmpty('city', city);
        this.assertNonEmpty('state', state);
        this.assertNonEmpty('zipCode', zipCode);
        this.assertNonEmpty('country', country);
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }

    public equal(addressToCompare: BillingAddress):boolean{
        return this.normalize(this.street) === this.normalize(addressToCompare.street)
            && this.normalize(this.city) === this.normalize(addressToCompare.city)
            && this.normalize(this.state) === this.normalize(addressToCompare.state)
            && this.normalize(this.zipCode) === this.normalize(addressToCompare.zipCode)
            && this.normalize(this.country) === this.normalize(addressToCompare.country);
    }

    private normalize(value: string): string {
        return value.trim().toLowerCase();
    }

    private assertNonEmpty(fieldName: string, value: string) {
        if (value.trim().length === 0) {
            throw new DomainConflictError(`BillingAddress: '${fieldName}' must be a non-empty string`);
        }
    }
}

export class Customer {
    readonly id: EntityId;
    readonly email: Email;
    private _availableCredit: Credit
    private _billingAddress?: BillingAddress;
    private _secondaryBillingAddress?: BillingAddress

    constructor(id: EntityId, email: Email, billingAddress?: BillingAddress) {
        this.id = id;
        this.email = email;
        this._billingAddress = billingAddress;
        this._availableCredit = new Credit(0);
    }

    get availableCredit(): Credit {
        return this._availableCredit;
    }

    addCredit(credit: Credit) {
        this._availableCredit = this._availableCredit.add(credit);
    }

    get billingAddress(): BillingAddress | undefined {
        return this._billingAddress;
    }

    addBillingAddress(billingAddress:BillingAddress){
        if(!this._billingAddress){
            this._billingAddress = billingAddress;
            return;
        }

        if(this._billingAddress.equal(billingAddress)){

            throw new DomainConflictError(`This billing address already exist`);
        }

        this._secondaryBillingAddress = billingAddress;
    }

}