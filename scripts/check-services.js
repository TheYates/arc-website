const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, '..', 'data', 'arc.db');
  console.log('Using database:', dbPath);
  const db = new Database(dbPath);
  
  console.log('📋 Current services in database:');
  const services = db.prepare(`
    SELECT name, color_theme, sort_order, is_active 
    FROM services 
    ORDER BY sort_order, name
  `).all();
  
  console.table(services);
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
