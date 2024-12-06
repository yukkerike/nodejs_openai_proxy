import OpenAI from "openai";
import { CONFIG } from "../config";
import { AIModel, AIModelConfig, CompletionUsage } from "./base.model";

interface StreamChunk {
    id: string;
    provider: string;
    model: string;
    object: string;
    created: number;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
        logprobs: any;
    }>;
    usage?: CompletionUsage;
}

export class OpenAIModel extends AIModel {
    private client: OpenAI;

    constructor(config: AIModelConfig) {
        super(config);
        this.client = new OpenAI({
            apiKey: CONFIG.OPENAI_API_KEY,
            baseURL: CONFIG.OPENAI_BASE_URL,
        });
    }

    async *generate(prompt: string): AsyncGenerator<string, CompletionUsage> {
        const stream = await this.client.chat.completions.create({
            model: this.config.modelName,
            messages: [{ role: "user", content: prompt }],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            stream: true,
        });
        let lastChunk: StreamChunk | undefined;
        for await (const chunk of stream) {
            lastChunk = chunk as unknown as StreamChunk;
            if (chunk.choices[0]?.delta?.content)
                yield chunk.choices[0].delta.content;
        }
        if (!lastChunk || !lastChunk.usage)
            throw new Error("Usage information not available");
        return lastChunk.usage;
    }

    estimateTokens(prompt: string): number {
        return Math.ceil(prompt.length / 4);
    }
}
