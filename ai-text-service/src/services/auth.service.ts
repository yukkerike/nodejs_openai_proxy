import jwt from "jsonwebtoken";
import { User, UserRole } from "../models/user.model";
import { CONFIG } from "../config";

interface TokenPayload {
    userId: number;
    role: UserRole;
}

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        role: UserRole;
        credits: number;
    };
}

class AuthService {
    private readonly ACCESS_TOKEN_EXPIRES = "1h";
    private readonly REFRESH_TOKEN_EXPIRES = "7d";

    async register(email: string, password: string): Promise<AuthResponse> {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) throw new Error("User already exists");
        const user = await User.create({
            email,
            password,
            role: UserRole.USER,
            credits: CONFIG.INITIAL_CREDITS || 0,
        });
        return this.generateAuthResponse(user);
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Invalid credentials");
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) throw new Error("Invalid credentials");
        return this.generateAuthResponse(user);
    }

    async verifyToken(token: string): Promise<TokenPayload> {
        try {
            const decoded = jwt.verify(
                token,
                CONFIG.JWT_SECRET
            ) as TokenPayload;
            const user = await User.findByPk(decoded.userId);
            if (!user) throw new Error("User not found");
            return decoded;
        } catch (error) {
            throw new Error("Invalid token");
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const decoded = jwt.verify(
                refreshToken,
                CONFIG.JWT_REFRESH_SECRET
            ) as TokenPayload;
            const user = await User.findByPk(decoded.userId);
            if (!user) throw new Error("User not found");
            return this.generateAuthResponse(user);
        } catch (error) {
            throw new Error("Invalid refresh token");
        }
    }

    async getUserProfile(userId: number): Promise<User> {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        return user;
    }

    private generateAuthResponse(user: User): AuthResponse {
        const payload: TokenPayload = {
            userId: user.id,
            role: user.role,
        };
        const accessToken = jwt.sign(payload, CONFIG.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
        });
        const refreshToken = jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                credits: user.credits,
            },
        };
    }
}

export const authService = new AuthService();
