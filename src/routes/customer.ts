import {Request, Response, Router} from "express";
import {getDataSource, testDataSource} from "../database/typeorm/data-source";
import {CustomerService} from "../services/customer";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {TypeOrmCustomerRepository} from "../database/typeorm/customer-repository";

const createRouter = (customerService: CustomerService): Router => {
    const router = Router();

    /**
     * @openapi
     * /customers:
     *   post:
     *     summary: Create customer endpoint
     *     description: Creates a new customer with a unique ID and email.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: The unique identifier for the customer
     *                 example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: The email address of the customer
     *                 example: "customer@example.com"
     *             required:
     *               - id
     *               - email
     *     responses:
     *       201:
     *         description: Resource created successfully. No content returned.
     *       400:
     *         description: Bad request. Invalid or missing parameters.
     *       500:
     *         description: Internal server error.
     */
    router.post('/customers', async (req: Request, res: Response) => {
        await customerService.create(req.body.id, req.body.email);

        res.status(201).send();
    });

    return router;
};

const customerServiceInstance = new CustomerService(
    new TypeOrmCustomerRepository(getDataSource().getRepository(TypeOrmCustomer))
);

const customerRouter = createRouter(customerServiceInstance);

export default customerRouter;