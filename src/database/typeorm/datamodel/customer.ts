import { Entity, PrimaryColumn, Column } from "typeorm";

export class TypeOrmBillingAddress  {
    @Column({ type: 'varchar', nullable: true })
    readonly street: string;

    @Column({ type: 'varchar', nullable: true })
    readonly city: string;

    @Column({ type: 'varchar', nullable: true })
    readonly  zipCode: string;

    @Column({ type: 'varchar', nullable: true })
    readonly state: string;

    @Column({ type: 'varchar', nullable: true })
    readonly country: string;

    constructor(street: string, city: string, zipCode: string, state: string, country: string) {
        this.street = street;
        this.city = city;
        this.zipCode = zipCode;
        this.state = state;
        this.country = country;
    }
}

@Entity({ name: "customers" })
export class TypeOrmCustomer {
    @PrimaryColumn("uuid")
    readonly id: string;

    @Column({ type: "varchar", length: 255, unique: true })
    readonly email: string;

    @Column({ type: "decimal" })
    readonly availableCredit: number;

    @Column(()=> TypeOrmBillingAddress, {  prefix: "billing_address_" })
    billingAddress?: TypeOrmBillingAddress;

    @Column(()=> TypeOrmBillingAddress, {  prefix: "secondary_billing_address_" })
    secondaryBillingAddress?: TypeOrmBillingAddress;

    constructor(id: string, email: string, availableCredit: number, billingAddress?: TypeOrmBillingAddress, secondaryBillingAddress?:TypeOrmBillingAddress) {
        this.id = id;
        this.email = email;
        this.availableCredit = availableCredit;
        this.billingAddress = billingAddress;
        this.secondaryBillingAddress = secondaryBillingAddress;
    }
}