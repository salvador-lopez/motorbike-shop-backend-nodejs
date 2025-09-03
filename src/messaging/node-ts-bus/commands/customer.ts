import { Command } from '@node-ts/bus-messages'
import {BillingAddressDTO, CustomerService} from "../../../services/customer";
import {Handler} from "@node-ts/bus-core";

export class CreateCustomerCommand extends Command {
    $name = 'customer/create'
    $version = 1
    
    constructor(
        readonly customerId: string,
        readonly email: string,
        readonly billingAddressDTO?: BillingAddressDTO,
    ) {
        super();
    }
}

export class CreateCustomerHandler implements Handler<CreateCustomerCommand> {
    messageType  = CreateCustomerCommand

    constructor(private readonly customerService: CustomerService) {}

    async handle(command: CreateCustomerCommand): Promise<void> {
        try {
            await this.customerService.create(command.customerId, command.email, command.billingAddressDTO)
        } catch (error) {
            console.error(`[${this.messageType.name}] Handle Error:`, error);
            throw error;
        }

    }
}