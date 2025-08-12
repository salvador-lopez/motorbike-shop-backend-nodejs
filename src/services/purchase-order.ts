import {OrderItem, PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {EntityId} from "../domain/common";


export class PurchaseOrderService {
    private repository: PurchaseOrderRepository;

    constructor(
        {purchaseOrderRepository}: { purchaseOrderRepository: PurchaseOrderRepository}
    ) {
        this.repository = purchaseOrderRepository;
    }

    public async create(id:string,customerId: string,orderItems:OrderItemDTO[]): Promise<void> {
        const orders = orderItems.map(dto => new OrderItem(new EntityId(dto.productId),dto.quantity,dto.unitPrice));
      const purchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orders);

      await this.repository.create(purchaseOrder);
    }
}

export class OrderItemDTO {
    readonly productId: string;
    readonly quantity: number;
    readonly unitPrice: number;

    constructor(productId: string, quantity: number, unitPrice: number) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}