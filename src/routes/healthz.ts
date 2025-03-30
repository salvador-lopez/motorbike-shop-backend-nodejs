import {Request, Response, Router} from "express";

const router = Router();

/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Healthz endpoint
 *     responses:
 *       200:
 *         description: Return ok determining that the api is alive. Useful for Liveness probes
 */
router.get('/healthz', (req: Request, res: Response) => {
    res.send('ok');
});

export default router;
