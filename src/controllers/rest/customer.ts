import {CustomerDTO, CustomerService} from "../../services/customer";
import {Request, Response} from "express";
import {DomainConflictError, EntityNotFoundError} from "../../domain/errors";

export class CustomerController {
    private customerService: CustomerService;

    constructor(customerService: CustomerService) {
        this.customerService = customerService;
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.customerService.create(req.body.id, req.body.email,req.body.billing_address);
            res.status(201).send();
        } catch (error) {
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
}