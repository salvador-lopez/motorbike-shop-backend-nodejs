import {PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {EntityId} from "../domain/common";


export class PurchaseOrderService {
    private repository: PurchaseOrderRepository;

    constructor(
        {purchaseOrderRepository}: { purchaseOrderRepository: PurchaseOrderRepository}
    ) {
        this.repository = purchaseOrderRepository;
    }

    public async create(id:string,customerId: string): Promise<void> {
      const purchaseOrder = new PurchaseOrder(new EntityId(id),new EntityId(customerId));

      await this.repository.create(purchaseOrder);

    }

}