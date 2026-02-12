import { sequelize } from "../config/db";
import { MenuItem } from "../database/models/menuItem.model";

const seedMenu = async () => {
  try {
    // Connect to DB
    await sequelize.sync();

    // Check if menu already seeded
    const count = await MenuItem.count();
    if (count > 0) {
      console.log("Menu already seeded");
      process.exit(0);
    }

    // Seed menu items
    await MenuItem.bulkCreate([
      { name: "Pizza", description: "Cheese Pizza", price: 250 },
      { name: "Burger", description: "Veg Burger", price: 120 },
      { name: "Pasta", description: "Tomato Pasta", price: 180 },
      { name: "Fries", description: "French Fries", price: 80 },
      { name: "Coke", description: "Cold drink", price: 50 },
    ]);

    console.log("✅ Menu seeded successfully");
    process.exit(0);
  } catch (error: any) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedMenu();
