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
        this.street = this.normalize(street);
        this.city = this.normalize(city);
        this.state = this.normalize(state);
        this.zipCode = this.normalize(zipCode);
        this.country = this.normalize(country);
    }

    public equal(addressToCompare: BillingAddress):boolean{
        return this.street === addressToCompare.street
            && this.city === addressToCompare.city
            && this.state === addressToCompare.state
            && this.zipCode === addressToCompare.zipCode
            && this.country === addressToCompare.country;
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

        if(this._billingAddress && this._secondaryBillingAddress){
            throw new DomainConflictError(`Maximum number of billing addresses reached.`)
        }

        if(this._billingAddress.equal(billingAddress)){

            throw new DomainConflictError(`This billing address already exist`);
        }

        this._secondaryBillingAddress = billingAddress;
    }

    get secondaryBillingAddress():BillingAddress | undefined {
        return this._secondaryBillingAddress;
    }

}