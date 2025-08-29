import {OrderItemDTO, PurchaseOrderDTO, PurchaseOrderService} from "../../services/purchase-order";
import {Request, Response} from "express";
import {DomainConflictError, EntityNotFoundError} from "../../domain/errors";

export class PurchaseOrderController {
    private purchaseOrderService: PurchaseOrderService;

    constructor({purchaseOrderService}: { purchaseOrderService: PurchaseOrderService }) {
        this.purchaseOrderService = purchaseOrderService;
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {

           await this.purchaseOrderService.create(req.body.id, req.body.customer_id, req.body.order_items.map(this.deserializeOrderItem))

            res.status(201).send();
        } catch (error) {
            if(error instanceof  DomainConflictError){
                res.status(400).send(error.message);
                return;
            }

            res.status(500).send("Internal Server Error");
        }
    }

    get = async (req: Request, res: Response) : Promise<void> => {
        try {
            const purchaseOrderDTO = await this.purchaseOrderService.get(req.params.id)
            res.status(200).send(this.serialize(purchaseOrderDTO));
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                res.status(404).send(error.message);
                return;
            }
            if(error instanceof  DomainConflictError){
                res.status(400).send(error.message);
                return;
            }

            res.status(500).send("Internal Server Error");
        }
    }

    private serialize(purchaseOrderDTO: PurchaseOrderDTO) {
        return {
            id: purchaseOrderDTO.id,
            customer_id: purchaseOrderDTO.customerId,
            order_items: purchaseOrderDTO.orderItems.map(this.serializeOrderItem),
        };
    }

    private serializeOrderItem(orderItem:OrderItemDTO){
        return {
            id: orderItem.id,
            product_id: orderItem.productId,
            quantity: orderItem.quantity,
            unit_price: orderItem.unitPrice
        }
    }

    private deserializeOrderItem(payload:{id: string,product_id:string,quantity: string,unit_price: string}){
        return new OrderItemDTO(payload.id,payload.product_id,Number(payload.quantity),Number(payload.unit_price))
    }
}