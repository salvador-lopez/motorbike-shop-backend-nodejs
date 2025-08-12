import {mock, mockReset} from "jest-mock-extended";
import {v4 as UUID} from "uuid";
import { EntityId} from "../domain/common";
import {PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {PurchaseOrderService} from "./purchase-order";

describe('PurchaseOrderService', () => {
    const mockRepository = mock<PurchaseOrderRepository>();
    const purchaseOrderService = new PurchaseOrderService({purchaseOrderRepository: mockRepository});

    beforeEach(() => {
        mockReset(mockRepository);
    });

    it('create happy path', async () => {
        const id = UUID();
        const customerId = UUID()
        const expectedPurchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId));

        mockRepository.create.mockImplementationOnce(async () => {
        });

        await expect(purchaseOrderService.create(id, customerId)).resolves.toBeUndefined();
        expect(mockRepository.create).toHaveBeenCalledWith(expectedPurchaseOrder);
    })
})