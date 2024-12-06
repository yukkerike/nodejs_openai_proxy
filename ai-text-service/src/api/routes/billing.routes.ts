import { Router } from "express";
import { billingController } from "../controllers/billing.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validators } from "../validators";

const router = Router();

/**
 * @swagger
 * /api/billing/balance:
 *   get:
 *     tags: [Billing]
 *     summary: Получить текущий баланс пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешное получение баланса
 *       401:
 *         description: Не авторизован
 */
router.get(
    "/balance",
    authMiddleware.verifyToken,
    billingController.getBalance
);

/**
 * @swagger
 * /api/billing/balance/update:
 *   post:
 *     tags: [Billing]
 *     summary: Обновить баланс пользователя (только для админов)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *               - description
 *             properties:
 *               userId:
 *                 type: number
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Баланс успешно обновлен
 *       403:
 *         description: Недостаточно прав
 */
router.post(
    "/balance/update",
    [
        authMiddleware.verifyToken,
        authMiddleware.isAdmin,
        validators.billing.updateBalance,
    ],
    billingController.updateBalance
);

/**
 * @swagger
 * /api/billing/transactions:
 *   get:
 *     tags: [Billing]
 *     summary: Получить историю транзакций
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список транзакций
 */
router.get(
    "/transactions",
    authMiddleware.verifyToken,
    billingController.getTransactions
);

/**
 * @swagger
 * /api/billing/estimate:
 *   post:
 *     tags: [Billing]
 *     summary: Оценить стоимость генерации
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelName
 *               - tokensCount
 *             properties:
 *               modelName:
 *                 type: string
 *               tokensCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Успешная оценка стоимости
 *       400:
 *         description: Ошибка валидации
 */
router.post(
    "/estimate",
    [authMiddleware.verifyToken, validators.billing.estimateCost],
    billingController.estimateGenerationCost
);

export default router;
