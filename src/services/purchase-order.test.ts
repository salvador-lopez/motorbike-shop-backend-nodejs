import {mock, mockReset} from "jest-mock-extended";
import {v4 as UUID} from "uuid";
import { EntityId} from "../domain/common";
import {OrderItem, PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {OrderItemDTO, PurchaseOrderService} from "./purchase-order";
import {DomainConflictError, EntityWithSameIdAlreadyExistError} from "../domain/errors";
import {BillingAddressDTO} from "./customer";

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

    it.each ([["customerId"],['id']])(
        "throw DomainConflictError when %s is invalid",
        async (field) => {

            const ids = {
                customerId: UUID(),
                id :UUID()
            }
            const invalidId = {
                ...ids,
                [field]: "invalid-id",
            }
            const orderItemProductId= UUID()
            const orderItemPrice = 100000
            const orderItemQuantity = 1
            const orderItemsDto = [new OrderItemDTO(orderItemProductId, orderItemQuantity,  orderItemPrice)]

            mockRepository.create.mockImplementationOnce(async () => {
            });

            const resultPromise = purchaseOrderService.create(invalidId.id, invalidId.customerId,orderItemsDto);
            await expect(resultPromise).rejects.toThrow("Invalid UUID: " + invalidId[field as keyof typeof invalidId]);
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);

        }
    );

    it('throw EntityWithSameEmailAlreadyExistError', async () => {
        const id = UUID();
        const customerId = UUID()
        const orderItemProductId= UUID()
        const orderItemPrice = 100000
        const orderItemQuantity = 1
        const orderItem = [new OrderItem(new EntityId(orderItemProductId), orderItemQuantity, orderItemPrice)]
        const orderItemsDto = [new OrderItemDTO(orderItemProductId, orderItemQuantity,  orderItemPrice)]

        mockRepository.findById.mockImplementationOnce(async () =>
            new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItem)
        );

        const resultPromise = purchaseOrderService.create(id, customerId, orderItemsDto)

        expect(mockRepository.findById).toHaveBeenCalledWith(new EntityId(id));
        await expect(resultPromise).rejects.toThrow(`Entity with id ${id} already exists.`);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameIdAlreadyExistError);
    })
})