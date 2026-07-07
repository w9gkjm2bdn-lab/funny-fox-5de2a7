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

function encryptSession(userId: number, username: string, isAdmin: boolean = false): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = JSON.stringify({ userId, username, isAdmin, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${tag}`;
}

function decryptSession(token: string): { userId: number; username: string; isAdmin: boolean } | null {
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
        { username: "tom", passwordHash: hashPassword("Password123"), displayName: "Tom", imageUrl: "", isAdmin: true },
        { username: "chris", passwordHash: hashPassword("Password123"), displayName: "Chris", imageUrl: "", isAdmin: true },
      ];
      await db.insert(users).values(defaultUsers);
    }
    // Ensure known team accounts have admin privileges (idempotent)
    try {
      await db.update(users).set({ isAdmin: true }).where(eq(users.username, 'chris'))
      await db.update(users).set({ isAdmin: true }).where(eq(users.username, 'tom'))
    } catch (e) {
      // ignore if migration/state doesn't include column yet
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
    
    const token = encryptSession(user.id, user.username, user.isAdmin);
    
    setCookie("work_tracker_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      displayName: user.displayName || user.username,
      imageUrl: user.imageUrl || "",
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
    if (!sessionUser) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionUser.userId))
      .limit(1);

    if (!user) return null;

    return {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      displayName: user.displayName || user.username,
      imageUrl: user.imageUrl || "",
    };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    displayName: z.string().optional(),
    imageUrl: z.string().url().optional(),
    password: z.string().min(6).optional(),
    confirmPassword: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (data.password && data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const updates: Record<string, any> = {
      displayName: data.displayName || undefined,
      imageUrl: data.imageUrl || undefined,
    };

    if (data.password) {
      updates.passwordHash = hashPassword(data.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return {
      userId: updatedUser.id,
      username: updatedUser.username,
      isAdmin: updatedUser.isAdmin,
      displayName: updatedUser.displayName || updatedUser.username,
      imageUrl: updatedUser.imageUrl || "",
    };
  });

export const register = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }))
  .handler(async () => {
    // Registration is disabled by design. Accounts are created directly in the
    // database by an administrator; there is no self-service sign-up.
    throw new Error("Registration is disabled. Please contact an administrator to create an account.");
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
    customerPhone: z.string().optional(),
    site: z.string().min(1, "Site is required"),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
    samples: z.string().optional(),
    googleDriveUrl: z.string().optional(),
    whatsRequired: z.string().min(1, "What is required is mandatory"),
    whereNeedsMeasuring: z.string().min(1, "Where needs measuring is mandatory"),
    assignedTo: z.enum(['tom', 'chris']),
    measuredBy: z.string().optional(),
    carpetAndFlooringOrdered: z.boolean().optional(),
    upliftAndDisposal: z.boolean().optional(),
    furniture: z.boolean().optional(),
    measuredBooked: z.string().optional(),
    fittingDate: z.string().optional(),
    carpetOrderedDate: z.string().optional(),
    carpetCostPerSqm: z.string().optional(),
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
        customerPhone: data.customerPhone || "",
        site: data.site,
        status: data.status,
        notes: data.notes || "",
        samples: data.samples || "",
        googleDriveUrl: data.googleDriveUrl || "",
        assignedTo: data.assignedTo,
        measuredBy: (data as any).measuredBy || "",
        whatsRequired: data.whatsRequired,
        whereNeedsMeasuring: data.whereNeedsMeasuring,
        carpetAndFlooringOrdered: data.carpetAndFlooringOrdered || false,
        upliftAndDisposal: data.upliftAndDisposal || false,
        furniture: data.furniture || false,
        measuredBooked: data.measuredBooked || "",
        fittingDate: data.fittingDate || "",
        carpetOrderedDate: data.carpetOrderedDate || "",
        carpetCostPerSqm: data.carpetCostPerSqm || "",
      })
      .returning();
      
    return newItem;
  });

export const updateWorkItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.number(),
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().optional(),
    site: z.string().min(1, "Site is required"),
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
    samples: z.string().optional(),
    googleDriveUrl: z.string().optional(),
    whatsRequired: z.string().min(1, "What is required is mandatory"),
    whereNeedsMeasuring: z.string().min(1, "Where needs measuring is mandatory"),
    assignedTo: z.enum(['tom', 'chris']),
    carpetAndFlooringOrdered: z.boolean().optional(),
    upliftAndDisposal: z.boolean().optional(),
    furniture: z.boolean().optional(),
    measuredBy: z.string().optional(),
    measuredBooked: z.string().optional(),
    fittingDate: z.string().optional(),
    carpetOrderedDate: z.string().optional(),
    carpetCostPerSqm: z.string().optional(),
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
        customerPhone: (values as any).customerPhone || "",
        notes: values.notes || "",
        samples: (values as any).samples || "",
        googleDriveUrl: (values as any).googleDriveUrl || "",
        measuredBy: (values as any).measuredBy || "",
        measuredBooked: values.measuredBooked || "",
        fittingDate: values.fittingDate || "",
        carpetOrderedDate: (values as any).carpetOrderedDate || "",
        carpetCostPerSqm: (values as any).carpetCostPerSqm || "",
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
