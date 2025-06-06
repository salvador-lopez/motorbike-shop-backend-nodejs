import {CustomerDTO, CustomerService} from './customer';
import {BillingAddress, Customer, CustomerRepository} from '../domain/customer';
import {BillingAddressDTO} from './customer';
import {v4 as UUID} from "uuid";
import { mock, mockReset } from 'jest-mock-extended';
import {
    DomainConflictError,
    EntityNotFoundError,
    EntityWithSameEmailAlreadyExistError,
    EntityWithSameIdAlreadyExistError
} from "../domain/errors";
import {EntityId, Email, Credit} from "../domain/common";
import { CustomerCache } from "./cache";

describe('CustomerService', () => {
    const mockRepository = mock<CustomerRepository>();
    const mockCache = mock<CustomerCache>();
    const customerService = new CustomerService(mockRepository,mockCache)

    beforeEach(() => {
        mockReset(mockRepository);
        mockReset(mockCache);
    });

    describe('create', () => {
        it('happy path', async () => {
            const id = UUID();
            const email = "email@example.com";
            const expectedCustomer = new Customer(new EntityId(id), new Email(email));
            expect(expectedCustomer.availableCredit.value).toBe(0);

            mockRepository.create.mockImplementationOnce(async () => {});

            await expect(customerService.create(id, email)).resolves.toBeUndefined();
            expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);
        });

        it('happy path with billing address', async () => {
            const id = UUID();
            const email = "email@example.com";
            const street = 'Carrer de Llepant';
            const city = 'Barcelona';
            const state = 'Cataluña';
            const zipCode = '08032';
            const country = 'Spain';

            const expectedCustomer = new Customer(
                new EntityId(id),
                new Email(email),
                new BillingAddress(street, city, state, zipCode, country)
            );

            mockRepository.create.mockImplementationOnce(async () => {});

            const billingAddressDTO = new BillingAddressDTO(street, city, state, zipCode, country);
            await expect(customerService.create(id, email, billingAddressDTO)).resolves.toBeUndefined();
            expect(mockRepository.create).toHaveBeenCalledWith(expectedCustomer);
        });

        it('throw DomainConflictError when uuid is invalid', async () => {
            const id = "invalid-uuid";
            const email = "email@example.com";
            mockRepository.create.mockImplementationOnce(async () => {});

            const resultPromise = customerService.create(id, email);

            await expect(resultPromise).rejects.toThrow("Invalid UUID: invalid-uuid");
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
        });

        it('throw DomainConflictError when email is invalid', async () => {
            const id = UUID();
            const email = "invalid-email";
            mockRepository.create.mockImplementationOnce(async () => {});

            const resultPromise = customerService.create(id, email);

            await expect(resultPromise).rejects.toThrow("Invalid email: invalid-email");
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
        });

        it('throw EntityWithSameIdAlreadyExistError', async () => {
            const id = UUID();
            const email = "email@example.com";

            mockRepository.findById.mockImplementationOnce(async () => {
                return new Customer(new EntityId(id), new Email(email));
            });

            const resultPromise = customerService.create(id, email);

            await expect(resultPromise).rejects.toThrow(`Entity with id ${id} already exists.`);
            await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameIdAlreadyExistError);
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
        });

        describe('BillingAddress validation', () => {
            const id = UUID();
            const email = "email@example.com";
            mockRepository.create.mockImplementation(async () => {});
            mockRepository.save.mockImplementation(async () => {});

            const baseAddress = {
                street: 'Carrer de Llepant',
                city: 'Barcelona',
                state: 'Cataluña',
                zipCode: '08032',
                country: 'Spain',
            };

            const anotherAddress = {
                street: 'Paraguay',
                city: 'Parana',
                state: 'Entre Rios',
                zipCode: '3100',
                country: 'Argentina',
            }

            it.each([['street'], ['city'], ['state'], ['zipCode'], ['country']])(
                "throw DomainConflictError when BillingAddress.%s is empty",
                async (field) => {
                    const invalidAddress = {
                        ...baseAddress,
                        [field]: "",
                    };
                    const billingAddressDTO = new BillingAddressDTO(
                        invalidAddress.street,
                        invalidAddress.city,
                        invalidAddress.state,
                        invalidAddress.zipCode,
                        invalidAddress.country,
                    );

                    const resultPromise = customerService.create(id, email, billingAddressDTO);

                    await expect(resultPromise).rejects.toThrow(`BillingAddress: '${field}' must be a non-empty string`);
                    await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
                }
            );

            it('should add billing address if not exist', async () => {
                const id = UUID();

                const customer = new Customer(
                    new EntityId(id),
                    new Email(email)
                );

                const expectedCustomer = new Customer(
                    new EntityId(id),
                    new Email(email),
                    new BillingAddress(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country)
                );

                mockRepository.findById.mockImplementation(async () => customer);


                const billingAddressDTO = new BillingAddressDTO(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country);
                await expect(customerService.addBillingAddress(id, billingAddressDTO)).resolves.toBeUndefined();
                expect(mockRepository.save).toHaveBeenCalledWith(expectedCustomer);


            })

            it('should add secondary billing address if billing address exist', async () => {
                const id = UUID();

                const customer = new Customer(
                    new EntityId(id),
                    new Email(email),
                    new BillingAddress(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country)
                );

                const expectedCustomer = new Customer(
                    new EntityId(id),
                    new Email(email),
                    new BillingAddress(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country),
                );

                expectedCustomer.addBillingAddress(new BillingAddress(anotherAddress.street, anotherAddress.city, anotherAddress.state, anotherAddress.zipCode, anotherAddress.country))

                mockRepository.findById.mockImplementation(async () => customer);


                const billingAddressDTO = new BillingAddressDTO(anotherAddress.street, anotherAddress.city, anotherAddress.state, anotherAddress.zipCode, anotherAddress.country);
                await expect(customerService.addBillingAddress(id, billingAddressDTO)).resolves.toBeUndefined();
                expect(mockRepository.save).toHaveBeenCalledWith(expectedCustomer);


            })

            it('throw DomainConflictError if billing address already exist', async () => {
                const id = UUID();

                const customer = new Customer(
                    new EntityId(id),
                    new Email(email),
                    new BillingAddress(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country)
                );

                mockRepository.findById.mockImplementation(async () => customer);

                const billingAddressDTO = new BillingAddressDTO(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country);

                const resultPromise = customerService.addBillingAddress(id, billingAddressDTO);

                await expect(resultPromise).rejects.toThrow('This billing address already exist');
                await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
            })

            it('throw DomainConflictError if the billing address limit is reached', async () => {
                const id = UUID();

                const customer = new Customer(
                    new EntityId(id),
                    new Email(email),
                    new BillingAddress(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country)
                );

                customer.addBillingAddress(new BillingAddress(anotherAddress.street, anotherAddress.city, anotherAddress.state, anotherAddress.zipCode, anotherAddress.country))

                mockRepository.findById.mockImplementation(async () => customer);

                const thirdBillingAddress = new BillingAddressDTO("25 de Mayo",'CABA','Buenos Aires','3424','Argentina');

                const resultPromise = customerService.addBillingAddress(id, thirdBillingAddress);

                await expect(resultPromise).rejects.toThrow('Maximum number of billing addresses reached.');
                await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
            })


            it('throw EntityNotFoundError if customer doesn`t exist', async () => {
                const id = UUID();

                mockRepository.findById.mockImplementationOnce(async () => {
                    return null;
                });

                const billingAddressDTO = new BillingAddressDTO(baseAddress.street, baseAddress.city, baseAddress.state, baseAddress.zipCode, baseAddress.country);

                const resultPromise = customerService.addBillingAddress(id,billingAddressDTO);

                await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
                await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
            });
        });

        it('throw EntityWithSameEmailAlreadyExistError', async () => {
            const id = UUID();
            const email = "email@example.com";

            mockRepository.findByEmail.mockImplementationOnce(async () => {
                return new Customer(new EntityId(UUID()), new Email(email));
            });

            const resultPromise = customerService.create(id, email);

            await expect(resultPromise).rejects.toThrow(`Entity with email ${email} already exists.`);
            await expect(resultPromise).rejects.toBeInstanceOf(EntityWithSameEmailAlreadyExistError);
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
        });

        it('propagate the Exception thrown by the repository', async () => {
            const id = UUID();
            const email = "email@example.com";
            const expectedErrorMsg = "unexpected error message";
            mockRepository.create.mockImplementationOnce(async () => {
                throw new Error(expectedErrorMsg);
            });

            const resultPromise = customerService.create(id, email);

            await expect(resultPromise).rejects.toThrow(expectedErrorMsg);
            await expect(resultPromise).rejects.toBeInstanceOf(Error);
        });
    });

    describe('get by id', () => {
        it('happy path', async () => {
            const id = UUID();
            const email = "email@example.com";
            const availableCredit = 0;

            const entityId = new EntityId(id);

            mockCache.get.mockImplementationOnce( async () => null)

            mockRepository.findById.mockImplementationOnce(async () => {
                return new Customer(entityId, new Email(email));
            });

            const expectedCustomerDTO = new CustomerDTO(id, email, availableCredit);
            const customerDTOFound = await customerService.get(id);

            expect(customerDTOFound).toEqual(expectedCustomerDTO);
            expect(mockCache.get).toHaveBeenCalledTimes(1);
            expect(mockRepository.findById).toHaveBeenCalledWith(entityId);
        });

        it('happy path get cached customer', async () => {
            const id = UUID();
            const email = "email@example.com";
            const availableCredit = 0;
            const expectedCustomerDTO = new CustomerDTO(id, email, availableCredit);

            mockCache.get.mockImplementationOnce( async () => {
                return expectedCustomerDTO
            });

            const customerDTOFound = await customerService.get(id);

            expect(customerDTOFound).toEqual(expectedCustomerDTO);
            expect(mockCache.get).toHaveBeenCalledTimes(1);
            expect(mockRepository.findById).toHaveBeenCalledTimes(0);
        });

        it('throw EntityNotFoundError', async () => {
            const id = UUID();

            mockRepository.findById.mockImplementationOnce(async () => {
                return null;
            });

            const resultPromise = customerService.get(id);

            await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
            await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
        });
    });

    describe('list', () => {
        it('all', async () => {
            const userAId = UUID();
            const userAEntityId = new EntityId(userAId);
            const userAEmail = "userAEmail@example.com";
            const userBId = UUID();
            const userBEntityId = new EntityId(userBId);
            const userBEmail = "userBemail@example.com";
            const availableCredit = 0;

            const customers: Customer[] = [
                new Customer(userAEntityId, new Email(userAEmail)),
                new Customer(userBEntityId, new Email(userBEmail))
            ];

            mockCache.get.mockImplementationOnce( async () => null)

            mockRepository.findAll.mockImplementationOnce(async () => {
                return customers;
            });

            const expectedCustomerDTOs: CustomerDTO[] = [
                new CustomerDTO(userAId, userAEmail, availableCredit),
                new CustomerDTO(userBId, userBEmail, availableCredit)
            ];

            const customerDTOsFound = await customerService.getAll();
            expect(mockCache.getAll).toHaveBeenCalledTimes(1);
            expect(customerDTOsFound).toEqual(expectedCustomerDTOs);
        });

        it('all cached', async () => {
            const userAId = UUID();
            const userAEmail = "userAEmail@example.com";
            const userBId = UUID();
            const userBEmail = "userBemail@example.com";
            const availableCredit = 0;

            const expectedCustomerDTOs: CustomerDTO[] = [
                new CustomerDTO(userAId, userAEmail, availableCredit),
                new CustomerDTO(userBId, userBEmail, availableCredit)
            ];

            mockCache.getAll.mockImplementationOnce( async () => {
                return  expectedCustomerDTOs
            })

            const customerDTOsFound = await customerService.getAll();

            expect(customerDTOsFound).toEqual(expectedCustomerDTOs);
            expect(mockCache.getAll).toHaveBeenCalledTimes(1);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(0);
        });
    });

    describe('delete by id', () => {
        it('happy path', async () => {
            const id = UUID();
            const email = "email@example.com";
            const entityId = new EntityId(id);

            const customer = new Customer(entityId, new Email(email));

            mockRepository.findById.mockImplementationOnce(async () => {
                return customer;
            });
            mockRepository.delete.mockImplementationOnce(async () => {
                return;
            });

            await customerService.delete(id);
            expect(mockRepository.delete).toHaveBeenCalledWith(customer);
        });

        it('throw EntityNotFoundError', async () => {
            const id = UUID();

            mockRepository.findById.mockImplementationOnce(async () => {
                return null;
            });

            const resultPromise = customerService.delete(id);

            await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
            await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
        });
    });

    describe('addCredit', () => {
        it('happy path', async () => {
            const id = UUID();
            const email = "email@example.com";
            const entityId = new EntityId(id);
            const creditValue = 10.2

            let customerWithAddedCredit = Reflect.construct(Customer, [
                new EntityId(id),
                new Email(email),
            ]);
            (customerWithAddedCredit as any)._availableCredit = new Credit(creditValue);

            mockRepository.findById.mockImplementationOnce(async () => {
                return new Customer(entityId, new Email(email));
            });

            mockRepository.save.mockImplementationOnce(async () => {
                return;
            });

            await customerService.addCredit(id, creditValue);

            expect(mockRepository.save).toHaveBeenCalledWith(customerWithAddedCredit);
        });

        it('throw EntityNotFoundError', async () => {
            const id = UUID();
            const creditValue = 50;

            mockRepository.findById.mockImplementationOnce(async () => {
                return null;
            });

            const resultPromise = customerService.addCredit(id, creditValue);

            await expect(resultPromise).rejects.toThrow("Entity not found with id " + id);
            await expect(resultPromise).rejects.toBeInstanceOf(EntityNotFoundError);
        });

        it('throw DomainConflictError when try to add negative credit', async () => {
            const id = UUID();
            const entityId = new EntityId(id);
            const email = "email@example.com";
            const creditValue = -10;

            mockRepository.findById.mockImplementationOnce(async () => {
                return new Customer(entityId, new Email(email));
            });

            const resultPromise = customerService.addCredit(id, creditValue);

            await expect(resultPromise).rejects.toThrow("Credit cannot be negative");
            await expect(resultPromise).rejects.toBeInstanceOf(DomainConflictError);
        });
    });
});