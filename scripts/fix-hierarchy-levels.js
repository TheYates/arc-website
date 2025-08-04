#!/usr/bin/env node

/**
 * Fix Hierarchy Levels Script
 * 
 * This script recalculates and fixes the item levels in the database
 * based on the actual parent-child relationships.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing hierarchy levels...\n');

// Check if better-sqlite3 is available
let Database;
try {
  Database = require('better-sqlite3');
  console.log('✅ better-sqlite3 package found');
} catch (error) {
  console.log('❌ better-sqlite3 package not found');
  process.exit(1);
}

// Initialize database
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'arc.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found');
  process.exit(1);
}

const db = new Database(dbPath);
console.log('✅ Connected to SQLite database');

try {
  // Get all service items
  const items = db.prepare(`
    SELECT id, name, parent_item_id, item_level, category_id
    FROM service_items 
    ORDER BY sort_order
  `).all();

  console.log(`📋 Found ${items.length} service items`);

  // Function to calculate correct level based on parent chain
  function calculateLevel(itemId, itemMap, visited = new Set()) {
    if (visited.has(itemId)) {
      console.log(`⚠️  Circular reference detected for item ${itemId}`);
      return 1; // Default to level 1 for circular references
    }
    
    visited.add(itemId);
    const item = itemMap.get(itemId);
    
    if (!item || !item.parent_item_id) {
      return 1; // Root item
    }
    
    const parentLevel = calculateLevel(item.parent_item_id, itemMap, visited);
    return parentLevel + 1;
  }

  // Create a map for quick lookup
  const itemMap = new Map();
  items.forEach(item => {
    itemMap.set(item.id, item);
  });

  // Calculate correct levels
  const updates = [];
  items.forEach(item => {
    const correctLevel = calculateLevel(item.id, itemMap);
    if (correctLevel !== item.item_level) {
      updates.push({
        id: item.id,
        name: item.name,
        oldLevel: item.item_level,
        newLevel: correctLevel
      });
    }
  });

  console.log(`\n🔄 Found ${updates.length} items that need level updates:`);
  updates.forEach(update => {
    console.log(`   📝 "${update.name}": Level ${update.oldLevel} → ${update.newLevel}`);
  });

  if (updates.length === 0) {
    console.log('\n✅ All items already have correct levels!');
    process.exit(0);
  }

  // Apply updates
  console.log('\n🔧 Applying level corrections...');
  const updateStmt = db.prepare(`
    UPDATE service_items 
    SET item_level = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);

  db.transaction(() => {
    updates.forEach(update => {
      updateStmt.run(update.newLevel, update.id);
      console.log(`   ✅ Updated "${update.name}" to level ${update.newLevel}`);
    });
  })();

  console.log('\n🎉 Hierarchy levels fixed successfully!');
  console.log('✨ All items now have correct levels based on their parent relationships!');

  // Show final summary by category
  console.log('\n📊 Final hierarchy summary:');
  const categories = db.prepare(`
    SELECT DISTINCT c.name as category_name, c.id as category_id
    FROM service_categories c
    JOIN service_items i ON c.id = i.category_id
  `).all();

  categories.forEach(category => {
    console.log(`\n📂 ${category.category_name}:`);
    const categoryItems = db.prepare(`
      SELECT name, item_level, parent_item_id
      FROM service_items 
      WHERE category_id = ?
      ORDER BY item_level, sort_order
    `).all(category.category_id);

    const levelCounts = {};
    categoryItems.forEach(item => {
      levelCounts[item.item_level] = (levelCounts[item.item_level] || 0) + 1;
    });

    Object.keys(levelCounts).sort().forEach(level => {
      console.log(`   Level ${level}: ${levelCounts[level]} items`);
    });
  });

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
