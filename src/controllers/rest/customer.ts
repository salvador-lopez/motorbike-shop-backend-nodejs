import {CustomerDTO, CustomerService} from "../../services/customer";
import {Request, Response} from "express";
import {DomainConflictError, EntityNotFoundError} from "../../domain/errors";
import {TypeOrmBillingAddressRepository} from "../../database/typeorm/billingAddress-repository";
import {TypeOrmBillingAddress} from "../../database/typeorm/data-model";

export class CustomerController {
    private customerService: CustomerService;
    private typeOrmBillingAddress:TypeOrmBillingAddressRepository;

    constructor(customerService: CustomerService,typeOrmBillingAddress:TypeOrmBillingAddressRepository) {
        this.customerService = customerService;
        this.typeOrmBillingAddress = typeOrmBillingAddress;
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.customerService.create(req.body.id, req.body.email);
            req.body.billingAddress.customerId = req.body.id;
            await this.typeOrmBillingAddress.create(req.body.billingAddress);
            res.status(201).send();
        } catch (error) {
            console.log(error)
            if (error instanceof DomainConflictError) {
                res.status(400).send(error.message);
                return;
            }
            res.status(500).send("Internal Server Error");
        }
    }

    createBillingAddress = async (req: Request, res: Response): Promise<void> => {
        try {
            if(await this.typeOrmBillingAddress.getExist(req.body)){
                throw new DomainConflictError("Billing address already exists");
            }
            await this.typeOrmBillingAddress.create({...req.body,customerId:req.params.id});
            res.status(201).send();
        } catch (error) {
            console.log(error)
            if (error instanceof DomainConflictError) {
                res.status(400).send(error.message);
                return;
            }
            res.status(500).send("Internal Server Error");
        }
    }


    get = async (req: Request, res: Response) : Promise<void> => {
        try {
            const customerDTO = await this.customerService.get(req.params.id);
            const billingAddress = await this.typeOrmBillingAddress.getAllByCustomerId(req.params.id);
            res.status(200).send({...this.serialize(customerDTO),billing_address:billingAddress});
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
            res.status(200).send(customerDTOs.map((cus)=> this.serialize(cus)));
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
}