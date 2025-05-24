import {Repository} from "typeorm/repository/Repository";
import {TypeOrmBillingAddress, TypeOrmCustomer} from "./data-model";


export class TypeOrmBillingAddressRepository {
    
    constructor(readonly  typeOrmBillingAddress:Repository<TypeOrmBillingAddress>) {
    }


     async create(billingAddress: TypeOrmBillingAddress) : Promise<void> {
        await this.typeOrmBillingAddress.insert(
            billingAddress
        );
    }

    async getAllByCustomerId(customerId: string) : Promise<TypeOrmBillingAddress[]> {
       return await this.typeOrmBillingAddress.find({
            where: {
                customerId: customerId
            },
           select: ["id", "street", "city", "country", "zipCode","state"]
        });


    }

    async getExist(billingAddress: TypeOrmBillingAddress) : Promise<boolean> {
        const duplications = await this.typeOrmBillingAddress.find({
            where: [
                { id: billingAddress.id },
                {
                  street: billingAddress.street,
                  city: billingAddress.city
                }
            ]
        });

        return duplications.length > 0;
    }
}