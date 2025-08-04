#!/usr/bin/env node

/**
 * Services Migration Script
 *
 * This script extracts hardcoded service data from the existing service pages
 * and populates the SQLite database with the structured data.
 *
 * Usage: node scripts/migrate-services.js
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Migrating hardcoded services to SQLite database...\n");

// Check if better-sqlite3 is available
let Database;
try {
  Database = require("better-sqlite3");
  console.log("✅ better-sqlite3 package found");
} catch (error) {
  console.log("❌ better-sqlite3 package not found");
  console.log("📦 Please install it with: pnpm add better-sqlite3");
  process.exit(1);
}

// Initialize database
const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "arc.db");

if (!fs.existsSync(dbPath)) {
  console.log("❌ Database file not found");
  console.log("📦 Please run: npm run init-db");
  process.exit(1);
}

const db = new Database(dbPath);
const { v4: uuidv4 } = require("uuid");

console.log("✅ Connected to SQLite database");

// Hardcoded service data extracted from existing pages
const servicesData = [
  {
    name: "AHENEFIE",
    slug: "ahenefie",
    displayName: "AHENEFIE",
    description:
      "Comprehensive live-in home care with 24/7 nursing support and emergency response. Our AHENEFIE service provides round-the-clock care in the comfort of your own home.",
    shortDescription: "Live-in home care package",
    category: "home_care",
    priceDisplay: "Starting from GHS 200/day",
    basePriceDaily: 200,
    isPopular: true,
    sortOrder: 1,
    colorTheme: "teal",
    categories: [
      {
        name: "Service Components",
        sortOrder: 1,
        items: [
          { name: "Live in option", itemLevel: 1, sortOrder: 1 },
          {
            name: "Basic nursing",
            itemLevel: 1,
            sortOrder: 2,
            children: [
              { name: "Vital signs monitoring", itemLevel: 2, sortOrder: 1 },
              { name: "Wound care management", itemLevel: 2, sortOrder: 2 },
              { name: "Medication management", itemLevel: 2, sortOrder: 3 },
            ],
          },
          { name: "Lab call", isOptional: true, itemLevel: 1, sortOrder: 3 },
          {
            name: "Laundry Call",
            isOptional: true,
            itemLevel: 1,
            sortOrder: 4,
          },
          {
            name: "Review",
            itemLevel: 1,
            sortOrder: 5,
            children: [
              { name: "Remote review (ARC staff)", itemLevel: 2, sortOrder: 1 },
              {
                name: "Facility reviews planning",
                isOptional: true,
                itemLevel: 2,
                sortOrder: 2,
                children: [
                  {
                    name: "Booking for facility engagement",
                    itemLevel: 3,
                    sortOrder: 1,
                  },
                  {
                    name: "Transportation and support to reviewing facility",
                    itemLevel: 3,
                    sortOrder: 2,
                  },
                  {
                    name: "Information sharing with review facility",
                    itemLevel: 3,
                    sortOrder: 3,
                    children: [
                      {
                        name: "ARC to review facility",
                        itemLevel: 4,
                        sortOrder: 1,
                      },
                      {
                        name: "Review facility to ARC",
                        itemLevel: 4,
                        sortOrder: 2,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "Emergency Response and Management",
            itemLevel: 1,
            sortOrder: 6,
            children: [
              {
                name: "1st respondent First Aid, Stop the Bleed & BLS",
                itemLevel: 2,
                sortOrder: 1,
              },
              {
                name: "Secondary response",
                itemLevel: 2,
                sortOrder: 2,
                children: [
                  { name: "ACLS", itemLevel: 3, sortOrder: 1 },
                  {
                    name: "Emergency ground transport (Pick & Run)",
                    itemLevel: 3,
                    sortOrder: 2,
                    children: [
                      {
                        name: "ARC Ambulance (when available)",
                        itemLevel: 4,
                        sortOrder: 1,
                      },
                      {
                        name: "National ambulance service",
                        itemLevel: 4,
                        sortOrder: 2,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "ADAMFO PA",
    slug: "adamfo-pa",
    displayName: "ADAMFO PA",
    description:
      "Daily home visits with comprehensive nursing care and facility reviews. Perfect for patients who need regular monitoring but prefer to maintain independence.",
    shortDescription: "Daily home visit package",
    category: "home_care",
    priceDisplay: "Starting from GHS 80/visit",
    basePriceDaily: 80,
    isPopular: false,
    sortOrder: 2,
    colorTheme: "blue",
    categories: [
      {
        name: "Home Visitation (Daily)",
        sortOrder: 1,
        items: [
          { name: "Basic nursing", sortOrder: 1 },
          { name: "Vital signs monitoring", sortOrder: 2 },
          { name: "Wound care management", sortOrder: 3 },
          { name: "Medication management", isOptional: true, sortOrder: 4 },
          { name: "Lab call", isOptional: true, sortOrder: 5 },
          { name: "Review", sortOrder: 6 },
          { name: "Remote review (ARC staff)", sortOrder: 7 },
          { name: "Facility reviews planning", isOptional: true, sortOrder: 8 },
          { name: "Booking for facility engagement", sortOrder: 9 },
          {
            name: "Transportation and support to reviewing facility",
            isOptional: true,
            sortOrder: 10,
          },
          { name: "Information sharing with review facility", sortOrder: 11 },
          { name: "ARC to review facility", sortOrder: 12 },
          { name: "Review facility to ARC", sortOrder: 13 },
        ],
      },
      {
        name: "Emergency Response and Management",
        sortOrder: 2,
        items: [
          {
            name: "1st respondent First Aid, Stop the Bleed & BLS",
            sortOrder: 1,
          },
          { name: "Secondary response (variable)", sortOrder: 2 },
          { name: "Tertiary response (variable)", sortOrder: 3 },
          { name: "Emergency transportation", sortOrder: 4 },
          { name: "Emergency facility engagement", sortOrder: 5 },
          { name: "Emergency information sharing", sortOrder: 6 },
          { name: "Emergency facility to ARC", sortOrder: 7 },
          { name: "ARC to emergency facility", sortOrder: 8 },
        ],
      },
    ],
  },
  {
    name: "FIE NE FIE",
    slug: "fie-ne-fie",
    displayName: "Fie Ne Fie",
    description:
      "Professional stay-in nanny service providing comprehensive childcare and household support. Our trained nannies ensure your children receive the best care.",
    shortDescription: "Stay-in nanny service",
    category: "nanny",
    priceDisplay: "Starting from GHS 150/day",
    basePriceDaily: 150,
    isPopular: false,
    sortOrder: 3,
    colorTheme: "purple",
    categories: [
      {
        name: "Childcare Services",
        sortOrder: 1,
        items: [
          { name: "Daily childcare supervision", sortOrder: 1 },
          { name: "Educational activities", sortOrder: 2 },
          { name: "Meal preparation for children", sortOrder: 3 },
          { name: "Bedtime routines", sortOrder: 4 },
          {
            name: "Transportation to school/activities",
            isOptional: true,
            sortOrder: 5,
          },
        ],
      },
      {
        name: "Household Support",
        sortOrder: 2,
        items: [
          { name: "Light housekeeping", sortOrder: 1 },
          { name: "Laundry services", sortOrder: 2 },
          { name: "Grocery shopping", isOptional: true, sortOrder: 3 },
          { name: "Pet care", isOptional: true, sortOrder: 4 },
        ],
      },
    ],
  },
  {
    name: "YONKO PA",
    slug: "yonko-pa",
    displayName: "YONKO PA",
    description:
      "Flexible visit-on-request nanny service for when you need reliable childcare support. Perfect for busy parents who need occasional professional help.",
    shortDescription: "Visit-on-request nanny service",
    category: "nanny",
    priceDisplay: "Starting from GHS 50/hour",
    basePriceHourly: 50,
    isPopular: false,
    sortOrder: 4,
    colorTheme: "indigo",
    categories: [
      {
        name: "On-Demand Childcare",
        sortOrder: 1,
        items: [
          { name: "Flexible scheduling", sortOrder: 1 },
          { name: "Emergency childcare", sortOrder: 2 },
          { name: "Evening/weekend care", sortOrder: 3 },
          { name: "Special event childcare", sortOrder: 4 },
        ],
      },
      {
        name: "Additional Services",
        sortOrder: 2,
        items: [
          { name: "Homework assistance", sortOrder: 1 },
          { name: "Activity planning", sortOrder: 2 },
          { name: "Transportation services", isOptional: true, sortOrder: 3 },
        ],
      },
    ],
  },
  {
    name: "EVENT MEDICAL COVERAGE",
    slug: "event-medical-coverage",
    displayName: "Event Medical Coverage",
    description:
      "Comprehensive medical coverage for sporting events, concerts, festivals, and corporate gatherings with emergency response capabilities.",
    shortDescription: "Professional event medical services",
    category: "emergency",
    priceDisplay: "Starting from GHS 450/day",
    basePriceDaily: 450,
    isPopular: false,
    sortOrder: 5,
    colorTheme: "red",
    categories: [
      {
        name: "Event Medical Services",
        sortOrder: 1,
        items: [
          { name: "On-site medical team", sortOrder: 1 },
          { name: "Emergency response equipment", sortOrder: 2 },
          { name: "First aid stations", sortOrder: 3 },
          { name: "Ambulance standby", isOptional: true, sortOrder: 4 },
          { name: "Medical evacuation planning", sortOrder: 5 },
        ],
      },
    ],
  },
  {
    name: "CONFERENCE OPTION",
    slug: "conference-option",
    displayName: "Conference Option",
    description:
      "Dedicated stay-in medical support for conferences and business events with continuous on-site medical presence.",
    shortDescription: "Stay-in medical support for conferences",
    category: "emergency",
    priceDisplay: "Starting from GHS 400/day",
    basePriceDaily: 400,
    isPopular: false,
    sortOrder: 6,
    colorTheme: "green",
    categories: [
      {
        name: "Conference Medical Support",
        sortOrder: 1,
        items: [
          { name: "Continuous medical presence", sortOrder: 1 },
          { name: "Health monitoring", sortOrder: 2 },
          { name: "Emergency response", sortOrder: 3 },
          { name: "Medical consultation", sortOrder: 4 },
        ],
      },
    ],
  },
];

try {
  // Check if services already exist
  const existingServices = db
    .prepare("SELECT COUNT(*) as count FROM services")
    .get();

  if (existingServices.count > 0) {
    console.log("ℹ️  Services already exist in database");
    console.log("   Checking for missing services...");

    // Check if we have all services
    const existingServiceNames = db.prepare("SELECT name FROM services").all().map(s => s.name);
    const expectedServices = servicesData.map(s => s.name);
    const missingServices = expectedServices.filter(name => !existingServiceNames.includes(name));

    if (missingServices.length === 0) {
      console.log("   All services are already present");
      process.exit(0);
    } else {
      console.log("   Missing services:", missingServices);
      console.log("   Adding missing services...");
    }
  }

  console.log("📝 Inserting services data...");

  // Prepare statements
  const insertService = db.prepare(`
    INSERT INTO services (
      id, name, slug, display_name, description, short_description, category,
      base_price_daily, base_price_monthly, base_price_hourly, price_display,
      is_active, is_popular, sort_order, color_theme
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCategory = db.prepare(`
    INSERT INTO service_categories (id, service_id, name, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO service_items (id, category_id, parent_item_id, name, is_optional, item_level, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Insert services with categories and items (only missing ones if some exist)
  servicesData.forEach((serviceData) => {
    // Skip if service already exists
    if (existingServices.count > 0) {
      const existingService = db.prepare("SELECT id FROM services WHERE name = ?").get(serviceData.name);
      if (existingService) {
        console.log(`   ⏭️  Skipping existing service: ${serviceData.displayName}`);
        return;
      }
    }

    const serviceId = uuidv4();

    // Insert service
    insertService.run(
      serviceId,
      serviceData.name,
      serviceData.slug,
      serviceData.displayName,
      serviceData.description,
      serviceData.shortDescription,
      serviceData.category,
      serviceData.basePriceDaily || null,
      serviceData.basePriceMonthly || null,
      serviceData.basePriceHourly || null,
      serviceData.priceDisplay,
      1, // is_active
      serviceData.isPopular ? 1 : 0,
      serviceData.sortOrder,
      serviceData.colorTheme
    );

    console.log(`   ✅ Inserted service: ${serviceData.displayName}`);

    // Insert categories and items
    serviceData.categories.forEach((categoryData) => {
      const categoryId = uuidv4();

      insertCategory.run(
        categoryId,
        serviceId,
        categoryData.name,
        categoryData.sortOrder
      );

      console.log(`      📂 Added category: ${categoryData.name}`);

      // Insert items recursively
      function insertItemsRecursively(items, parentItemId = null) {
        let totalItems = 0;
        items.forEach((itemData) => {
          const itemId = uuidv4();

          insertItem.run(
            itemId,
            categoryId,
            parentItemId,
            itemData.name,
            itemData.isOptional ? 1 : 0,
            itemData.itemLevel || 1,
            itemData.sortOrder
          );

          totalItems++;

          // Insert children if they exist
          if (itemData.children && itemData.children.length > 0) {
            totalItems += insertItemsRecursively(itemData.children, itemId);
          }
        });
        return totalItems;
      }

      const totalItems = insertItemsRecursively(categoryData.items);
      console.log(`         📋 Added ${totalItems} items`);
    });
  });

  console.log("\n🎉 Services migration completed successfully!");
  console.log("\n📊 Migration Summary:");
  console.log(`   📦 Services: ${servicesData.length}`);
  console.log(
    `   📂 Categories: ${servicesData.reduce(
      (sum, s) => sum + s.categories.length,
      0
    )}`
  );
  console.log(
    `   📋 Items: ${servicesData.reduce(
      (sum, s) =>
        sum + s.categories.reduce((catSum, c) => catSum + c.items.length, 0),
      0
    )}`
  );

  console.log("\n✨ The services are now ready for admin management!");
  console.log("   🔧 Access admin interface at: /admin/services");
  console.log("   🌐 Service pages will now pull from database");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
} finally {
  db.close();
}
