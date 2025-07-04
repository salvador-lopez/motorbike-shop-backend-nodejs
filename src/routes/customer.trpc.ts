import { Router, Request, Response, NextFunction } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { customerRouter } from "../controllers/trpc/customer";

const router = Router();

router.use("/customer", (req: Request, res: Response, next: NextFunction) => {
    const customerService = req.container.resolve("customerService");

    return createExpressMiddleware({
        router: customerRouter(customerService),
        createContext: () => ({}),
    })(req, res, next);
});

export default router;