import {mock, mockReset} from "jest-mock-extended";
import {v4 as UUID} from "uuid";
import { EntityId} from "../domain/common";
import { PurchaseOrder, PurchaseOrderRepository} from "../domain/purchase-order";
import {OrderItemDTO, PurchaseOrderDTO, PurchaseOrderService} from "./purchase-order";
import {DomainConflictError, EntityNotFoundError, EntityWithSameIdAlreadyExistError} from "../domain/errors";
import {OrderItem} from "../domain/order-item";
import {UnitOfWork} from "./unit-of-work";

describe('PurchaseOrderService', () => {
    const mockRepository = mock<PurchaseOrderRepository>();
    const mockUnitOfWork = mock<UnitOfWork>();
    const purchaseOrderService = new PurchaseOrderService({purchaseOrderRepository: mockRepository, unitOfWork: mockUnitOfWork });

    beforeEach(() => {
        mockReset(mockRepository);
        mockReset(mockUnitOfWork);
    });

    describe('create', () => {
    beforeEach(() => {
        mockUnitOfWork.transaction.mockImplementationOnce(async (callback) => {
            return await callback();
        })
    });

    it('create happy path', async () => {
        const id = UUID();
        const customerId = UUID()
        const orderItemId= UUID()
        const orderItemProductId= UUID()
        const orderItemPrice = 100000
        const orderItemQuantity = 1
        const orderItem = [new OrderItem(new EntityId(orderItemId),new EntityId(orderItemProductId), orderItemQuantity, orderItemPrice)]
        const orderItemsDto = [new OrderItemDTO(orderItemId, orderItemProductId, orderItemQuantity,  orderItemPrice)]

        const expectedPurchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItem);

        mockRepository.findById.mockImplementationOnce(async () => null);

        await expect(purchaseOrderService.create(id, customerId,orderItemsDto)).resolves.toBeUndefined();
        expect(mockRepository.findById).toHaveBeenCalledWith(new EntityId(id));
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
            const orderItemId= UUID()
            const orderItemProductId= UUID()
            const orderItemPrice = 100000
            const orderItemQuantity = 1
            const orderItemsDto = [new OrderItemDTO(orderItemId, orderItemProductId, orderItemQuantity,  orderItemPrice)]

            mockRepository.create.mockImplementationOnce(async () => {
            });

            const resultPromise = purchaseOrderService.create(invalidId.id, invalidId.customerId,orderItemsDto);
            await expect(resultPromise).rejects.toThrow("Invalid UUID: " + invalidId[field as keyof typeof invalidId]);
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);

        }
    );

    it('throw EntityWithSameIdAlreadyExistError', async () => {
        const id = UUID();
        const customerId = UUID()
        const orderItemId= UUID()
        const orderItemProductId= UUID()
        const orderItemPrice = 100000
        const orderItemQuantity = 1
        const orderItem = [new OrderItem(new EntityId(orderItemId), new EntityId(orderItemProductId), orderItemQuantity, orderItemPrice)]
        const orderItemsDto = [new OrderItemDTO(orderItemId,orderItemProductId, orderItemQuantity,  orderItemPrice)]

        mockRepository.findById.mockImplementationOnce(async () =>
            new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItem)
        );

        const resultPromise = purchaseOrderService.create(id, customerId, orderItemsDto)

        expect(mockRepository.findById).toHaveBeenCalledWith(new EntityId(id));
        await expect(resultPromise).rejects.toThrow(`Entity with id ${id} already exists.`);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameIdAlreadyExistError);
    })
    })

    describe('get', ()=>{

    it('should return the purchase order',async ()=>{
        const id = UUID();
        const customerId = UUID()
        const orderItemId= UUID()
        const orderItemProductId= UUID()
        const orderItemPrice = 100000
        const orderItemQuantity = 1
        const orderItem = [new OrderItem(new EntityId(orderItemId), new EntityId(orderItemProductId), orderItemQuantity, orderItemPrice)]
        const orderItemsDto = [new OrderItemDTO(orderItemId,orderItemProductId, orderItemQuantity,  orderItemPrice)]
        const expectedPurchaseOrder = new PurchaseOrderDTO(id, customerId, orderItemsDto)

        const purchaseOrder = new PurchaseOrder(new EntityId(id), new EntityId(customerId), orderItem);

        mockRepository.findById.mockImplementationOnce(async () => purchaseOrder);

        const result =  await purchaseOrderService.get(id)

        expect(mockRepository.findById).toHaveBeenCalledWith(new EntityId(id));
        expect(result.id).toEqual(expectedPurchaseOrder.id);
        expect(result.customerId).toEqual(expectedPurchaseOrder.customerId);
        expect(result.orderItems).toEqual(expectedPurchaseOrder.orderItems);
    })

    it('should throw EntityNotFound',async ()=>{
        const id = UUID();

        mockRepository.findById.mockImplementationOnce(async () => null);

        const resultPromise =  purchaseOrderService.get(id)

        expect(mockRepository.findById).toHaveBeenCalledWith(new EntityId(id));
        await expect(resultPromise).rejects.toThrow(`Entity not found with id ${id}`);
        await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
    })
    })

})