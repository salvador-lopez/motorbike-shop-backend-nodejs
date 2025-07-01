import { Command } from '@node-ts/bus-messages'
import {BillingAddressDTO, CustomerService} from "../../../services/customer";
import {handlerFor} from "@node-ts/bus-core";

export class CreateCustomerCommand extends Command {
    $name = 'customers/create-customer'
    $version = 0

    constructor (
        public readonly customerId: string,
        public readonly email: string,
        public readonly billingAddressDTO?: BillingAddressDTO
    ) {
        super()
    }
}

export const createCustomerHandler = handlerFor(
    CreateCustomerCommand,
    command => CustomerService.create(command.customerId, command.email, command.billingAddressDTO)
)