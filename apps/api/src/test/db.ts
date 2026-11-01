import mongoose from "mongoose";

const DEFAULT_TEST_URI = "mongodb://localhost:27018/tracelite_test?replicaSet=rs0";

function assertSafeTestUri(uri: string): void {
  const dbName = new URL(uri).pathname.replace(/^\//, "");
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to run tests against database "${dbName}": name must end with "_test"`,
    );
  }
}

export async function connectTestDb(): Promise<void> {
  const uri = process.env.MONGODB_TEST_URI ?? DEFAULT_TEST_URI;
  assertSafeTestUri(uri);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

export async function clearDb(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export async function disconnectTestDb(): Promise<void> {
  await mongoose.disconnect();
}
