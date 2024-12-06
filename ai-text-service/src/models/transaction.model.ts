import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

export enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit",
}

export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
}

interface TransactionAttributes {
    id: number;
    userId: number;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    description: string;
    modelName?: string;
    tokensUsed?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TransactionCreationAttributes
    extends Omit<TransactionAttributes, "id"> {}

export class Transaction extends Model<
    TransactionAttributes,
    TransactionCreationAttributes
> {
    declare id: number;
    declare userId: number;
    declare type: TransactionType;
    declare amount: number;
    declare balanceBefore: number;
    declare balanceAfter: number;
    declare status: TransactionStatus;
    declare description: string;
    declare modelName?: string;
    declare tokensUsed?: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Transaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
        type: {
            type: DataTypes.ENUM(...Object.values(TransactionType)),
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
            },
        },
        balanceBefore: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        balanceAfter: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(TransactionStatus)),
            allowNull: false,
            defaultValue: TransactionStatus.PENDING,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modelName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tokensUsed: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                isInt: true,
            },
        },
    },
    {
        sequelize,
        tableName: "transactions",
        timestamps: true,
    }
);

Transaction.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Transaction, { foreignKey: "userId" });

export default Transaction;
