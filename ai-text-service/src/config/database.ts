import { Sequelize, Dialect } from "sequelize";
import { CONFIG } from "./index";

const env = CONFIG.NODE_ENV || "development";
const dbConfig = CONFIG.DATABASE[env as keyof typeof CONFIG.DATABASE];

const sequelize = new Sequelize({
    ...dbConfig,
    dialect: dbConfig.dialect as Dialect,
});

export default sequelize;
