import {PurchaseOrder, PurchaseOrderRepository} from "../../domain/purchase-order";
import {Repository} from "typeorm/repository/Repository";
import {TypeOrmOrderItem, TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {EntityId} from "../../domain/common";
import {OrderItem} from "../../domain/order-item";


export class TypeOrmPurchaseOrderRepository implements PurchaseOrderRepository{

    private typeOrmRepo: Repository<TypeOrmPurchaseOrder>;

    constructor({purchaseOrderRepositoryConn}:{purchaseOrderRepositoryConn: Repository<TypeOrmPurchaseOrder>}) {
        this.typeOrmRepo = purchaseOrderRepositoryConn;
    }

    async create(purchaseOrder: PurchaseOrder): Promise<void> {
        const typeOrmOrderItems = purchaseOrder
                                                    .orderItems
                                                    .map(({id,productId,quantity,unitPrice}) =>
                                                        new TypeOrmOrderItem(id.value, productId.value, quantity, unitPrice))

        await this.typeOrmRepo.save(new TypeOrmPurchaseOrder(purchaseOrder.id.value, purchaseOrder.customerId.value, typeOrmOrderItems));
    }

   async findById(id: EntityId): Promise<PurchaseOrder | null> {
        const purchaseOrder = await this.typeOrmRepo.findOneBy({ id: id.value});

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