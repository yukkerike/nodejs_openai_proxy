import { Request, Response, NextFunction, RequestHandler } from "express";
import { authService } from "../../services/auth.service";
import { UserRole } from "../../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: UserRole;
            };
        }
    }
}

export const authMiddleware = {
    verifyToken: <RequestHandler>(async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer "))
                return res.status(401).json({
                    status: "error",
                    message: "Отсутствует токен авторизации",
                });
            const token = authHeader.split(" ")[1];
            const decoded = await authService.verifyToken(token);
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
            };
            next();
        } catch (error) {
            return res.status(401).json({
                status: "error",
                message: "Недействительный токен",
            });
        }
    }),

    isAdmin: <RequestHandler>(async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user)
                return res.status(401).json({
                    status: "error",
                    message: "Пользователь не авторизован",
                });
            if (req.user.role !== UserRole.ADMIN)
                return res.status(403).json({
                    status: "error",
                    message: "Недостаточно прав доступа",
                });
            next();
        } catch (error) {
            next(error);
        }
    }),

    checkBalance: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user)
                return res.status(401).json({
                    status: "error",
                    message: "Пользователь не авторизован",
                });
            next();
        } catch (error) {
            next(error);
        }
    },

    handleAuthError: (
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (error.name === "JsonWebTokenError")
            return res.status(401).json({
                status: "error",
                message: "Недействительный токен",
            });
        if (error.name === "TokenExpiredError")
            return res.status(401).json({
                status: "error",
                message: "Срок действия токена истек",
            });
        next(error);
    },
};
