import { getDatabase, generateId } from "@/lib/database/sqlite";

// Types for services management
export interface Service {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  description?: string;
  shortDescription?: string;
  category: "home_care" | "nanny" | "emergency" | "custom";
  basePriceDaily?: number;
  basePriceMonthly?: number;
  basePriceHourly?: number;
  priceDisplay?: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  colorTheme: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  categories?: ServiceCategory[];
  pricing?: ServicePricing[];
}

export interface ServiceCategory {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items?: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  parentItemId?: string;
  name: string;
  description?: string;
  isOptional: boolean;
  itemLevel: number; // 1 = primary, 2 = sub-item, 3 = sub-sub-item
  sortOrder: number;
  priceHourly: number; // Individual pricing for optional items
  priceDaily: number;
  priceMonthly: number;
  createdAt: string;
  updatedAt: string;
  children?: ServiceItem[]; // For nested structure
}

export interface ServicePricing {
  id: string;
  serviceId: string;
  tierName: string;
  price: number;
  billingPeriod: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  description?: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Get database instance
function getDb() {
  return getDatabase();
}

// Services CRUD operations
export function getAllServices(includeInactive = false): Service[] {
  const db = getDb();
  const whereClause = includeInactive ? "" : "WHERE is_active = 1";

  const stmt = db.prepare(`
    SELECT * FROM services 
    ${whereClause}
    ORDER BY sort_order ASC, display_name ASC
  `);

  const rows = stmt.all() as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    basePriceDaily: row.base_price_daily,
    basePriceMonthly: row.base_price_monthly,
    basePriceHourly: row.base_price_hourly,
    priceDisplay: row.price_display,
    isActive: Boolean(row.is_active),
    isPopular: Boolean(row.is_popular),
    sortOrder: row.sort_order,
    colorTheme: row.color_theme,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function getServiceById(serviceId: string): Service | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
  const row = stmt.get(serviceId) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    basePriceDaily: row.base_price_daily,
    basePriceMonthly: row.base_price_monthly,
    basePriceHourly: row.base_price_hourly,
    priceDisplay: row.price_display,
    isActive: Boolean(row.is_active),
    isPopular: Boolean(row.is_popular),
    sortOrder: row.sort_order,
    colorTheme: row.color_theme,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getServiceBySlug(slug: string): Service | null {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM services WHERE slug = ? AND is_active = 1"
  );
  const row = stmt.get(slug) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    basePriceDaily: row.base_price_daily,
    basePriceMonthly: row.base_price_monthly,
    basePriceHourly: row.base_price_hourly,
    priceDisplay: row.price_display,
    isActive: Boolean(row.is_active),
    isPopular: Boolean(row.is_popular),
    sortOrder: row.sort_order,
    colorTheme: row.color_theme,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createService(
  serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">
): Service {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO services (
      id, name, slug, display_name, description, short_description, category,
      base_price_daily, base_price_monthly, base_price_hourly, price_display,
      is_active, is_popular, sort_order, color_theme, icon
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    serviceData.name,
    serviceData.slug,
    serviceData.displayName,
    serviceData.description || null,
    serviceData.shortDescription || null,
    serviceData.category,
    serviceData.basePriceDaily || null,
    serviceData.basePriceMonthly || null,
    serviceData.basePriceHourly || null,
    serviceData.priceDisplay || null,
    serviceData.isActive ? 1 : 0,
    serviceData.isPopular ? 1 : 0,
    serviceData.sortOrder,
    serviceData.colorTheme,
    serviceData.icon || null
  );

  return {
    id,
    ...serviceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateService(
  serviceId: string,
  updates: Partial<Service>
): boolean {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.slug !== undefined) {
    fields.push("slug = ?");
    values.push(updates.slug);
  }
  if (updates.displayName !== undefined) {
    fields.push("display_name = ?");
    values.push(updates.displayName);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.shortDescription !== undefined) {
    fields.push("short_description = ?");
    values.push(updates.shortDescription);
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (updates.basePriceDaily !== undefined) {
    fields.push("base_price_daily = ?");
    values.push(updates.basePriceDaily);
  }
  if (updates.basePriceMonthly !== undefined) {
    fields.push("base_price_monthly = ?");
    values.push(updates.basePriceMonthly);
  }
  if (updates.basePriceHourly !== undefined) {
    fields.push("base_price_hourly = ?");
    values.push(updates.basePriceHourly);
  }
  if (updates.priceDisplay !== undefined) {
    fields.push("price_display = ?");
    values.push(updates.priceDisplay);
  }
  if (updates.isActive !== undefined) {
    fields.push("is_active = ?");
    values.push(updates.isActive ? 1 : 0);
  }
  if (updates.isPopular !== undefined) {
    fields.push("is_popular = ?");
    values.push(updates.isPopular ? 1 : 0);
  }
  if (updates.sortOrder !== undefined) {
    fields.push("sort_order = ?");
    values.push(updates.sortOrder);
  }
  if (updates.colorTheme !== undefined) {
    fields.push("color_theme = ?");
    values.push(updates.colorTheme);
  }
  if (updates.icon !== undefined) {
    fields.push("icon = ?");
    values.push(updates.icon);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(serviceId);

  const stmt = db.prepare(`
    UPDATE services 
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteService(serviceId: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM services WHERE id = ?");
  const result = stmt.run(serviceId);
  return result.changes > 0;
}

// Service Categories CRUD operations
export function getServiceCategories(serviceId: string): ServiceCategory[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM service_categories
    WHERE service_id = ?
    ORDER BY sort_order ASC, name ASC
  `);

  const rows = stmt.all(serviceId) as any[];

  return rows.map((row) => ({
    id: row.id,
    serviceId: row.service_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function createServiceCategory(
  categoryData: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">
): ServiceCategory {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO service_categories (id, service_id, name, description, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    categoryData.serviceId,
    categoryData.name,
    categoryData.description || null,
    categoryData.sortOrder
  );

  return {
    id,
    ...categoryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateServiceCategory(
  categoryId: string,
  updates: Partial<ServiceCategory>
): boolean {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.sortOrder !== undefined) {
    fields.push("sort_order = ?");
    values.push(updates.sortOrder);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(categoryId);

  const stmt = db.prepare(`
    UPDATE service_categories
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteServiceCategory(categoryId: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM service_categories WHERE id = ?");
  const result = stmt.run(categoryId);
  return result.changes > 0;
}

// Service Items CRUD operations
export function getServiceItems(categoryId: string): ServiceItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM service_items
    WHERE category_id = ?
    ORDER BY sort_order ASC, name ASC
  `);

  const rows = stmt.all(categoryId) as any[];

  const items = rows.map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    parentItemId: row.parent_item_id,
    name: row.name,
    description: row.description,
    isOptional: Boolean(row.is_optional),
    itemLevel: row.item_level || 1,
    sortOrder: row.sort_order,
    priceHourly: parseFloat(row.price_hourly || 0),
    priceDaily: parseFloat(row.price_daily || 0),
    priceMonthly: parseFloat(row.price_monthly || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  // Return flat list - let the frontend build hierarchy
  return items;
}

// Get hierarchical service items (for display purposes)
export function getServiceItemsHierarchical(categoryId: string): ServiceItem[] {
  const items = getServiceItems(categoryId);

  // Build hierarchical structure
  const itemMap = new Map<string, ServiceItem>();
  const rootItems: ServiceItem[] = [];

  // Add children property for hierarchy
  const hierarchicalItems = items.map((item) => ({
    ...item,
    children: [] as ServiceItem[],
  }));

  // First pass: create map and identify root items
  hierarchicalItems.forEach((item) => {
    itemMap.set(item.id, item);
    if (!item.parentItemId) {
      rootItems.push(item);
    }
  });

  // Second pass: build parent-child relationships
  hierarchicalItems.forEach((item) => {
    if (item.parentItemId) {
      const parent = itemMap.get(item.parentItemId);
      if (parent) {
        parent.children!.push(item);
      }
    }
  });

  return rootItems;
}

export function createServiceItem(
  itemData: Omit<ServiceItem, "id" | "createdAt" | "updatedAt">
): ServiceItem {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO service_items (
      id, category_id, parent_item_id, name, description,
      is_optional, item_level, sort_order,
      price_hourly, price_daily, price_monthly,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  stmt.run(
    id,
    itemData.categoryId,
    itemData.parentItemId || null,
    itemData.name,
    itemData.description || null,
    itemData.isOptional ? 1 : 0,
    itemData.itemLevel || 1,
    itemData.sortOrder,
    itemData.priceHourly || 0,
    itemData.priceDaily || 0,
    itemData.priceMonthly || 0,
    now,
    now
  );

  return {
    id,
    ...itemData,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateServiceItem(
  itemId: string,
  updates: Partial<ServiceItem>
): boolean {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.isOptional !== undefined) {
    fields.push("is_optional = ?");
    values.push(updates.isOptional ? 1 : 0);
  }
  if (updates.sortOrder !== undefined) {
    fields.push("sort_order = ?");
    values.push(updates.sortOrder);
  }
  if (updates.itemLevel !== undefined) {
    fields.push("item_level = ?");
    values.push(updates.itemLevel);
  }
  if (updates.parentItemId !== undefined) {
    fields.push("parent_item_id = ?");
    values.push(updates.parentItemId);
  }
  if (updates.priceHourly !== undefined) {
    fields.push("price_hourly = ?");
    values.push(updates.priceHourly);
  }
  if (updates.priceDaily !== undefined) {
    fields.push("price_daily = ?");
    values.push(updates.priceDaily);
  }
  if (updates.priceMonthly !== undefined) {
    fields.push("price_monthly = ?");
    values.push(updates.priceMonthly);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(itemId);

  const stmt = db.prepare(`
    UPDATE service_items
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteServiceItem(itemId: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM service_items WHERE id = ?");
  const result = stmt.run(itemId);
  return result.changes > 0;
}

// Service Pricing CRUD operations
export function getServicePricing(serviceId: string): ServicePricing[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM service_pricing
    WHERE service_id = ?
    ORDER BY sort_order ASC, tier_name ASC
  `);

  const rows = stmt.all(serviceId) as any[];

  return rows.map((row) => ({
    id: row.id,
    serviceId: row.service_id,
    tierName: row.tier_name,
    price: row.price,
    billingPeriod: row.billing_period,
    description: row.description,
    isDefault: Boolean(row.is_default),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function createServicePricing(
  pricingData: Omit<ServicePricing, "id" | "createdAt" | "updatedAt">
): ServicePricing {
  const db = getDb();
  const id = generateId();

  const stmt = db.prepare(`
    INSERT INTO service_pricing (id, service_id, tier_name, price, billing_period, description, is_default, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    pricingData.serviceId,
    pricingData.tierName,
    pricingData.price,
    pricingData.billingPeriod,
    pricingData.description || null,
    pricingData.isDefault ? 1 : 0,
    pricingData.sortOrder
  );

  return {
    id,
    ...pricingData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateServicePricing(
  pricingId: string,
  updates: Partial<ServicePricing>
): boolean {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updates.tierName !== undefined) {
    fields.push("tier_name = ?");
    values.push(updates.tierName);
  }
  if (updates.price !== undefined) {
    fields.push("price = ?");
    values.push(updates.price);
  }
  if (updates.billingPeriod !== undefined) {
    fields.push("billing_period = ?");
    values.push(updates.billingPeriod);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.isDefault !== undefined) {
    fields.push("is_default = ?");
    values.push(updates.isDefault ? 1 : 0);
  }
  if (updates.sortOrder !== undefined) {
    fields.push("sort_order = ?");
    values.push(updates.sortOrder);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(pricingId);

  const stmt = db.prepare(`
    UPDATE service_pricing
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteServicePricing(pricingId: string): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM service_pricing WHERE id = ?");
  const result = stmt.run(pricingId);
  return result.changes > 0;
}

// Utility functions
export function getServiceWithDetails(serviceId: string): Service | null {
  const service = getServiceById(serviceId);
  if (!service) return null;

  service.categories = getServiceCategories(serviceId);
  service.pricing = getServicePricing(serviceId);

  // Load items for each category
  service.categories.forEach((category) => {
    category.items = getServiceItems(category.id);
  });

  return service;
}

export function getServiceBySlugWithDetails(slug: string): Service | null {
  const service = getServiceBySlug(slug);
  if (!service) return null;

  service.categories = getServiceCategories(service.id);
  service.pricing = getServicePricing(service.id);

  // Load items for each category
  service.categories.forEach((category) => {
    category.items = getServiceItems(category.id);
  });

  return service;
}

export function getServicesCount(): number {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM services WHERE is_active = 1"
  );
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getServicesByCategory(category: string): Service[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM services
    WHERE category = ? AND is_active = 1
    ORDER BY sort_order ASC, display_name ASC
  `);

  const rows = stmt.all(category) as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    basePriceDaily: row.base_price_daily,
    basePriceMonthly: row.base_price_monthly,
    basePriceHourly: row.base_price_hourly,
    priceDisplay: row.price_display,
    isActive: Boolean(row.is_active),
    isPopular: Boolean(row.is_popular),
    sortOrder: row.sort_order,
    colorTheme: row.color_theme,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
