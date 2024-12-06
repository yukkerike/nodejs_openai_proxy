import { Request, Response } from "express";
import { authService } from "../../services/auth.service";
import { catchAsync } from "../middlewares/error.middleware";

export const authController = {
    register: catchAsync(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const authResponse = await authService.register(email, password);
        res.status(201).json({
            status: "success",
            data: {
                user: {
                    id: authResponse.user.id,
                    email: authResponse.user.email,
                    role: authResponse.user.role,
                    credits: authResponse.user.credits,
                },
                tokens: {
                    accessToken: authResponse.accessToken,
                    refreshToken: authResponse.refreshToken,
                },
            },
        });
    }),

    login: catchAsync(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const authResponse = await authService.login(email, password);
        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: authResponse.user.id,
                    email: authResponse.user.email,
                    role: authResponse.user.role,
                    credits: authResponse.user.credits,
                },
                tokens: {
                    accessToken: authResponse.accessToken,
                    refreshToken: authResponse.refreshToken,
                },
            },
        });
    }),

    refreshToken: catchAsync(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({
                status: "error",
                message: "Refresh token не предоставлен",
            });
        const authResponse = await authService.refreshToken(refreshToken);
        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: authResponse.user.id,
                    email: authResponse.user.email,
                    role: authResponse.user.role,
                    credits: authResponse.user.credits,
                },
                tokens: {
                    accessToken: authResponse.accessToken,
                    refreshToken: authResponse.refreshToken,
                },
            },
        });
    }),

    getProfile: catchAsync(async (req: Request, res: Response) => {
        if (!req.user)
            return res.status(401).json({
                status: "error",
                message: "Не авторизован",
            });
        const user = await authService.getUserProfile(req.user.userId);
        res.status(200).json({
            status: "success",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                },
            },
        });
    }),
};
