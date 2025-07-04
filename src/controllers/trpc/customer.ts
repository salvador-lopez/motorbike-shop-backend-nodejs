import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CustomerService, CustomerDTO } from '../../services/customer';
import { EntityNotFoundError, DomainConflictError } from '../../domain/errors';

const t = initTRPC.create();

export const customerRouter = (customerService: CustomerService) =>
    t.router({
        get: t.procedure
            .input(z.string())
            .output(
                z.object({
                    id: z.string(),
                    email: z.string().email(),
                    available_credit: z.number(),
                })
            )
            .query(async ({ input }) => {
                try {
                    const customer: CustomerDTO = await customerService.get(input);
                    return {
                        id: customer.id,
                        email: customer.email,
                        available_credit: customer.availableCredit,
                    };
                } catch (error) {
                    if (error instanceof EntityNotFoundError || error instanceof DomainConflictError) {
                        throw new Error(error.message);
                    }
                    throw new Error("Internal Server Error");
                }
            }),
    });

export type CustomerRouter = ReturnType<typeof customerRouter>;
