import {BillingAddressDTO, CustomerDTO, CustomerService} from "../../services/customer";
import {Request, Response} from "express";
import {DomainConflictError, EntityNotFoundError} from "../../domain/errors";
import {BusInstance} from "@node-ts/bus-core";
import {CreateCustomerCommand} from "../../messaging/node-ts-bus/commands/customer";
import {validate} from 'uuid'

export class CustomerController {
    private customerService: CustomerService;
    private commandBus: BusInstance;

    constructor({customerService, commandBus}: {customerService: CustomerService, commandBus: BusInstance}) {
        this.customerService = customerService;
        this.commandBus = commandBus;
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const {errorMessages, isInvalidPayload} = this.validatePayload(req.body);

            if(isInvalidPayload){
                res.status(400).send(errorMessages);
                return;
            }
            await this.commandBus.send(
                new CreateCustomerCommand(req.body.id, req.body.email, req.body.billing_address)
            );
            res.status(202).send();
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    }


    get = async (req: Request, res: Response) : Promise<void> => {
        try {
            const customerDTO = await this.customerService.get(req.params.id);
            res.status(200).send(this.serialize(customerDTO));
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                res.status(404).send(error.message);
                return;
            }
            if (error instanceof DomainConflictError) {
                res.status(400).send(error.message);
                return;
            }
            res.status(500).send("Internal Server Error");
        }
    }

    list = async (req: Request, res: Response): Promise<void> => {
        try {
            const customerDTOs: CustomerDTO[] = await this.customerService.getAll();
            res.status(200).send(customerDTOs.map(this.serialize));
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    }

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.customerService.delete(req.params.id);
            res.status(200).send();
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                res.status(404).send(error.message);
                return;
            }
            res.status(500).send("Internal Server Error");
        }
    }

    addCredit = async (req: Request, res: Response) : Promise<void> => {
        try {
            await this.customerService.addCredit(req.params.id, req.body.credit);
            res.status(200).send();
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                res.status(404).send(error.message);
                return;
            }
            if (error instanceof DomainConflictError) {
                res.status(400).send(error.message);
                return;
            }
            res.status(500).send("Internal Server Error");
        }
    }

    private serialize(customerDTO: CustomerDTO) {
        return {
            id: customerDTO.id,
            email: customerDTO.email,
            available_credit: customerDTO.availableCredit,
        };
    }

    private validatePayload({id, email, billing_address}:{id:string; email:string; billing_address?: BillingAddress}){
        const errorCustomer = this.validateCustomer(id,email)
        const errorBillingAddress = this.validateBillingAddress(billing_address)

        const isInvalidPayload = errorCustomer.length || errorBillingAddress.length

        return {isInvalidPayload, errorMessages: errorCustomer + errorBillingAddress}
    }

    private validateCustomer(id:string,email:string):string{
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let errorMessages = ''

        if(!validate(id)){
            errorMessages += `Invalid id: ${id}\n`
        }

        if(!regex.test(email)){
            errorMessages +=   `Invalid email: ${email}`
        }

        return errorMessages;
    }

    private validateBillingAddress=(billingAddressBody?:BillingAddressDTO):string=>{
        let errorMessage = ''
        if (!billingAddressBody) {
            return errorMessage;
        }

        const dtoKeys:(keyof  BillingAddressDTO)[]= ['country','city','state','zipCode','street']
        const bodyKeys = Object.keys(billingAddressBody) as (keyof  BillingAddressDTO)[];

        bodyKeys.forEach((key, i) => {
               if( !dtoKeys.includes(key)){
                   errorMessage += `the field {${key}} is invalid.\n`;
               }
            })

        dtoKeys.forEach((key, i) => {
            if( !bodyKeys.includes(key)){
                errorMessage += `the field {${key}} is required.\n`;
            }
        })

        return errorMessage
    }

}