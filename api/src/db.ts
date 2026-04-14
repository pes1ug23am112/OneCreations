import { MongoClient, Db, Collection } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export type NotificationDoc = {
  email: string;
  productId: string | null;
  createdAt: Date;
  source: string;
};

export async function getDb(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('onecreations');

  await db.collection<NotificationDoc>('notifications').createIndex(
    { email: 1, productId: 1 },
    { unique: true }
  );

  return db;
}

export async function getNotifications(): Promise<Collection<NotificationDoc>> {
  const database = await getDb();
  return database.collection<NotificationDoc>('notifications');
}
