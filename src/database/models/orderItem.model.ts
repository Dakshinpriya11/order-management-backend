import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/db";

interface OrderItemAttributes {
  id: string;
  order_id: string;
  menu_item_id: string;
  price: number;
  quantity: number;
}

export class OrderItem extends Model<OrderItemAttributes, Optional<OrderItemAttributes, "id">> implements OrderItemAttributes {
  declare id: string;
  declare order_id: string;
  declare menu_item_id: string;
  declare price: number;
  declare quantity: number;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: true, 
    underscored: true,
  }
);
