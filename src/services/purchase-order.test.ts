import {mock, mockReset} from "jest-mock-extended";
import {v4 as UUID} from "uuid";
import { EntityId} from "../domain/common";
import {OrderItem, PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {OrderItemDTO, PurchaseOrderService} from "./purchase-order";

describe('PurchaseOrderService', () => {
    const mockRepository = mock<PurchaseOrderRepository>();
    const purchaseOrderService = new PurchaseOrderService({purchaseOrderRepository: mockRepository});

    beforeEach(() => {
        mockReset(mockRepository);
    });

    it('create happy path', async () => {
        const id = UUID();
        const customerId = UUID()
        const orderItemProductId= UUID()
        const orderItemPrice = 100000
        const orderItemQuantity = 1
        const orderItem = [new OrderItem(new EntityId(orderItemProductId), orderItemQuantity, orderItemPrice)]
        const orderItemsDto = [new OrderItemDTO(orderItemProductId, orderItemQuantity,  orderItemPrice)]

        const expectedPurchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItem);

        mockRepository.create.mockImplementationOnce(async () => {
        });

        await expect(purchaseOrderService.create(id, customerId,orderItemsDto)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedPurchaseOrder);
    })
})