import {BillingAddressDTO, CustomerService} from "../../services/customer";
import {Command, CommandHandler} from "../command";

export class CreateCustomerCommand implements Command {
    $name = 'customer/create'
    $version = 1
    
    constructor(
        readonly customerId: string,
        readonly email: string,
        readonly billingAddressDTO?: BillingAddressDTO,
    ) {
    }
}

export class CreateCustomerHandler implements CommandHandler<CreateCustomerCommand> {
    messageType = CreateCustomerCommand

    constructor(private readonly customerService: CustomerService){}

    async handle(command: CreateCustomerCommand): Promise<void> {
        try {
            await this.customerService.create(command.customerId, command.email, command.billingAddressDTO)
        } catch (error) {
            console.error(`[${this.messageType.name}] Handle Error:`, error);
            throw error;
        }
    }
}