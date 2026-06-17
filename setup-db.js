const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Question helper function
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Function to execute SQL queries safely
async function executeQueries(connection, sql, databaseName) {
    if (!sql || !sql.trim()) return;
    
    // Remove USE statements and handle them separately
    const useMatch = sql.match(/USE\s+`?(\w+)`?\s*;/i);
    if (useMatch && databaseName) {
        await connection.changeUser({ database: databaseName });
        sql = sql.replace(/USE\s+`?\w+`?\s*;/i, '');
    }
    
    // Split by semicolon but be careful with string literals
    const queries = sql.split(';').filter(q => q.trim());
    
    for (let query of queries) {
        if (query.trim()) {
            try {
                await connection.execute(query);
            } catch (err) {
                // Skip "already exists" errors but log others as warnings
                if (!err.message.includes('already exists') && 
                    !err.message.includes('Duplicate entry') &&
                    !err.message.includes('Table already exists') &&
                    !err.message.includes('has a primary key')) {
                    console.warn('  ⚠️  Warning:', err.message.substring(0, 100));
                }
            }
        }
    }
}

// Function to check if database exists
async function databaseExists(connection, dbName) {
    const [rows] = await connection.execute(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [dbName]
    );
    return rows.length > 0;
}

// Function to check if table exists
async function tableExists(connection, dbName, tableName) {
    const [rows] = await connection.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [dbName, tableName]
    );
    return rows.length > 0;
}

// Function to ensure database exists
async function ensureDatabase(connection, dbName) {
    const exists = await databaseExists(connection, dbName);
    if (!exists) {
        console.log(`📁 Creating database '${dbName}'...`);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created`);
    } else {
        console.log(`✅ Database '${dbName}' already exists`);
    }
    await connection.changeUser({ database: dbName });
}

async function setupDatabase() {
    let connection;
    
    try {
        console.log('\n========================================');
        console.log('📚 Classroom Tracker - Database Setup');
        console.log('   (Only adds missing data - No deletion)');
        console.log('========================================\n');
        
        // Ask for database credentials
        const dbHost = await askQuestion('MySQL Host (default: localhost): ') || 'localhost';
        const dbUser = await askQuestion('MySQL Username (default: root): ') || 'root';
        const dbPassword = await askQuestion('MySQL Password (press enter if none): ');
        const dbName = await askQuestion('Database Name (default: classroom_tracker): ') || 'classroom_tracker';
        
        console.log('\n🔄 Connecting to MySQL server...');
        
        // First connect without database
        connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL server successfully\n');
        
        // Ensure database exists
        await ensureDatabase(connection, dbName);
        
        // Process schema.sql
        console.log('\n📖 Processing schema.sql...');
        const schemaPath = path.join(__dirname, 'src/database/schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`schema.sql not found at ${schemaPath}`);
        }
        
        let schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove DROP DATABASE statements if any
        schemaSQL = schemaSQL.replace(/DROP\s+DATABASE\s+[^;]+;/gi, '');
        
        // Replace CREATE DATABASE with IF NOT EXISTS
        schemaSQL = schemaSQL.replace(/CREATE\s+DATABASE\s+(\w+)/gi, 'CREATE DATABASE IF NOT EXISTS $1');
        
        // Replace CREATE TABLE with IF NOT EXISTS
        schemaSQL = schemaSQL.replace(/CREATE\s+TABLE\s+(\w+)/gi, 'CREATE TABLE IF NOT EXISTS $1');
        
        // Execute schema.sql
        console.log('🏗️  Creating missing tables...');
        await executeQueries(connection, schemaSQL, dbName);
        console.log('✅ Schema processing complete');
        
        // Process seed.sql
        console.log('\n📖 Processing seed.sql...');
        const seedPath = path.join(__dirname, 'src/database/seed.sql');
        
        if (fs.existsSync(seedPath)) {
            let seedSQL = fs.readFileSync(seedPath, 'utf8');
            
            // Modify INSERT statements to be safe
            // Convert INSERT INTO to INSERT IGNORE INTO
            seedSQL = seedSQL.replace(/INSERT\s+INTO\s+(\w+)/gi, 'INSERT IGNORE INTO $1');
            
            // Handle INSERT with ON DUPLICATE KEY UPDATE - convert to IGNORE
            seedSQL = seedSQL.replace(/INSERT\s+IGNORE\s+INTO([^;]+)ON\s+DUPLICATE\s+KEY\s+UPDATE[^;]+/gi, 
                (match) => {
                    // Extract the INSERT part before ON DUPLICATE
                    const insertPart = match.match(/INSERT\s+IGNORE\s+INTO[^;]+?VALUES\s*\([^)]+\)/i);
                    if (insertPart) {
                        return insertPart[0] + ';';
                    }
                    return match;
                });
            
            console.log('🌱 Inserting missing data...');
            await executeQueries(connection, seedSQL, dbName);
            console.log('✅ Seed data processing complete');
        } else {
            console.log('⚠️  seed.sql not found, skipping seed data');
        }
        
        // Verify setup and show what's in the database
        console.log('\n🔍 Verifying setup...');
        
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE table_schema = ?
            ORDER BY TABLE_NAME
        `, [dbName]);
        
        console.log(`✅ Found ${tables.length} tables in database`);
        
        // Show counts from each important table
        const importantTables = ['users', 'teachers', 'students', 'courses', 'classrooms', 'timeslots', 'schedules'];
        
        console.log('\n📊 Database Statistics:');
        for (const table of importantTables) {
            const exists = await tableExists(connection, dbName, table);
            if (exists) {
                const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`   - ${table}: ${count[0].count} records`);
            } else {
                console.log(`   - ${table}: table not found`);
            }
        }
        
        // Get sample login credentials from database
        const [users] = await connection.execute(
            'SELECT email, role FROM users LIMIT 3'
        );
        
        if (users.length > 0) {
            console.log('\n📝 Sample Users in Database:');
            users.forEach(user => {
                console.log(`   - ${user.email} (${user.role})`);
            });
            console.log('\n   Password for all sample users: password123');
        } else {
            console.log('\n⚠️  No users found. You may need to add users to seed.sql');
        }
        
        console.log('\n========================================');
        console.log('✅ SETUP COMPLETE!');
        console.log('========================================');
        console.log('\n💡 Note: Only missing data was added.');
        console.log('   No existing data was deleted or modified.\n');
        
    } catch (error) {
        console.error('\n❌ Setup Error:', error.message);
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Make sure MySQL is installed and running');
        console.error('   2. Check your MySQL username and password');
        console.error('   3. Verify schema.sql and seed.sql files exist');
        console.error('   4. Check that your SQL syntax is correct');
    } finally {
        if (connection) {
            await connection.end();
        }
        rl.close();
    }
}

// Run the setup
setupDatabase();