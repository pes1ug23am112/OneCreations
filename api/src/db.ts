import { MongoClient, type Db, type Collection, type MongoClientOptions } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export type NotificationDoc = {
  email: string;
  productId: string | null;
  createdAt: Date;
  source: string;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number; // paise, server-canonical
};

export type OrderStatus = 'created' | 'paid' | 'failed' | 'refunded';

export type OrderDoc = {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  items: OrderItem[];
  amount: number; // paise total
  currency: 'INR';
  email: string;
  status: OrderStatus;
  notes?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  // Set atomically the first time a receipt is dispatched, so Razorpay webhook
  // retries (which they will, on any non-2xx) can't double-send the email.
  receiptSentAt?: Date;
};

const OPTIONS: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 20_000,
  connectTimeoutMS: 10_000,
  retryWrites: true,
};

export async function initDb(uri: string): Promise<void> {
  if (db) return;
  client = new MongoClient(uri, OPTIONS);
  await client.connect();
  db = client.db('onecreations');

  await db
    .collection<NotificationDoc>('notifications')
    .createIndex({ email: 1, productId: 1 }, { unique: true });

  const orders = db.collection<OrderDoc>('orders');
  await orders.createIndex({ razorpayOrderId: 1 }, { unique: true });
  await orders.createIndex({ email: 1, createdAt: -1 });
}

export function getDb(): Db {
  if (!db) throw new Error('db not initialized — call initDb() at startup');
  return db;
}

export function getNotifications(): Collection<NotificationDoc> {
  return getDb().collection<NotificationDoc>('notifications');
}

export function getOrders(): Collection<OrderDoc> {
  return getDb().collection<OrderDoc>('orders');
}

export async function closeDb(): Promise<void> {
  const c = client;
  client = null;
  db = null;
  if (c) await c.close();
}
