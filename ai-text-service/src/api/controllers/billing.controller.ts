import { Request, Response } from "express";
import { billingService } from "../../services/billing.service";
import { catchAsync } from "../middlewares/error.middleware";
import { AppError } from "../middlewares/error.middleware";

export const billingController = {
    getBalance: catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        const balance = await billingService.getUserBalance(req.user.userId);
        res.status(200).json({
            status: "success",
            data: {
                credits: balance,
            },
        });
    }),

    updateBalance: catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        const { userId, amount, description } = req.body;
        const newBalance = await billingService.updateBalance(
            userId,
            amount,
            req.user.userId, // adminId
            description
        );
        res.status(200).json({
            status: "success",
            data: {
                userId,
                newBalance,
                operation: amount > 0 ? "credit" : "debit",
                amount: Math.abs(amount),
            },
        });
    }),

    getTransactions: catchAsync(async (req: Request, res: Response) => {
        if (!req.user) throw new AppError(401, "Не авторизован");
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const transactions = await billingService.getUserTransactions(
            req.user.userId,
            page,
            limit
        );
        res.status(200).json({
            status: "success",
            data: {
                transactions: transactions.rows,
                pagination: {
                    total: transactions.count,
                    page,
                    limit,
                    pages: Math.ceil(transactions.count / limit),
                },
            },
        });
    }),

    estimateGenerationCost: catchAsync(async (req: Request, res: Response) => {
        const { modelName, tokensCount } = req.body;
        const cost = await billingService.calculateGenerationCost(
            modelName,
            tokensCount
        );
        res.status(200).json({
            status: "success",
            data: {
                modelName,
                tokensCount,
                estimatedCost: cost,
            },
        });
    }),
};
