import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env") });
dotenv.config();

export const env = {
    port: Number(process.env.PORT || 3002),
    db: {
        user: process.env.DB_USER || "sa",
        password: process.env.DB_PASSWORD || "TuPassword123*",
        server: process.env.DB_SERVER || "localhost",
        port: Number(process.env.DB_PORT || 1433),
        database: process.env.DB_NAME || "GymDB",
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    }
};
