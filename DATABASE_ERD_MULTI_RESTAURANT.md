# ERD - Hệ thống Multi-Restaurant (Đề xuất mở rộng)

## Sơ đồ quan hệ tổng thể

```
┌──────────────────────┐
│  RESTAURANT_CHAINS   │
│  (Chuỗi nhà hàng)    │
├──────────────────────┤
│ id (PK) UUID         │
│ name                 │
│ status               │
│ created_at           │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│     BRANCHES         │
│   (Chi nhánh)        │
├──────────────────────┤
│ id (PK) UUID         │
│ chain_id (FK)        │
│ name                 │
│ address              │
│ phone                │
│ status               │
│ created_at           │
└──────────┬───────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
           │ 1:N                             │ 1:N
           │                                 │
┌──────────▼───────────┐         ┌──────────▼────────────┐
│      TABLES          │         │   BRANCH_DISHES       │
│     (Bàn ăn)         │         │ (Giá theo chi nhánh)  │
├──────────────────────┤         ├───────────────────────┤
│ id (PK) UUID         │         │ id (PK) UUID          │
│ branch_id (FK)       │         │ branch_id (FK)        │
│ table_code           │         │ dish_id (FK) ─────────┼──► DISHES (Master)
│ capacity             │         │ price                 │
│ status               │         │ is_available          │
└──────────┬───────────┘         │ status                │
           │                     └───────────────────────┘
           │ 1:N
           │
┌──────────▼───────────┐
│  TABLE_SESSIONS      │
│   (Phiên bàn)        │
├──────────────────────┤
│ id (PK) UUID         │
│ table_id (FK)        │
│ opened_at            │
│ closed_at            │
│ status               │
└──────────┬───────────┘
           │
           ├─────────────────────┐
           │                     │
           │ 1:N                 │ 1:1
           │                     │
┌──────────▼───────────┐  ┌──────▼──────────┐
│      ORDERS          │  │    INVOICES     │
│   (Đơn hàng)         │  │   (Hóa đơn)     │
├──────────────────────┤  ├─────────────────┤
│ id (PK) UUID         │  │ id (PK) UUID    │
│ table_session_id(FK) │  │ table_session_id│
│ branch_id (FK)       │  │ total_amount    │
│ order_number         │  │ discount_amount │
│ status               │  │ tax_amount      │
│ created_at           │  │ final_amount    │
└──────────┬───────────┘  │ status          │
           │              │ issued_at       │
           │ 1:N          └────────┬────────┘
           │                       │
┌──────────▼───────────┐           │ 1:N
│   ORDER_ITEMS        │           │
├──────────────────────┤  ┌────────▼────────┐
│ id (PK) UUID         │  │    PAYMENTS     │
│ order_id (FK)        │  ├─────────────────┤
│ dish_id (FK)         │  │ id (PK) UUID    │
│ quantity             │  │ invoice_id (FK) │
│ unit_price           │  │ method          │
│ total_price          │  │ amount          │
│ note                 │  │ paid_at         │
│ status               │  └─────────────────┘
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼────────────────┐
│ ORDER_ITEM_INGREDIENTS    │
│  (Custom topping/remove)  │
├───────────────────────────┤
│ id (PK) UUID              │
│ order_item_id (FK)        │
│ ingredient_id (FK)        │
│ quantity                  │
│ is_removed                │
└───────────────────────────┘


┌──────────────────────┐
│   INGREDIENTS        │
│ (Nguyên liệu master) │
├──────────────────────┤
│ id (PK) UUID         │
│ name                 │
│ unit                 │
│ status               │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────────┐
│  BRANCH_INGREDIENTS      │
│ (Tồn kho theo chi nhánh) │
├──────────────────────────┤
│ id (PK) UUID             │
│ branch_id (FK)           │
│ ingredient_id (FK)       │
│ stock_quantity           │
│ cost_price               │
│ updated_at               │
└──────────────────────────┘


┌──────────────────────┐
│      DISHES          │
│  (Món ăn master)     │
├──────────────────────┤
│ id (PK) UUID         │
│ name                 │
│ description          │
│ image_url            │
│ is_combo             │
│ status               │
│ created_at           │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│     RECIPES          │
├──────────────────────┤
│ id (PK) UUID         │
│ dish_id (FK)         │
│ version              │
│ is_active            │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│   RECIPE_ITEMS       │
├──────────────────────┤
│ recipe_id (FK)       │
│ ingredient_id (FK)   │
│ quantity             │
└──────────────────────┘


┌──────────────────────┐
│    CATEGORIES        │
│  (Danh mục món)      │
├──────────────────────┤
│ id (PK) UUID         │
│ branch_id (FK)       │
│ name                 │
│ sort_order           │
└──────────┬───────────┘
           │
           │ N:M
           │
┌──────────▼───────────┐
│ DISH_CATEGORY_MAP    │
├──────────────────────┤
│ dish_id (FK)         │
│ category_id (FK)     │
└──────────────────────┘
```

## Chi tiết các module

### I. KHỐI TỔ CHỨC

#### 1. RESTAURANT_CHAINS (Chuỗi nhà hàng)
```sql
CREATE TABLE restaurant_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. BRANCHES (Chi nhánh)
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID REFERENCES restaurant_chains(id),
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. TABLES (Bàn ăn)
```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    table_code VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available',
    UNIQUE(branch_id, table_code)
);
```

### II. MENU & MÓN ĂN

#### 4. DISHES (Món ăn master - toàn hệ thống)
```sql
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_combo BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. BRANCH_DISHES (Giá theo chi nhánh)
```sql
CREATE TABLE branch_dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    dish_id UUID REFERENCES dishes(id),
    price NUMERIC(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(branch_id, dish_id)
);
```

