import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db";

export class MenuItem extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public price!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MenuItem",
    tableName: "menu_items",
  }
);

// Seed example items (optional)
export const seedMenuItems = async () => {
  const count = await MenuItem.count();
  if (count === 0) {
    await MenuItem.bulkCreate([
      { name: "Pizza", description: "Cheese Pizza", price: 250 },
      { name: "Burger", description: "Veg Burger", price: 120 },
      { name: "Pasta", description: "Tomato Pasta", price: 180 },
    ]);
    console.log("✅ Menu items seeded");
  }
};
