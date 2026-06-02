import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { db } from "../../db/index.js";
import { users, workItems } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { scryptSync, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv } from "crypto";

// Security Helper Functions
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const testHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch (e) {
    return false;
  }
}

const SECRET_KEY = process.env.SESSION_SECRET || "work-tracker-secure-fallback-secret-key-32b";
const key = Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32));

function encryptSession(userId: number, username: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = JSON.stringify({ userId, username, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${tag}`;
}

function decryptSession(token: string): { userId: number; username: string } | null {
  try {
    const [ivHex, encrypted, tagHex] = token.split(":");
    if (!ivHex || !encrypted || !tagHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Database Seeding Helper
async function ensureDefaultUsers() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      const defaultUsers = [
        { username: "admin", passwordHash: hashPassword("tracker123") },
        { username: "user", passwordHash: hashPassword("tracker123") },
      ];
      await db.insert(users).values(defaultUsers);
    }
  } catch (err) {
    console.error("Error during default user seeding:", err);
  }
}

// Server-side Session Authentication Helper
async function getAuthenticatedUser() {
  const sessionToken = getCookie("work_tracker_session");
  if (!sessionToken) return null;
  return decryptSession(sessionToken);
}

// ==========================================
// SERVER FUNCTIONS
// ==========================================

export const login = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  }))
  .handler(async ({ data }) => {
    await ensureDefaultUsers();
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username.toLowerCase()))
      .limit(1);
      
    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new Error("Invalid username or password");
    }
    
    const token = encryptSession(user.id, user.username);
    
    setCookie("work_tracker_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return {
      userId: user.id,
      username: user.username,
    };
  });

export const logout = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("work_tracker_session");
    return { success: true };
  });

export const getCurrentUser = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureDefaultUsers();
    const sessionUser = await getAuthenticatedUser();
    return sessionUser;
  });

export const register = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }))
  .handler(async ({ data }) => {
    await ensureDefaultUsers();
    
    const normalizedUsername = data.username.trim().toLowerCase();
    
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, normalizedUsername))
      .limit(1);
      
    if (existing) {
      throw new Error("Username is already taken");
    }
    
    const passwordHash = hashPassword(data.password);
    
    const [newUser] = await db
      .insert(users)
      .values({
        username: normalizedUsername,
        passwordHash,
      })
      .returning();
      
    const token = encryptSession(newUser.id, newUser.username);
    
    setCookie("work_tracker_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });
    
    return {
      userId: newUser.id,
      username: newUser.username,
    };
  });

export const getWorkItems = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    return db
      .select()
      .from(workItems)
      .orderBy(desc(workItems.updatedAt));
  });

export const createWorkItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    customerName: z.string().min(1, "Customer name is required"),
    site: z.string().min(1, "Site is required"),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
    whatsRequired: z.string().min(1, "What is required is mandatory"),
    whereNeedsMeasuring: z.string().min(1, "Where needs measuring is mandatory"),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    const [newItem] = await db
      .insert(workItems)
      .values({
        customerName: data.customerName,
        site: data.site,
        status: data.status,
        notes: data.notes || "",
        whatsRequired: data.whatsRequired,
        whereNeedsMeasuring: data.whereNeedsMeasuring,
      })
      .returning();
      
    return newItem;
  });

export const updateWorkItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.number(),
    customerName: z.string().min(1, "Customer name is required"),
    site: z.string().min(1, "Site is required"),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
    whatsRequired: z.string().min(1, "What is required is mandatory"),
    whereNeedsMeasuring: z.string().min(1, "Where needs measuring is mandatory"),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    const { id, ...values } = data;
    
    const [updatedItem] = await db
      .update(workItems)
      .set({
        ...values,
        notes: values.notes || "",
        updatedAt: new Date(),
      })
      .where(eq(workItems.id, id))
      .returning();
      
    if (!updatedItem) {
      throw new Error("Work item not found");
    }
    
    return updatedItem;
  });

export const deleteWorkItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.number(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    await db
      .delete(workItems)
      .where(eq(workItems.id, data.id));
      
    return { success: true };
  });
