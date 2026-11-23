import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { db } from "../../db/index.js";
import { users, workItems, calendarEvents, notificationSubscriptions } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { scryptSync, randomBytes, timingSafeEqual, createCipheriv, createDecipheriv, createHash, createHmac } from "crypto";

import { getPushKeys, notifyAllSubscribers, sendPush } from "./push.js";
import { calendarFeedToken } from "./feed-token.js";
import { JOB_STAGES } from "../utils/job-stages.js";

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

// The session key must never come from the repo (it is public). Use SESSION_SECRET
// when set; otherwise derive one from the push private key, which lives only in
// Netlify env vars or the database.
let sessionKey: Promise<Buffer> | null = null;
function getSessionKey(): Promise<Buffer> {
  sessionKey ??= (async () => {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) return createHash("sha256").update(secret).digest();
    const { privateKey } = await getPushKeys();
    return createHmac("sha256", privateKey).update("session-key-v1").digest();
  })().catch(err => { sessionKey = null; throw err; });
  return sessionKey;
}

const SESSION_COOKIE = "work_tracker_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

async function encryptSession(userId: number, username: string, isAdmin: boolean = false): Promise<string> {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await getSessionKey(), iv);
  const data = JSON.stringify({ userId, username, isAdmin, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${tag}`;
}

async function decryptSession(token: string): Promise<{ userId: number; username: string; isAdmin: boolean } | null> {
  try {
    const [ivHex, encrypted, tagHex] = token.split(":");
    if (!ivHex || !encrypted || !tagHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", await getSessionKey(), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Seeds the two admin accounts on a brand-new database. The starting password comes
// from the DEFAULT_ADMIN_PASSWORD env var so it is never in the (public) repo.
let defaultUsersChecked = false;
async function ensureDefaultUsers() {
  if (defaultUsersChecked) return;
  try {
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length === 0) {
      const initialPassword = process.env.DEFAULT_ADMIN_PASSWORD;
      if (!initialPassword || initialPassword.length < 8) {
        console.warn("No users exist. Set DEFAULT_ADMIN_PASSWORD (8+ characters) to create the admin accounts.");
        return;
      }
      await db.insert(users).values([
        { username: "tom", passwordHash: hashPassword(initialPassword), displayName: "Tom", imageUrl: "", isAdmin: true },
        { username: "chris", passwordHash: hashPassword(initialPassword), displayName: "Chris", imageUrl: "", isAdmin: true },
      ]).onConflictDoNothing();
    }
    defaultUsersChecked = true;
  } catch (err) {
    console.error("Error during default user seeding:", err);
  }
}

// "Tom" for notifications: the profile display name, or the capitalised username.
async function actorName(user: { userId: number; username: string }) {
  try {
    const [row] = await db.select({ displayName: users.displayName }).from(users).where(eq(users.id, user.userId)).limit(1);
    if (row?.displayName?.trim()) return row.displayName.trim();
  } catch { /* fall back to username */ }
  return user.username.charAt(0).toUpperCase() + user.username.slice(1);
}

async function getAuthenticatedUser() {
  const sessionToken = getCookie(SESSION_COOKIE);
  if (!sessionToken) return null;
  return decryptSession(sessionToken);
}

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

    const token = await encryptSession(user.id, user.username, user.isAdmin);

    setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      // Netlify functions don't reliably set NODE_ENV, so only relax this for local dev.
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
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
    deleteCookie(SESSION_COOKIE, { path: "/" });
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

export const subscribeToNotifications = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      subscription: z.object({
        endpoint: z.url().refine(value => value.startsWith("https://"), "HTTPS required"),
        keys: z.object({
          p256dh: z.string().min(1),
          auth: z.string().min(1),
        }),
      }),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const values = {
      userId: user.userId,
      endpoint: data.subscription.endpoint,
      p256dh: data.subscription.keys.p256dh,
      auth: data.subscription.keys.auth,
    };
    await db.insert(notificationSubscriptions).values(values).onConflictDoUpdate({
      target: notificationSubscriptions.endpoint,
      set: { ...values, updatedAt: new Date() },
    });

    return { success: true };
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
    whereNeedsMeasuring: z.string().optional(),
    assignedTo: z.enum(["tom", "chris"]),
    measuredBy: z.string().optional(),
    carpetAndFlooringOrdered: z.boolean().optional(),
    upliftAndDisposal: z.boolean().optional(),
    furniture: z.boolean().optional(),
    customerContacted: z.boolean().optional(),
    measuredBooked: z.string().optional(),
    fittingDate: z.string().optional(),
    carpetOrderedDate: z.string().optional(),
    carpetCostPerSqm: z.string().optional(),
    what3words: z.string().optional(),
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
        whereNeedsMeasuring: data.whereNeedsMeasuring || "",
        carpetAndFlooringOrdered: data.carpetAndFlooringOrdered || false,
        upliftAndDisposal: data.upliftAndDisposal || false,
        furniture: data.furniture || false,
        customerContacted: data.customerContacted || false,
        measuredBooked: data.measuredBooked || "",
        fittingDate: data.fittingDate || "",
        carpetOrderedDate: data.carpetOrderedDate || "",
        carpetCostPerSqm: data.carpetCostPerSqm || "",
        what3words: data.what3words || "",
      })
      .returning();

    await notifyAllSubscribers("Job added", `${await actorName(user)} added ${data.customerName}.`, user.userId);

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
    whereNeedsMeasuring: z.string().optional(),
    assignedTo: z.enum(["tom", "chris"]),
    carpetAndFlooringOrdered: z.boolean().optional(),
    upliftAndDisposal: z.boolean().optional(),
    furniture: z.boolean().optional(),
    customerContacted: z.boolean().optional(),
    measuredBy: z.string().optional(),
    measuredBooked: z.string().optional(),
    fittingDate: z.string().optional(),
    carpetOrderedDate: z.string().optional(),
    carpetCostPerSqm: z.string().optional(),
    what3words: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { id, ...values } = data;

    // A new fitting date means a new check-in is due, unless the box was ticked in this same save.
    const [existing] = await db.select().from(workItems).where(eq(workItems.id, id));
    let customerContacted = values.customerContacted ?? existing?.customerContacted ?? false;
    if (existing && (existing.fittingDate || "") !== (values.fittingDate || "") && existing.customerContacted && customerContacted) {
      customerContacted = false;
    }

    const [updatedItem] = await db
      .update(workItems)
      .set({
        ...values,
        customerContacted,
        whereNeedsMeasuring: values.whereNeedsMeasuring || "",
        customerPhone: (values as any).customerPhone || "",
        notes: values.notes || "",
        samples: (values as any).samples || "",
        googleDriveUrl: (values as any).googleDriveUrl || "",
        measuredBy: (values as any).measuredBy || "",
        measuredBooked: values.measuredBooked || "",
        fittingDate: values.fittingDate || "",
        carpetOrderedDate: (values as any).carpetOrderedDate || "",
        carpetCostPerSqm: (values as any).carpetCostPerSqm || "",
        what3words: (values as any).what3words || "",
        updatedAt: new Date(),
      })
      .where(eq(workItems.id, id))
      .returning();

    if (!updatedItem) {
      throw new Error("Job not found");
    }

    await notifyAllSubscribers("Job updated", `${await actorName(user)} updated ${data.customerName}.`, user.userId);

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

    const [itemToDelete] = await db
      .select()
      .from(workItems)
      .where(eq(workItems.id, data.id))
      .limit(1);

    await db
      .delete(workItems)
      .where(eq(workItems.id, data.id));

    if (itemToDelete) {
      await notifyAllSubscribers("Job removed", `${await actorName(user)} removed ${itemToDelete.customerName}.`, user.userId);
    }

    return { success: true };
  });

export const getCalendarEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    return db
      .select()
      .from(calendarEvents)
      .orderBy(desc(calendarEvents.date));
  });

export const createCalendarEvent = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    title: z.string().min(1, "Title is required"),
    date: z.string().min(1, "Date is required"),
    endDate: z.string().optional(),
    notes: z.string().optional(),
    eventType: z.string().default("general"),
    assignedTo: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [newEvent] = await db
      .insert(calendarEvents)
      .values({
        title: data.title,
        date: data.date,
        endDate: data.endDate || "",
        notes: data.notes || "",
        eventType: data.eventType || "general",
        assignedTo: data.assignedTo || "",
      })
      .returning();

    await notifyAllSubscribers("Calendar update", `${await actorName(user)} added ${data.title} to the calendar.`, user.userId);

    return newEvent;
  });

export const updateCalendarEvent = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.number(),
    title: z.string().min(1, "Title is required"),
    date: z.string().min(1, "Date is required"),
    endDate: z.string().optional(),
    notes: z.string().optional(),
    eventType: z.string().default("general"),
    assignedTo: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { id, ...values } = data;

    const [updatedEvent] = await db
      .update(calendarEvents)
      .set({
        ...values,
        endDate: values.endDate || "",
        notes: values.notes || "",
        eventType: values.eventType || "general",
        assignedTo: values.assignedTo || "",
        updatedAt: new Date(),
      })
      .where(eq(calendarEvents.id, id))
      .returning();

    if (!updatedEvent) {
      throw new Error("Calendar event not found");
    }

    await notifyAllSubscribers("Calendar update", `${await actorName(user)} updated ${data.title}.`, user.userId);

    return updatedEvent;
  });

export const deleteCalendarEvent = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.number(),
  }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [eventToDelete] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, data.id))
      .limit(1);

    await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, data.id));

    if (eventToDelete) {
      await notifyAllSubscribers("Calendar update", `${await actorName(user)} removed ${eventToDelete.title} from the calendar.`, user.userId);
    }

    return { success: true };
  });

export const getNotificationKey = createServerFn({ method: "GET" }).handler(async () => {
  if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
  return { publicKey: (await getPushKeys()).publicKey };
});

export const unsubscribeFromNotifications = createServerFn({ method: "POST" })
  .inputValidator(z.object({ endpoint: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");
    await db.delete(notificationSubscriptions).where(and(eq(notificationSubscriptions.userId, user.userId), eq(notificationSubscriptions.endpoint, data.endpoint)));
    return { success: true };
  });

export const testNotification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ endpoint: z.string() }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");
    const [subscription] = await db.select().from(notificationSubscriptions).where(and(eq(notificationSubscriptions.userId, user.userId), eq(notificationSubscriptions.endpoint, data.endpoint)));
    if (!subscription || !await sendPush(subscription, "Notifications are ready", "You’ll receive job changes and install and measuring reminders on this device.", "test")) throw new Error("Unable to send test notification. Try enabling notifications again.");
    return { success: true };
  });

// Only signed-in users can see the secret calendar feed key.
export const getCalendarFeedKey = createServerFn({ method: "GET" }).handler(async () => {
  if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
  return { key: await calendarFeedToken() };
});

// Set when a customer is messaged from the job card, so the check-in reminder stops.
export const markCustomerContacted = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
    await db.update(workItems).set({ customerContacted: true, updatedAt: new Date() }).where(eq(workItems.id, data.id));
    return { success: true };
  });

// One-tap stage change from the job card, without resending the whole form.
export const setWorkItemStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number(), status: z.enum(JOB_STAGES) }))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");
    const [updated] = await db.update(workItems).set({ status: data.status, updatedAt: new Date() })
      .where(eq(workItems.id, data.id)).returning();
    if (!updated) throw new Error("Job not found");
    await notifyAllSubscribers("Job updated", `${await actorName(user)} moved ${updated.customerName} to ${data.status}.`, user.userId);
    return updated;
  });
