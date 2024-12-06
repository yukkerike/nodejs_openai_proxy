import { billingService } from "./billing.service";
import { AIModel, AIModelConfig, CompletionUsage } from "../models/base.model";
import { OpenAIModel } from "../models/openai.model";

interface GenerationRequest {
    modelName: string;
    prompt: string;
    userId: number;
    temperature?: number;
    maxTokens?: number;
}

class TextService {
    private models: Map<string, AIModel>;
    private activeGenerations: Map<number, boolean>;
    private readonly modelConfigs: { [key: string]: AIModelConfig } = {
        "gpt-4": {
            modelName: "gpt-4",
            maxTokens: 2048,
            temperature: 0.7,
        },
        "gpt-4o": {
            modelName: "gpt-4o",
            maxTokens: 32000,
            temperature: 0.7,
        },
        "o1-preview": {
            modelName: "o1-preview",
            maxTokens: 32000,
            temperature: 0.7,
        },
        "o1-mini": {
            modelName: "o1-mini",
            maxTokens: 64000,
            temperature: 0.7,
        },
        "gemini-flash": {
            modelName: "gemini-flash",
            maxTokens: 1024,
            temperature: 0.5,
        },
    };

    constructor() {
        this.models = new Map();
        this.activeGenerations = new Map();
        this.initializeModels();
    }

    private initializeModels() {
        Object.entries(this.modelConfigs).forEach(([name, config]) => {
            this.models.set(name, new OpenAIModel(config));
        });
    }

    async *generateText(request: GenerationRequest): AsyncGenerator<string> {
        const model = this.models.get(request.modelName);
        if (!model) throw new Error(`Model ${request.modelName} not found`);
        const modelConfig = { ...this.modelConfigs[request.modelName] };
        if (request.temperature !== undefined)
            modelConfig.temperature = request.temperature;
        if (request.maxTokens !== undefined)
            modelConfig.maxTokens = request.maxTokens;
        this.models.set(request.modelName, new OpenAIModel(modelConfig));
        this.activeGenerations.set(request.userId, true);
        const estimatedTokens = model.estimateTokens(request.prompt);
        const isAvailable = await billingService.checkGenerationAvailability(
            request.userId,
            request.modelName,
            estimatedTokens
        );
        if (!isAvailable) throw new Error("Insufficient credits");
        try {
            const generator = model.generate(request.prompt);
            let result = generator.next();
            while (!(await result).done) {
                if (!this.activeGenerations.get(request.userId))
                    throw new Error("Generation aborted");
                yield (await result).value as string;
                result = generator.next();
            }

            const usage = (await result).value as CompletionUsage;
            await billingService.processGenerationPayment(
                request.userId,
                request.modelName,
                usage.total_tokens
            );
        } catch (error) {
            let message = (error as Error)?.message || "Generation failed";
            throw new Error(message);
        } finally {
            this.activeGenerations.delete(request.userId);
        }
    }

    async abortGeneration(userId: number): Promise<void> {
        this.activeGenerations.set(userId, false);
    }

    getAvailableModels(): string[] {
        return Array.from(this.models.keys());
    }
}

export const textService = new TextService();
