import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Ingredient } from '../modules/ingredient/entity/ingredient.entity.js';
import { Dish } from '../modules/dish/entity/dish.entity.js';
import { Recipe } from '../modules/recipe/entity/recipe.entity.js';
import { RecipeItem } from '../modules/recipe/entity/recipe-item.entity.js';
import { User, UserRole } from '../modules/user/entity/user.entity.js';

export async function seed(dataSource: DataSource): Promise<void> {
  const ingredientRepo = dataSource.getRepository(Ingredient);
  const dishRepo = dataSource.getRepository(Dish);
  const recipeRepo = dataSource.getRepository(Recipe);
  const recipeItemRepo = dataSource.getRepository(RecipeItem);
  const userRepo = dataSource.getRepository(User);

  // Seed admin user if not exists
  const existingAdmin = await userRepo.findOneBy({ email: 'admin@cooking.com' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await userRepo.save(
      userRepo.create({
        fullName: 'Admin',
        email: 'admin@cooking.com',
        password: hashedPassword,
        phone: '0123456789',
        role: UserRole.ADMIN,
      }),
    );
    console.log('Admin user created: admin@cooking.com / admin123');
  }

  // Check if data already exists
  const existingIngredients = await ingredientRepo.count();
  if (existingIngredients > 0) {
    console.log('Seed data already exists, skipping...');
    return;
  }

  console.log('Seeding database...');

  // === Ingredients ===
  const rice = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Gạo', unit: 'kg', stock: 50 }),
  );
  const chicken = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Thịt gà', unit: 'kg', stock: 20 }),
  );
  const pork = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Thịt heo', unit: 'kg', stock: 15 }),
  );
  const egg = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Trứng gà', unit: 'quả', stock: 100 }),
  );
  const noodle = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Mì', unit: 'kg', stock: 30 }),
  );
  const vegetable = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Rau xanh', unit: 'kg', stock: 10 }),
  );
  const fishSauce = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Nước mắm', unit: 'lít', stock: 5 }),
  );
  const oil = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Dầu ăn', unit: 'lít', stock: 10 }),
  );

  // === Dishes ===
  const comGa = await dishRepo.save(
    dishRepo.create({ name: 'Cơm gà', description: 'Cơm gà Hải Nam', price: 45000, isAvailable: true }),
  );
  const miXao = await dishRepo.save(
    dishRepo.create({ name: 'Mì xào', description: 'Mì xào thập cẩm', price: 40000, isAvailable: true }),
  );
  const comChien = await dishRepo.save(
    dishRepo.create({ name: 'Cơm chiên', description: 'Cơm chiên trứng', price: 35000, isAvailable: true }),
  );

  // === Recipes ===
  // Cơm gà recipe
  const recipeComGa = await recipeRepo.save(
    recipeRepo.create({ dishId: comGa.id, version: 1, isActive: true }),
  );
  await recipeItemRepo.save([
    recipeItemRepo.create({ recipeId: recipeComGa.id, ingredientId: rice.id, quantity: 0.3, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeComGa.id, ingredientId: chicken.id, quantity: 0.2, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeComGa.id, ingredientId: fishSauce.id, quantity: 0.02, unit: 'lít' }),
    recipeItemRepo.create({ recipeId: recipeComGa.id, ingredientId: oil.id, quantity: 0.03, unit: 'lít' }),
  ]);

  // Mì xào recipe
  const recipeMiXao = await recipeRepo.save(
    recipeRepo.create({ dishId: miXao.id, version: 1, isActive: true }),
  );
  await recipeItemRepo.save([
    recipeItemRepo.create({ recipeId: recipeMiXao.id, ingredientId: noodle.id, quantity: 0.25, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeMiXao.id, ingredientId: pork.id, quantity: 0.15, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeMiXao.id, ingredientId: vegetable.id, quantity: 0.1, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeMiXao.id, ingredientId: egg.id, quantity: 1, unit: 'quả' }),
    recipeItemRepo.create({ recipeId: recipeMiXao.id, ingredientId: oil.id, quantity: 0.05, unit: 'lít' }),
  ]);

  // Cơm chiên recipe
  const recipeComChien = await recipeRepo.save(
    recipeRepo.create({ dishId: comChien.id, version: 1, isActive: true }),
  );
  await recipeItemRepo.save([
    recipeItemRepo.create({ recipeId: recipeComChien.id, ingredientId: rice.id, quantity: 0.3, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeComChien.id, ingredientId: egg.id, quantity: 2, unit: 'quả' }),
    recipeItemRepo.create({ recipeId: recipeComChien.id, ingredientId: oil.id, quantity: 0.05, unit: 'lít' }),
    recipeItemRepo.create({ recipeId: recipeComChien.id, ingredientId: fishSauce.id, quantity: 0.01, unit: 'lít' }),
  ]);

  console.log('Seed completed!');
}
