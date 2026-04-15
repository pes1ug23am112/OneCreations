import { MongoClient, type Db, type Collection, type MongoClientOptions } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export type NotificationDoc = {
  email: string;
  productId: string | null;
  createdAt: Date;
  source: string;
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
}

export function getDb(): Db {
  if (!db) throw new Error('db not initialized — call initDb() at startup');
  return db;
}

export function getNotifications(): Collection<NotificationDoc> {
  return getDb().collection<NotificationDoc>('notifications');
}

export async function closeDb(): Promise<void> {
  const c = client;
  client = null;
  db = null;
  if (c) await c.close();
}
