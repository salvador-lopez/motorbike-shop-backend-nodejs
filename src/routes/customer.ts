import {Router} from "express";
import {getDataSource} from "../database/typeorm/data-source";
import {CustomerService} from "../services/customer";
import {TypeOrmCustomer} from "../database/typeorm/data-model";
import {TypeOrmCustomerRepository} from "../database/typeorm/customer-repository";
import {CustomerController} from "../controllers/rest/customer";

const createRouter = (customerController: CustomerController): Router => {
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
     *                 format: uuid
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
    router.post('/customers', customerController.create);

    /**
     * @openapi
     * /customers/{id}:
     *   get:
     *     summary: Get customer by ID
     *     description: Get Customer by ID.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         type: string
     *         format: uuid
     *         description: The unique identifier of the customer
     *         example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
     *     responses:
     *       200:
     *         description: Customer successfully returned
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                   description: The unique identifier of the customer
     *                 email:
     *                   type: string
     *                   format: email
     *                   description: The email address of the customer
     *                 available_credit:
     *                   type: number
     *                   format: float
     *                   description: The available credit for the customer
     *                   example: 150.75
     *       404:
     *         description: Customer not found
     *       500:
     *         description: Internal server error
     */
    router.get('/customers/:id', customerController.get);

    /**
     * @openapi
     * /customers:
     *   get:
     *     summary: Get all customers
     *     description: Retrieves a list of all customers.
     *     responses:
     *       200:
     *         description: Successfully retrieved the list of customers.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     *                     description: The unique identifier of the customer.
     *                     example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
     *                   email:
     *                     type: string
     *                     format: email
     *                     description: The email address of the customer.
     *                     example: "customer@example.com"
     *                   available_credit:
     *                     type: number
     *                     format: float
     *                     description: The available credit for the customer.
     *                     example: 150.75
     *       500:
     *         description: Internal server error.
     */
    router.get('/customers', customerController.list);

    /**
     * @openapi
     * /customers/{id}:
     *   delete:
     *     summary: Delete a customer
     *     description: Removes a customer from the system using their unique ID.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         type: string
     *         format: uuid
     *         description: The unique identifier of the customer
     *         example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
     *     responses:
     *       200:
     *         description: Customer successfully deleted
     *       404:
     *         description: Customer not found
     *       500:
     *         description: Internal server error
     */
    router.delete('/customers/:id', customerController.delete);

    /**
     * @openapi
     * /customers/{id}/add-credit:
     *   patch:
     *     summary: Add credit to a customer
     *     description: Updates a customer's credit balance using their unique ID and the provided credit amount.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *           description: The unique identifier of the customer
     *           example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               credit:
     *                 type: number
     *                 description: The amount of credit to add to the customer's account
     *                 example: 100
     *             required:
     *               - credit
     *     responses:
     *       200:
     *         description: Credit successfully added to the customer's account
     *       400:
     *         description: Conflict or invalid credit operation
     *       404:
     *         description: Customer not found
     *       500:
     *         description: Internal server error
     */

    router.patch('/customers/:id/add-credit', customerController.addCredit);

    return router;
};

const customerServiceInstance = new CustomerService(
    new TypeOrmCustomerRepository(getDataSource().getRepository(TypeOrmCustomer))
);
const customerControllerInstance = new CustomerController(customerServiceInstance);

const customerRouter = createRouter(customerControllerInstance);

export default customerRouter;