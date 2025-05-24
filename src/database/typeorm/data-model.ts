import {Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn} from 'typeorm'
import { EntityId } from '../../domain/common'

@Entity({ name: "customers" })
export class TypeOrmCustomer {
    @PrimaryColumn("uuid")
    readonly id: string;

    @Column({ type: "varchar", length: 255, unique: true })
    readonly email: string;

    @Column({ type: "decimal" })
    readonly availableCredit: number;

    @OneToMany(() => TypeOrmBillingAddress, (billingAddress) => billingAddress.customer)
    readonly billingAddresses!: TypeOrmBillingAddress[]

    constructor(id: string, email: string, availableCredit: number) {
        this.id = id;
        this.email = email;
        this.availableCredit = availableCredit;
    }
}



@Entity({ name: 'billing_addresses' })
export class TypeOrmBillingAddress {
  @PrimaryColumn('uuid')
  readonly id!: string

  @Column({ type: 'varchar', length: 50 })
  readonly street!: string

  @Column({ type: 'varchar', length: 50 })
  readonly city!: string

  @Column({ type: 'varchar', length: 50 })
  readonly state!: string

  @Column({ type: 'varchar', length: 50 })
  readonly zipCode!: string

  @Column({ type: 'varchar', length: 50 })
  readonly country!: string

  @ManyToOne(() => TypeOrmCustomer, (customer) => customer.billingAddresses, {})
  @JoinColumn({ name: 'customerId' })
  customer!: TypeOrmCustomer

  @Column({ name: 'customerId', type: 'uuid' })
  customerId!: string

    constructor( id:string,
                city:string,
                country:string,
                street:string,
                state:string,
                zipCode:string,
                customerId:string
              ) {
                this.id = id
                this.street = street
                this.city = city
                this.state = state
                this.zipCode = zipCode
                this.country = country
                this.customerId = customerId
              }
}