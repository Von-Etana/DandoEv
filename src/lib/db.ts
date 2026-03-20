import { promises as fs } from 'fs';
import path from 'path';
import { User, LoanApplication, Order } from './types';

// A simple file-based mock database for storing entities
const dbPath = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
    users: User[];
    loans: LoanApplication[];
    orders: Order[];
}

const defaultSchema: DatabaseSchema = { users: [], loans: [], orders: [] };

export async function initDb() {
    try {
        await fs.mkdir(path.dirname(dbPath), { recursive: true });
        try {
            await fs.access(dbPath);
        } catch {
            await fs.writeFile(dbPath, JSON.stringify(defaultSchema, null, 2));
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

export async function readDb(): Promise<DatabaseSchema> {
    await initDb();
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        const parsed = JSON.parse(data);
        return { ...defaultSchema, ...parsed }; // Merge to ensure arrays exist
    } catch (error) {
        console.error('Failed to read database:', error);
        return defaultSchema;
    }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// User Models
export async function getUsers(): Promise<User[]> {
    const db = await readDb();
    return db.users || [];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find(u => u.email === email);
}

export async function createUser(user: User): Promise<void> {
    const db = await readDb();
    if (!db.users) db.users = [];
    db.users.push(user);
    await writeDb(db);
}

// Loan Models
export async function createLoan(loan: LoanApplication): Promise<void> {
    const db = await readDb();
    if (!db.loans) db.loans = [];
    db.loans.push(loan);
    await writeDb(db);
}

export async function getLoans(): Promise<LoanApplication[]> {
    const db = await readDb();
    return db.loans || [];
}

// Order Models
export async function createOrder(order: Order): Promise<void> {
    const db = await readDb();
    if (!db.orders) db.orders = [];
    db.orders.push(order);
    await writeDb(db);
}

export async function getOrders(): Promise<Order[]> {
    const db = await readDb();
    return db.orders || [];
}