#### 6. CATEGORIES (Danh mục món)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0
);
```

#### 7. DISH_CATEGORY_MAP
```sql
CREATE TABLE dish_category_map (
    dish_id UUID REFERENCES dishes(id),
    category_id UUID REFERENCES categories(id),
    PRIMARY KEY (dish_id, category_id)
);
```

### III. NGUYÊN LIỆU & CÔNG THỨC

#### 8. INGREDIENTS (Nguyên liệu master)
```sql
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
);
```

#### 9. BRANCH_INGREDIENTS (Tồn kho theo chi nhánh)
```sql
CREATE TABLE branch_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    ingredient_id UUID REFERENCES ingredients(id),
    stock_quantity NUMERIC(10,2) DEFAULT 0,
    cost_price NUMERIC(10,2),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(branch_id, ingredient_id)
);
```

#### 10. RECIPES
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id UUID REFERENCES dishes(id),
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 11. RECIPE_ITEMS
```sql
CREATE TABLE recipe_items (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    quantity NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);
```

### IV. ORDER THEO BÀN

#### 12. TABLE_SESSIONS (Phiên bàn) - QUAN TRỌNG
```sql
CREATE TABLE table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id),
    opened_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open'
);
```

#### 13. ORDERS
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_session_id UUID REFERENCES table_sessions(id),
    branch_id UUID REFERENCES branches(id),
    order_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 14. ORDER_ITEMS
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    note TEXT,
    status VARCHAR(20) DEFAULT 'pending'
);
```

#### 15. ORDER_ITEM_INGREDIENTS (Custom topping)
```sql
CREATE TABLE order_item_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    quantity NUMERIC(10,2),
    is_removed BOOLEAN DEFAULT FALSE
);
```

### V. HÓA ĐƠN & THANH TOÁN

#### 16. INVOICES
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_session_id UUID REFERENCES table_sessions(id),
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    issued_at TIMESTAMP DEFAULT NOW()
);
```

#### 17. PAYMENTS
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    method VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT NOW()
);
```

## Quy trình nghiệp vụ

### 1. Khách vào bàn
```sql
-- Tạo session mới
INSERT INTO table_sessions (table_id, status) 
VALUES ('table-uuid', 'open');

-- Cập nhật trạng thái bàn
UPDATE tables SET status = 'occupied' WHERE id = 'table-uuid';
```

### 2. Order món (có thể order nhiều lần)
```sql
-- Order lần 1
INSERT INTO orders (table_session_id, branch_id, order_number, status)
VALUES ('session-uuid', 'branch-uuid', 'ORD-001', 'new');

-- Order lần 2 (cùng session)
INSERT INTO orders (table_session_id, branch_id, order_number, status)
VALUES ('session-uuid', 'branch-uuid', 'ORD-002', 'new');
```

### 3. Thanh toán (gộp tất cả orders)
```sql
-- Tính tổng tiền từ tất cả orders trong session
SELECT SUM(oi.total_price) as total
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.table_session_id = 'session-uuid';

-- Tạo hóa đơn
INSERT INTO invoices (table_session_id, total_amount, final_amount, status)
VALUES ('session-uuid', 500000, 500000, 'paid');

-- Tạo payment
INSERT INTO payments (invoice_id, method, amount)
VALUES ('invoice-uuid', 'cash', 500000);

-- Đóng session
UPDATE table_sessions 
SET closed_at = NOW(), status = 'closed'
WHERE id = 'session-uuid';

-- Giải phóng bàn
UPDATE tables SET status = 'available' 
WHERE id = 'table-uuid';
```

## So sánh với hệ thống hiện tại

| Tính năng | Hiện tại | Multi-Restaurant |
|-----------|----------|------------------|
| Chuỗi nhà hàng | ❌ | ✅ |
| Nhiều chi nhánh | ❌ | ✅ |
| Giá theo chi nhánh | ❌ | ✅ |
| Quản lý bàn | Đơn giản | Chi tiết với session |
| Gộp order | ❌ | ✅ TABLE_SESSIONS |
| Tồn kho theo chi nhánh | ❌ | ✅ |
| Hóa đơn riêng | ❌ | ✅ |
| Thanh toán nhiều lần | ❌ | ✅ |

## Ưu điểm của thiết kế mới

1. **Scalable**: Dễ mở rộng nhiều chuỗi, nhiều chi nhánh
2. **Flexible Pricing**: Mỗi chi nhánh có giá riêng
3. **Better Table Management**: Session tracking cho phép gộp orders
4. **Inventory per Branch**: Quản lý tồn kho độc lập
5. **Complete Payment Flow**: Invoice + Payments riêng biệt
6. **Custom Orders**: Hỗ trợ thêm/bớt topping

## Migration từ hệ thống cũ

Để migrate từ hệ thống hiện tại sang multi-restaurant:

1. Tạo 1 chain mặc định
2. Tạo 1 branch mặc định
3. Migrate dishes → giữ nguyên
4. Tạo branch_dishes với giá từ dishes cũ
5. Migrate ingredients → branch_ingredients
6. Migrate orders → tạo table_sessions tương ứng
