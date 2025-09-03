import { makeInvoker } from "awilix-express";
import { Router } from "express";
import { PurchaseOrderController } from "../controllers/rest/purchase-order";

const purchaseOrderController = makeInvoker(PurchaseOrderController);
const router = Router();

/**
 * @openapi
 * /purchase-orders:
 *   post:
 *     summary: Create a new purchase order
 *     description: Creates a new purchase order with the provided items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - customer_id
 *               - order_items
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: The unique identifier for the purchase order
 *                 example: "a900b991-f7d7-4828-b0c2-29aec93f10fd"
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the customer placing the order
 *                 example: "84bf21c2-71b7-4a97-a172-efb746403aa9"
 *               order_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - product_id
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier for the order item
 *                       example: "7e6d5c4b-3a2b-1c0d-9e8f-7a6b5c4d3e2f"
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the product being ordered
 *                       example: "04746a2a-f514-489f-a357-4499dbd6bc20"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantity of the product
 *                       example: 2
 *                     unit_price:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       description: Price per unit of the product
 *                       example: 999.99
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *       400:
 *         description: Invalid input data or duplicate order ID
 *       500:
 *         description: Internal server error
 */
router.post('/purchase-orders', purchaseOrderController('create'));

/**
 * @openapi
 * /purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     description: Retrieve a purchase order with the specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the purchase order
 *         example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
 *     responses:
 *       200:
 *         description: Purchase order found and returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: The unique identifier of the purchase order
 *                   example: "9f2f9e08-93b6-47c1-a54e-5cffc6f59e4b"
 *                 customer_id:
 *                   type: string
 *                   format: uuid
 *                   description: The ID of the customer who placed the order
 *                   example: "8e7d6c5b-4a3b-2c1d-0e9f-8a7b6c5d4e3f"
 *                 order_items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "7e6d5c4b-3a2b-1c0d-9e8f-7a6b5c4d3e2f"
 *                       product_id:
 *                         type: string
 *                         format: uuid
 *                         example: "6d5c4b3a-2b1c-0d9e-8f7a-6b5c4d3e2f1a"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       unit_price:
 *                         type: number
 *                         format: float
 *                         example: 999.99
 *       404:
 *         description: Purchase order not found
 *       500:
 *         description: Internal server error
 */
router.get('/purchase-orders/:id', purchaseOrderController('get'));

export default router