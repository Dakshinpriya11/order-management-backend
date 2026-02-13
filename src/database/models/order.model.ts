import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";
import { OrderItem } from "./orderItem.model";

export enum OrderStatus {
  CREATED = "CREATED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
}

interface OrderAttributes {
  id: string;
  user_id: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  idempotency_key?: string;
  status_updated_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class Order extends Model<OrderAttributes, Optional<OrderAttributes, "id">> implements OrderAttributes {
  declare id: string;
  declare user_id: string;
  declare total_amount: number;
  declare order_status: OrderStatus;
  declare payment_status: PaymentStatus;
  declare payment_method: PaymentMethod;
  declare idempotency_key: string;
  declare status_updated_at: Date;
  declare created_at: Date;
  declare updated_at: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    order_status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.CREATED,
    },
    payment_status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    },
    payment_method: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    idempotency_key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    status_updated_at: DataTypes.DATE,
  },
  {
     sequelize,
    tableName: "orders",
    timestamps: true, 
    underscored: true, 
    indexes: [
      { fields: ["user_id"] },
      { fields: ["order_status"] },
      { fields: ["created_at"] }, 
    ],
  }
);

// Associate Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
