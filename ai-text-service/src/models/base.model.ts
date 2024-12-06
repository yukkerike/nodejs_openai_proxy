export interface AIModelConfig {
    modelName: string;
    maxTokens: number;
    temperature: number;
}

export interface CompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export abstract class AIModel {
    constructor(protected config: AIModelConfig) {}
    abstract generate(prompt: string): AsyncGenerator<string, CompletionUsage>;
    abstract estimateTokens(prompt: string): number;
}
