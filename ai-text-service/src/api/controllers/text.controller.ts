import { Request, Response } from "express";
import { textService } from "../../services/text.service";
import { billingService } from "../../services/billing.service";
import { catchAsync } from "../middlewares/error.middleware";
import { AppError } from "../middlewares/error.middleware";

export const textController = {
    generate: async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        const { modelName, prompt, temperature, maxTokens } = req.body;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        req.on("close", () => {
            textService.abortGeneration(req.user!.userId);
        });
        try {
            const textGenerator = textService.generateText({
                userId: req.user.userId,
                modelName,
                prompt,
                temperature,
                maxTokens,
            });
            let totalText = "";
            for await (const chunk of textGenerator) {
                totalText += chunk;
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }
            res.write(
                `data: ${JSON.stringify({
                    text: "",
                    done: true,
                    totalText,
                })}\n\n`
            );
            res.write("data: [DONE]\n\n");
        } catch (error) {
            let message = (error as Error)?.message || "Generation failed";
            res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        } finally {
            res.end();
        }
    },

    getModels: catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        const models = textService.getAvailableModels();
        res.status(200).json({
            status: "success",
            data: {
                models: models.map((model) => ({
                    name: model,
                    pricing: billingService.getModelPricing(model),
                })),
            },
        });
    }),

    abortGeneration: catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        await textService.abortGeneration(req.user.userId);
        res.status(200).json({
            status: "success",
            message: "Генерация прервана",
        });
    }),
};
