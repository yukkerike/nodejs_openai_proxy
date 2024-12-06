import { Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../config/database";

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

interface UserAttributes {
    id: number;
    email: string;
    password: string;
    credits: number;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    declare id: number;
    declare email: string;
    declare password: string;
    declare credits: number;
    declare role: UserRole;
    declare createdAt: Date;
    declare updatedAt: Date;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    async updateCredits(amount: number): Promise<void> {
        this.credits += amount;
        await this.save();
    }

    hasEnoughCredits(required: number): boolean {
        return this.credits >= required;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        credits: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isInt: true,
            },
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.USER,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: true,
    }
);

User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

export default User;
