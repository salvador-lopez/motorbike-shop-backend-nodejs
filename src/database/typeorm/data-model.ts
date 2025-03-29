import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "customers" })
export class TypeOrmCustomer {
    @PrimaryColumn("uuid")
    readonly id: string;

    @Column({ type: "varchar", length: 255, unique: true })
    readonly email: string;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    readonly availableCredit: number;

    constructor(id: string, email: string, availableCredit: number) {
        this.id = id;
        this.email = email;
        this.availableCredit = availableCredit;
    }
}