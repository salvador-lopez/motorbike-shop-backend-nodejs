export interface CustomerRepository {
    create(customer: Customer): Promise<void>;
}

export class Customer {
    private id: string;

    constructor(id: string) {
        this.id = id;
    }
}