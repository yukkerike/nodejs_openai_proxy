import { Router } from "express";
import { textController } from "../controllers/text.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validators } from "../validators";

const router = Router();

/**
 * @swagger
 * /api/text/generate:
 *   post:
 *     tags: [Text Generation]
 *     summary: Генерация текста с использованием AI модели
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
 *               - prompt
 *             properties:
 *               modelName:
 *                 type: string
 *               prompt:
 *                 type: string
 *               temperature:
 *                 type: number
 *               maxTokens:
 *                 type: number
 *     responses:
 *       200:
 *         description: Server-Sent Events поток с генерируемым текстом
 */
router.post(
    "/generate",
    [authMiddleware.verifyToken, validators.models.generate],
    textController.generate
);

/**
 * @swagger
 * /api/text/models:
 *   get:
 *     tags: [Text Generation]
 *     summary: Получить список доступных моделей
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список моделей с их ценами
 */
router.get("/models", authMiddleware.verifyToken, textController.getModels);

/**
 * @swagger
 * /api/text/abort:
 *   post:
 *     tags: [Text Generation]
 *     summary: Прервать текущую генерацию
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Генерация успешно прервана
 */
router.post(
    "/abort",
    authMiddleware.verifyToken,
    textController.abortGeneration
);

export default router;
