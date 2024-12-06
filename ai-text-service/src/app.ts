import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { errorMiddleware } from "./api/middlewares/error.middleware";
import authRoutes from "./api/routes/auth.routes";
import billingRoutes from "./api/routes/billing.routes";
import textRoutes from "./api/routes/text.routes";
import { CONFIG } from "./config";

const app = express();

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AI Text Generation API",
            version: "1.0.0",
            description:
                "API для генерации текста с использованием различных AI моделей",
        },
        servers: [
            {
                url: `http://localhost:${CONFIG.PORT}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/api/routes/*.ts", "./dist/api/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/text", textRoutes);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
app.use(errorMiddleware);
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

if (require.main === module)
    app.listen(CONFIG.PORT, () => {
        console.log(`Server running on port ${CONFIG.PORT}`);
        console.log(
            `Swagger documentation available at http://localhost:${CONFIG.PORT}/api-docs`
        );
    });

export default app;
