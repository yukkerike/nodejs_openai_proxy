import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    dialect: string;
    logging?: boolean | ((sql: string) => void);
}

interface Config {
    PORT: number;
    NODE_ENV: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    DATABASE: {
        development: DatabaseConfig;
        test: DatabaseConfig;
        production: DatabaseConfig;
    };
    OPENAI_API_KEY: string | undefined;
    OPENAI_BASE_URL: string;
    INITIAL_CREDITS: number;
    MIN_BALANCE: number;
}

export const CONFIG: Config = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || "development",

    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

    DATABASE: {
        development: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
            database: process.env.DB_NAME || "ai_text_service",
            dialect: "postgres",
            logging: true,
        },
        test: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
            database: process.env.DB_NAME || "ai_text_service_test",
            dialect: "postgres",
            logging: false,
        },
        production: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
            database: process.env.DB_NAME || "ai_text_service",
            dialect: "postgres",
            logging: false,
        },
    },

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL:
        process.env.OPENAI_BASE_URL || "https://bothub.chat/api/v2/openai/v1",

    INITIAL_CREDITS: Number(process.env.INITIAL_CREDITS) || 100,
    MIN_BALANCE: Number(process.env.MIN_BALANCE) || -1000,
};

module.exports = { CONFIG };
