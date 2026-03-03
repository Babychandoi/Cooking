import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Ingredient } from '../modules/ingredient/entity/ingredient.entity.js';
import { Dish } from '../modules/dish/entity/dish.entity.js';
import { Recipe } from '../modules/recipe/entity/recipe.entity.js';
import { RecipeItem } from '../modules/recipe/entity/recipe-item.entity.js';
import { User, UserRole } from '../modules/user/entity/user.entity.js';
import { RestaurantChain } from '../modules/restaurant-chain/entity/restaurant-chain.entity.js';
import { Branch } from '../modules/branch/entity/branch.entity.js';
import { Table } from '../modules/table/entity/table.entity.js';
import { BranchDish } from '../modules/branch-dish/entity/branch-dish.entity.js';
import { BranchIngredient } from '../modules/branch-ingredient/entity/branch-ingredient.entity.js';

export async function seed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const chainRepo = dataSource.getRepository(RestaurantChain);
  const branchRepo = dataSource.getRepository(Branch);
  const tableRepo = dataSource.getRepository(Table);
  const ingredientRepo = dataSource.getRepository(Ingredient);
  const dishRepo = dataSource.getRepository(Dish);
  const branchDishRepo = dataSource.getRepository(BranchDish);
  const branchIngredientRepo = dataSource.getRepository(BranchIngredient);
  const recipeRepo = dataSource.getRepository(Recipe);
  const recipeItemRepo = dataSource.getRepository(RecipeItem);

  // === 1. Seed Admin User ===
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
    console.log('✅ Admin user created: admin@cooking.com / admin123');
  }

  // Check if data already exists
  const existingChains = await chainRepo.count();
  if (existingChains > 0) {
    console.log('⚠️  Seed data already exists, skipping...');
    return;
  }

  console.log('🌱 Seeding database...');

  // === 2. Restaurant Chain ===
  const chain = await chainRepo.save(
    chainRepo.create({
      name: 'Nhà hàng Phố Cổ',
      status: 'active',
    }),
  );
  console.log('✅ Created restaurant chain:', chain.name);

  // === 3. Branches ===
  const branch1 = await branchRepo.save(
    branchRepo.create({
      chainId: chain.id,
      name: 'Chi nhánh Hoàn Kiếm',
      address: '123 Phố Huế, Hoàn Kiếm, Hà Nội',
      phone: '0241234567',
      status: 'active',
    }),
  );

  const branch2 = await branchRepo.save(
    branchRepo.create({
      chainId: chain.id,
      name: 'Chi nhánh Đống Đa',
      address: '456 Láng Hạ, Đống Đa, Hà Nội',
      phone: '0247654321',
      status: 'active',
    }),
  );
  console.log('✅ Created 2 branches');

  // === 4. Tables ===
  const tables1: Table[] = [];
  for (let i = 1; i <= 10; i++) {
    tables1.push(
      tableRepo.create({
        branchId: branch1.id,
        tableCode: `A${i}`,
        capacity: i <= 5 ? 4 : 6,
        status: 'available',
      }),
    );
  }
  await tableRepo.save(tables1);

  const tables2: Table[] = [];
  for (let i = 1; i <= 8; i++) {
    tables2.push(
      tableRepo.create({
        branchId: branch2.id,
        tableCode: `B${i}`,
        capacity: 4,
        status: 'available',
      }),
    );
  }
  await tableRepo.save(tables2);
  console.log('✅ Created 18 tables');

  // === 5. Ingredients (Master) ===
  const rice = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Gạo', unit: 'kg', status: 'active' }),
  );
  const chicken = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Thịt gà', unit: 'kg', status: 'active' }),
  );
  const pork = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Thịt heo', unit: 'kg', status: 'active' }),
  );
  const beef = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Thịt bò', unit: 'kg', status: 'active' }),
  );
  const egg = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Trứng gà', unit: 'quả', status: 'active' }),
  );
  const noodle = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Mì', unit: 'kg', status: 'active' }),
  );
  const vegetable = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Rau xanh', unit: 'kg', status: 'active' }),
  );
  const fishSauce = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Nước mắm', unit: 'lít', status: 'active' }),
  );
  const oil = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Dầu ăn', unit: 'lít', status: 'active' }),
  );
  const tomato = await ingredientRepo.save(
    ingredientRepo.create({ name: 'Cà chua', unit: 'kg', status: 'active' }),
  );
  console.log('✅ Created 10 ingredients');

  // === 6. Branch Ingredients (Stock per branch) ===
  // Branch 1 stock
  await branchIngredientRepo.save([
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: rice.id, stockQuantity: 50, costPrice: 20000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: chicken.id, stockQuantity: 20, costPrice: 80000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: pork.id, stockQuantity: 15, costPrice: 70000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: beef.id, stockQuantity: 10, costPrice: 150000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: egg.id, stockQuantity: 100, costPrice: 3000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: noodle.id, stockQuantity: 30, costPrice: 25000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: vegetable.id, stockQuantity: 10, costPrice: 15000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: fishSauce.id, stockQuantity: 5, costPrice: 30000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: oil.id, stockQuantity: 10, costPrice: 40000 }),
    branchIngredientRepo.create({ branchId: branch1.id, ingredientId: tomato.id, stockQuantity: 8, costPrice: 20000 }),
  ]);

  // Branch 2 stock (different quantities)
  await branchIngredientRepo.save([
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: rice.id, stockQuantity: 40, costPrice: 20000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: chicken.id, stockQuantity: 15, costPrice: 80000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: pork.id, stockQuantity: 12, costPrice: 70000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: beef.id, stockQuantity: 8, costPrice: 150000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: egg.id, stockQuantity: 80, costPrice: 3000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: noodle.id, stockQuantity: 25, costPrice: 25000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: vegetable.id, stockQuantity: 8, costPrice: 15000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: fishSauce.id, stockQuantity: 4, costPrice: 30000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: oil.id, stockQuantity: 8, costPrice: 40000 }),
    branchIngredientRepo.create({ branchId: branch2.id, ingredientId: tomato.id, stockQuantity: 6, costPrice: 20000 }),
  ]);
  console.log('✅ Created branch ingredients stock');

  // === 7. Dishes (Master) ===
  const comGa = await dishRepo.save(
    dishRepo.create({
      name: 'Cơm gà',
      description: 'Cơm gà Hải Nam thơm ngon',
      imageUrl: null,
      isCombo: false,
      status: 'active',
    }),
  );

  const miXao = await dishRepo.save(
    dishRepo.create({
      name: 'Mì xào',
      description: 'Mì xào thập cẩm đầy đủ dinh dưỡng',
      imageUrl: null,
      isCombo: false,
      status: 'active',
    }),
  );

  const comChien = await dishRepo.save(
    dishRepo.create({
      name: 'Cơm chiên',
      description: 'Cơm chiên trứng đơn giản',
      imageUrl: null,
      isCombo: false,
      status: 'active',
    }),
  );

  const phoBO = await dishRepo.save(
    dishRepo.create({
      name: 'Phở bò',
      description: 'Phở bò Hà Nội truyền thống',
      imageUrl: null,
      isCombo: false,
      status: 'active',
    }),
  );

  const bunCha = await dishRepo.save(
    dishRepo.create({
      name: 'Bún chả',
      description: 'Bún chả Hà Nội đặc sản',
      imageUrl: null,
      isCombo: false,
      status: 'active',
    }),
  );
  console.log('✅ Created 5 dishes');

  // === 8. Branch Dishes (Price per branch) ===
  // Branch 1 prices
  await branchDishRepo.save([
    branchDishRepo.create({ branchId: branch1.id, dishId: comGa.id, price: 45000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch1.id, dishId: miXao.id, price: 40000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch1.id, dishId: comChien.id, price: 35000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch1.id, dishId: phoBO.id, price: 50000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch1.id, dishId: bunCha.id, price: 45000, isAvailable: true, status: 'active' }),
  ]);

  // Branch 2 prices (slightly different)
  await branchDishRepo.save([
    branchDishRepo.create({ branchId: branch2.id, dishId: comGa.id, price: 48000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch2.id, dishId: miXao.id, price: 42000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch2.id, dishId: comChien.id, price: 38000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch2.id, dishId: phoBO.id, price: 55000, isAvailable: true, status: 'active' }),
    branchDishRepo.create({ branchId: branch2.id, dishId: bunCha.id, price: 48000, isAvailable: false, status: 'active' }),
  ]);
  console.log('✅ Created branch dishes with prices');

  // === 9. Recipes ===
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

  // Phở bò recipe
  const recipePho = await recipeRepo.save(
    recipeRepo.create({ dishId: phoBO.id, version: 1, isActive: true }),
  );
  await recipeItemRepo.save([
    recipeItemRepo.create({ recipeId: recipePho.id, ingredientId: noodle.id, quantity: 0.3, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipePho.id, ingredientId: beef.id, quantity: 0.2, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipePho.id, ingredientId: vegetable.id, quantity: 0.05, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipePho.id, ingredientId: fishSauce.id, quantity: 0.02, unit: 'lít' }),
  ]);

  // Bún chả recipe
  const recipeBunCha = await recipeRepo.save(
    recipeRepo.create({ dishId: bunCha.id, version: 1, isActive: true }),
  );
  await recipeItemRepo.save([
    recipeItemRepo.create({ recipeId: recipeBunCha.id, ingredientId: noodle.id, quantity: 0.25, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeBunCha.id, ingredientId: pork.id, quantity: 0.2, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeBunCha.id, ingredientId: vegetable.id, quantity: 0.1, unit: 'kg' }),
    recipeItemRepo.create({ recipeId: recipeBunCha.id, ingredientId: fishSauce.id, quantity: 0.03, unit: 'lít' }),
  ]);
  console.log('✅ Created 5 recipes with items');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 1 Restaurant Chain');
  console.log('   - 2 Branches');
  console.log('   - 18 Tables');
  console.log('   - 10 Ingredients');
  console.log('   - 20 Branch Ingredients (stock)');
  console.log('   - 5 Dishes');
  console.log('   - 10 Branch Dishes (prices)');
  console.log('   - 5 Recipes');
  console.log('\n👤 Login: admin@cooking.com / admin123');
}
