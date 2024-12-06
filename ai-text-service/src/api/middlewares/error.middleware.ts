import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ValidationError } from "joi";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorMiddleware: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error("Error:", {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });
    if (err instanceof ValidationError) {
        res.status(400).json({
            status: "error",
            message: "Ошибка валидации",
            errors: err.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            })),
        });
        return;
    }
    if (err instanceof JsonWebTokenError) {
        res.status(401).json({
            status: "error",
            message: "Недействительный токен",
        });
        return;
    }
    if (err instanceof TokenExpiredError) {
        res.status(401).json({
            status: "error",
            message: "Срок действия токена истек",
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }
    if (err.name === "SequelizeValidationError") {
        res.status(400).json({
            status: "error",
            message: "Ошибка валидации базы данных",
            errors: (err as any).errors.map((e: any) => ({
                field: e.path,
                message: e.message,
            })),
        });
        return;
    }
    if (err.message === "Invalid credentials") {
        res.status(401).json({
            status: "error",
            message: "Недействительный пароль или email",
        });
        return;
    }
    res.status(500).json({
        status: "error",
        message: "Внутренняя ошибка сервера",
    });
    return;
};

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
