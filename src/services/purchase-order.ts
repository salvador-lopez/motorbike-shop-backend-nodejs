import { PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {EntityId} from "../domain/common";
import {EntityNotFoundError, EntityWithSameIdAlreadyExistError} from "../domain/errors";
import {OrderItem} from "../domain/order-item";
import {UnitOfWork} from "./unit-of-work";


export class PurchaseOrderService {
    private repository: PurchaseOrderRepository;
    private unitOfWork: UnitOfWork;

    constructor(
        {purchaseOrderRepository, unitOfWork}: { purchaseOrderRepository: PurchaseOrderRepository, unitOfWork: UnitOfWork}

    ) {
        this.unitOfWork = unitOfWork;
        this.repository = purchaseOrderRepository;
    }

    public async create(id:string,customerId: string,orderItems:OrderItemDTO[]): Promise<void> {
        await this.unitOfWork.transaction(async () => {
            const orders = orderItems.map(dto => new OrderItem(new EntityId(dto.id), new EntityId(dto.productId), dto.quantity, dto.unitPrice));
            const newPurchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orders);

            const purchaseOrder = await this.repository.findById(newPurchaseOrder.id);
            if (purchaseOrder) {
                throw new EntityWithSameIdAlreadyExistError(newPurchaseOrder.id);
            }

            await this.repository.create(newPurchaseOrder);
        })
    }

    public async get(id:string): Promise<PurchaseOrderDTO>{
        const entityId = new EntityId(id);

        const purchaseOrder = await this.repository.findById(entityId);

        if (!purchaseOrder) {
            throw new EntityNotFoundError(entityId);
        }

        return this.buildPurchaseOrderDTO(purchaseOrder);
    }

    private buildPurchaseOrderDTO(purchaseOrder: PurchaseOrder): PurchaseOrderDTO {
        return new PurchaseOrderDTO(purchaseOrder.id.value, purchaseOrder.customerId.value, purchaseOrder.orderItems.map(this.buildOrderItemDTO));
    }

    private buildOrderItemDTO(orderItem: OrderItem): OrderItemDTO  {
        return new OrderItemDTO(orderItem.id.value, orderItem.productId.value, orderItem.quantity, orderItem.unitPrice);
    }
}

export class PurchaseOrderDTO {
    readonly id: string;
    readonly customerId: string;
    readonly orderItems: OrderItemDTO[];

    constructor(id: string, customerId: string, orderItems: OrderItemDTO[]) {
        this.id = id;
        this.customerId = customerId;
        this.orderItems = orderItems;
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