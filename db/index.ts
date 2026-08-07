import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema.js";

// Amazon Aurora PostgreSQL connection using IAM auth via OIDC federation.
// The RDS signer produces a short-lived token that is used as the DB password.
const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || "postgres",
  port: 5432,
});

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || "postgres",
  port: 5432,
  user: process.env.PGUSER || "postgres",
  // Auth token is generated per connection (valid up to 15 minutes).
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
});
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
export { schema };
