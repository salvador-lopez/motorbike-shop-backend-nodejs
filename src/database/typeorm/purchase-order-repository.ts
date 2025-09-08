import {PurchaseOrder, PurchaseOrderRepository} from "../../domain/purchase-order";
import {TypeOrmOrderItem, TypeOrmPurchaseOrder} from "./datamodel/purchase-order";
import {EntityId} from "../../domain/common";
import {OrderItem} from "../../domain/order-item";
import {TypeOrmTransactionManager} from "./transaction-manager";


export class TypeOrmPurchaseOrderRepository implements PurchaseOrderRepository{

    private typeOrmRepoWithTransaction: TypeOrmTransactionManager;

    constructor({transactionManager}:{transactionManager: TypeOrmTransactionManager}) {
        this.typeOrmRepoWithTransaction = transactionManager;
    }

    async create(purchaseOrder: PurchaseOrder): Promise<void> {
        const typeOrmOrderItems = purchaseOrder
                                                    .orderItems
                                                    .map(({id,productId,quantity,unitPrice}) =>
                                                        new TypeOrmOrderItem(id.value, productId.value, quantity, unitPrice))

        await this.typeOrmRepoWithTransaction
                            .repository
                            .createQueryBuilder()
                            .insert()
                            .into(TypeOrmPurchaseOrder)
                            .values(new TypeOrmPurchaseOrder(purchaseOrder.id.value, purchaseOrder.customerId.value, []))
                            .execute();

        await this.typeOrmRepoWithTransaction
                            .repository
                            .createQueryBuilder()
                            .insert()
                            .into(TypeOrmOrderItem)
                            .values(
                                typeOrmOrderItems.map(item => ({...item,
                                    purchaseOrder: { id: purchaseOrder.id.value },
                                }))
                            )
                            .execute();
    }

   async findById(id: EntityId): Promise<PurchaseOrder | null> {
        const purchaseOrder = await this.typeOrmRepoWithTransaction.repository.findOneBy(TypeOrmPurchaseOrder, { id: id.value});

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