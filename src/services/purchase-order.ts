import { PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {EntityId} from "../domain/common";
import { EntityWithSameIdAlreadyExistError} from "../domain/errors";
import {OrderItem} from "../domain/order-item";


export class PurchaseOrderService {
    private repository: PurchaseOrderRepository;

    constructor(
        {purchaseOrderRepository}: { purchaseOrderRepository: PurchaseOrderRepository}
    ) {
        this.repository = purchaseOrderRepository;
    }

    public async create(id:string,customerId: string,orderItems:OrderItemDTO[]): Promise<void> {
      const orders = orderItems.map(dto => new OrderItem(new EntityId(dto.id),new EntityId(dto.productId),dto.quantity,dto.unitPrice));
      const newPurchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orders);

        let purchaseOrder = await this.repository.findById(newPurchaseOrder.id);
        if (purchaseOrder) {
            throw new EntityWithSameIdAlreadyExistError(newPurchaseOrder.id);
        }

      await this.repository.create(newPurchaseOrder);
    }
}

export class OrderItemDTO {
    readonly id:string
    readonly productId: string;
    readonly quantity: number;
    readonly unitPrice: number;

    constructor(id:string, productId: string, quantity: number, unitPrice: number) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}