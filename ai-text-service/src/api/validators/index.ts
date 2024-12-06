import Joi from "joi";
import { Request, Response, NextFunction, RequestHandler } from "express";

const schemas = {
    auth: {
        register: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
        }),
        login: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }),
    },

    billing: {
        updateBalance: Joi.object({
            userId: Joi.number().required(),
            amount: Joi.number().required(),
            description: Joi.string().required(),
        }),
        checkBalance: Joi.object({
            userId: Joi.number().required(),
        }),
        estimateCost: Joi.object({
            modelName: Joi.string().required(),
            tokensCount: Joi.number().integer().min(1).required(),
        }),
    },

    models: {
        generate: Joi.object({
            modelName: Joi.string().required(),
            prompt: Joi.string().required().min(1).max(32768),
            temperature: Joi.number().min(0).max(1).default(0.7),
            maxTokens: Joi.number().integer().min(1).max(32768).default(2048),
        }),
    },
};

const validate = (schema: Joi.Schema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors,
            });
            return;
        }
        next();
    };
};

export const validators = {
    auth: {
        register: validate(schemas.auth.register),
        login: validate(schemas.auth.login),
    },
    billing: {
        updateBalance: validate(schemas.billing.updateBalance),
        checkBalance: validate(schemas.billing.checkBalance),
        estimateCost: validate(schemas.billing.estimateCost),
    },
    models: {
        generate: validate(schemas.models.generate),
    },
};

export const validateId = (id: any): boolean =>
    !isNaN(parseInt(id)) && parseInt(id) > 0;

export const validateEmail = (email: string): boolean =>
    schemas.auth.register.extract("email").validate(email).error === undefined;

export const validatePassword = (password: string): boolean =>
    schemas.auth.register.extract("password").validate(password).error ===
    undefined;
