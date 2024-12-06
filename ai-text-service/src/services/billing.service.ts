import { User, UserRole } from "../models/user.model";
import {
    Transaction,
    TransactionType,
    TransactionStatus,
} from "../models/transaction.model";

interface ModelPricing {
    [key: string]: {
        creditsPerToken: number;
    };
}

class BillingService {
    private readonly modelPricing: ModelPricing = {
        "gpt-4": {
            creditsPerToken: 0.2,
        },
        "gpt-4o": {
            creditsPerToken: 0.3,
        },
        "o1-preview": {
            creditsPerToken: 0.7,
        },
        "o1-mini": {
            creditsPerToken: 0.5,
        },
        "gemini-flash": {
            creditsPerToken: 0.1,
        },
    };

    async getUserBalance(userId: number): Promise<number> {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        return user.credits;
    }

    async updateBalance(
        userId: number,
        amount: number,
        adminId: number,
        description: string
    ): Promise<number> {
        const admin = await User.findByPk(adminId);
        if (!admin || admin.role !== UserRole.ADMIN)
            throw new Error("Unauthorized: Only admins can update balance");
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        const balanceBefore = user.credits;
        const balanceAfter = balanceBefore + amount;

        await Transaction.create({
            userId,
            type: amount > 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
            amount: Math.abs(amount),
            balanceBefore,
            balanceAfter,
            status: TransactionStatus.COMPLETED,
            description,
        });
        user.credits = balanceAfter;
        await user.save();
        return balanceAfter;
    }

    async calculateGenerationCost(
        modelName: string,
        tokensCount: number
    ): Promise<number> {
        const pricing = this.modelPricing[modelName];
        if (!pricing) throw new Error(`Unknown model: ${modelName}`);
        return Math.ceil(tokensCount * pricing.creditsPerToken);
    }

    async processGenerationPayment(
        userId: number,
        modelName: string,
        tokensUsed: number
    ): Promise<void> {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        const cost = await this.calculateGenerationCost(modelName, tokensUsed);
        const balanceBefore = user.credits;
        const balanceAfter = balanceBefore - cost;

        await Transaction.create({
            userId,
            type: TransactionType.DEBIT,
            amount: cost,
            balanceBefore,
            balanceAfter,
            status: TransactionStatus.COMPLETED,
            description: `Generation using ${modelName}`,
            modelName,
            tokensUsed,
        });
        user.credits = balanceAfter;
        await user.save();
    }

    async checkGenerationAvailability(
        userId: number,
        modelName: string,
        estimatedTokens: number
    ): Promise<boolean> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const estimatedCost = await this.calculateGenerationCost(
            modelName,
            estimatedTokens
        );
        return user.credits >= estimatedCost;
    }

    async getUserTransactions(userId: number, page: number, limit: number) {
        const offset = (page - 1) * limit;
        const transactions = await Transaction.findAndCountAll({
            where: { userId },
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        return transactions;
    }

    getModelPricing(modelName: string) {
        const pricing = this.modelPricing[modelName];
        if (!pricing) throw new Error(`Unknown model: ${modelName}`);
        return pricing;
    }
}

export const billingService = new BillingService();
