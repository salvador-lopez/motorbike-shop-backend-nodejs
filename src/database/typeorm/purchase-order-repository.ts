import {PurchaseOrder, PurchaseOrderRepository} from "../../domain/purchase-order";
import {TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {EntityId} from "../../domain/common";
import {OrderItem} from "../../domain/order-item";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmOrderItem} from "./datamodel/order-item";


export class TypeOrmPurchaseOrderRepository implements PurchaseOrderRepository{

    private purchaseOrderRepository: Repository<TypeOrmPurchaseOrder>;
    private orderItemRepository: Repository<TypeOrmOrderItem>;

    constructor({ purchaseOrderRepositoryConn, orderItemRepositoryConn } : {
        purchaseOrderRepositoryConn:  Repository<TypeOrmPurchaseOrder>, orderItemRepositoryConn: Repository<TypeOrmOrderItem>}) {

         this.purchaseOrderRepository = purchaseOrderRepositoryConn;
         this.orderItemRepository = orderItemRepositoryConn;
    }

    async create(purchaseOrder: PurchaseOrder): Promise<void> {
        const typeOrmOrderItems = purchaseOrder
                                                    .orderItems
                                                    .map(({id,productId,quantity,unitPrice}) =>
                                                        new TypeOrmOrderItem(id.value, productId.value, quantity, unitPrice))

        await this.purchaseOrderRepository
                            .insert(new TypeOrmPurchaseOrder(purchaseOrder.id.value, purchaseOrder.customerId.value, []));

        await this.orderItemRepository
                            .insert(
                                typeOrmOrderItems.map(item => ({...item,
                                    purchaseOrder: { id: purchaseOrder.id.value },
                                }))
                            )
    }

   async findById(id: EntityId): Promise<PurchaseOrder | null> {
        const purchaseOrder = await this.purchaseOrderRepository.findOneBy({ id: id.value});

        if (!purchaseOrder) {
            return null;
        }

        return this.toDomainEntity(purchaseOrder);
    }

    private toDomainEntity(purchaseOrderData: TypeOrmPurchaseOrder): PurchaseOrder {
        const {orderItems,id,customerId} = purchaseOrderData;
        const orderItemsEntity = orderItems
            .map(({id, productId, unitPrice, quantity}) => new OrderItem(new EntityId(id),new EntityId(productId),quantity,unitPrice))

        return new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItemsEntity);
    }
}