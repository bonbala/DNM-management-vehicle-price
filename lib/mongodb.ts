import { MongoClient, type Db } from "mongodb"

const mongoUrl = process.env.MONGODB_URI || ""
const dbName = process.env.DATABASE_NAME || "vehicle_management"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(mongoUrl)
  await client.connect()

  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getVehiclesCollection() {
  const { db } = await connectToDatabase()
  return db.collection("vehicles")
}

export async function getUsersCollection() {
  const { db } = await connectToDatabase()
  return db.collection("users")
}

export async function getHistoriesCollection() {
  const { db } = await connectToDatabase()
  return db.collection("histories")
}
