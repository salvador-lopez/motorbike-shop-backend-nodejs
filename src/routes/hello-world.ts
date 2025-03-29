import {Request, Response, Router} from "express";

const router = Router();

/**
 * @openapi
 * /hello:
 *   get:
 *     summary: Example hello world endpoint
 *     responses:
 *       200:
 *         description: Return a Hello World and that´s it!
 */
router.get('/hello', (req: Request, res: Response) => {
    res.send('Hello World!');
});

module.exports = router;
