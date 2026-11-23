import { T as TSS_SERVER_FUNCTION, c as createServerFn, s as setCookie$1, d as deleteCookie$1, g as getCookie } from "../server.js";
import { z } from "zod";
import { drizzle } from "drizzle-orm/netlify-db";
import { pgTable, timestamp, boolean, text, serial, integer } from "drizzle-orm/pg-core";
import { eq, desc, and } from "drizzle-orm";
import { scryptSync, timingSafeEqual, randomBytes, createCipheriv, createHash, createHmac as createHmac$1, createDecipheriv } from "crypto";
import { generateVAPIDKeys, sendNotification } from "web-push";
import { createHmac } from "node:crypto";
import { J as JOB_STAGES } from "./job-stages-CoP1oJna.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  imageUrl: text("image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  site: text("site").notNull(),
  status: text("status").notNull().default("New enquiry"),
  notes: text("notes"),
  whatsRequired: text("whats_required").notNull(),
  whereNeedsMeasuring: text("where_needs_measuring").notNull(),
  googleDriveUrl: text("google_drive_url"),
  samples: text("samples"),
  carpetAndFlooringOrdered: boolean("carpet_and_flooring_ordered").notNull().default(false),
  upliftAndDisposal: boolean("uplift_and_disposal").notNull().default(false),
  furniture: boolean("furniture").notNull().default(false),
  customerContacted: boolean("customer_contacted").notNull().default(false),
  assignedTo: text("assigned_to"),
  measuredBy: text("measured_by"),
  measuredBooked: text("measured_booked"),
  fittingDate: text("fitting_date"),
  carpetOrderedDate: text("carpet_ordered_date"),
  carpetCostPerSqm: text("carpet_cost_per_sqm"),
  what3words: text("what3words"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  // ISO YYYY-MM-DD or date string
  endDate: text("end_date"),
  // optional end date for multi-day
  notes: text("notes"),
  eventType: text("event_type").notNull().default("general"),
  // e.g. "fitting", "measure", "holiday", "general", "delivery"
  assignedTo: text("assigned_to"),
  // e.g. "tom", "chris", or team
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
const pushConfiguration = pgTable("push_configuration", {
  id: integer("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull()
});
const notificationDeliveries = pgTable("notification_deliveries", {
  key: text("key").primaryKey(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  calendarEvents,
  notificationDeliveries,
  notificationSubscriptions,
  pushConfiguration,
  users,
  workItems
}, Symbol.toStringTag, { value: "Module" }));
const db = drizzle({ schema });
async function getPushKeys() {
  const runtime = globalThis;
  const env = (name) => runtime.Netlify?.env.get(name) ?? process.env[name];
  const publicKey = env("VAPID_PUBLIC_KEY");
  const privateKey = env("VAPID_PRIVATE_KEY");
  if (publicKey && privateKey) return { publicKey, privateKey };
  const [existing] = await db.select().from(pushConfiguration).where(eq(pushConfiguration.id, 1));
  if (existing) return existing;
  const keys = generateVAPIDKeys();
  await db.insert(pushConfiguration).values({ id: 1, ...keys }).onConflictDoNothing();
  const [saved] = await db.select().from(pushConfiguration).where(eq(pushConfiguration.id, 1));
  return saved;
}
async function sendPush(subscription, title, body, tag) {
  const keys = await getPushKeys();
  try {
    await sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify({ title, body, tag, url: "/" }),
      {
        vapidDetails: { subject: "https://tmflooring.netlify.app", ...keys },
        TTL: 3600,
        timeout: 5e3
      }
    );
    return true;
  } catch (error) {
    const status = error.statusCode;
    if (status === 404 || status === 410) {
      await db.delete(notificationSubscriptions).where(eq(notificationSubscriptions.id, subscription.id));
      return true;
    }
    console.warn("Push delivery failed", { status });
    return false;
  }
}
async function notifyAllSubscribers(title, body, excludeUserId) {
  try {
    const subscriptions = (await db.select().from(notificationSubscriptions)).filter((subscription) => subscription.userId !== excludeUserId);
    await Promise.all(subscriptions.map((subscription) => sendPush(subscription, title, body, `change-${Date.now()}`)));
  } catch {
    console.warn("Unable to deliver tracker change notifications");
  }
}
async function calendarFeedToken() {
  const { privateKey } = await getPushKeys();
  return createHmac("sha256", privateKey).update("calendar-feed-v1").digest("base64url").slice(0, 32);
}
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const testHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
  } catch (e) {
    return false;
  }
}
let sessionKey = null;
function getSessionKey() {
  sessionKey ??= (async () => {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) return createHash("sha256").update(secret).digest();
    const {
      privateKey
    } = await getPushKeys();
    return createHmac$1("sha256", privateKey).update("session-key-v1").digest();
  })().catch((err) => {
    sessionKey = null;
    throw err;
  });
  return sessionKey;
}
const SESSION_COOKIE = "work_tracker_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
async function encryptSession(userId, username, isAdmin = false) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await getSessionKey(), iv);
  const data = JSON.stringify({
    userId,
    username,
    isAdmin,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1e3
  });
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${tag}`;
}
async function decryptSession(token) {
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
let defaultUsersChecked = false;
async function ensureDefaultUsers() {
  if (defaultUsersChecked) return;
  try {
    const existingUsers = await db.select({
      id: users.id
    }).from(users).limit(1);
    if (existingUsers.length === 0) {
      const initialPassword = process.env.DEFAULT_ADMIN_PASSWORD;
      if (!initialPassword || initialPassword.length < 8) {
        console.warn("No users exist. Set DEFAULT_ADMIN_PASSWORD (8+ characters) to create the admin accounts.");
        return;
      }
      await db.insert(users).values([{
        username: "tom",
        passwordHash: hashPassword(initialPassword),
        displayName: "Tom",
        imageUrl: "",
        isAdmin: true
      }, {
        username: "chris",
        passwordHash: hashPassword(initialPassword),
        displayName: "Chris",
        imageUrl: "",
        isAdmin: true
      }]).onConflictDoNothing();
    }
    defaultUsersChecked = true;
  } catch (err) {
    console.error("Error during default user seeding:", err);
  }
}
async function actorName(user) {
  try {
    const [row] = await db.select({
      displayName: users.displayName
    }).from(users).where(eq(users.id, user.userId)).limit(1);
    if (row?.displayName?.trim()) return row.displayName.trim();
  } catch {
  }
  return user.username.charAt(0).toUpperCase() + user.username.slice(1);
}
async function getAuthenticatedUser() {
  const sessionToken = getCookie(SESSION_COOKIE);
  if (!sessionToken) return null;
  return decryptSession(sessionToken);
}
const login_createServerFn_handler = createServerRpc({
  id: "da43996aa46c6f804e0b0aa60b870e698702fb6a24546d59811dcd5dc1f7978d",
  name: "login",
  filename: "src/server/tracker.functions.ts"
}, (opts) => login.__executeServer(opts));
const login = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
})).handler(login_createServerFn_handler, async ({
  data
}) => {
  await ensureDefaultUsers();
  const [user] = await db.select().from(users).where(eq(users.username, data.username.toLowerCase())).limit(1);
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    throw new Error("Invalid username or password");
  }
  const token = await encryptSession(user.id, user.username, user.isAdmin);
  setCookie$1(SESSION_COOKIE, token, {
    httpOnly: true,
    // Netlify functions don't reliably set NODE_ENV, so only relax this for local dev.
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
  return {
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    displayName: user.displayName || user.username,
    imageUrl: user.imageUrl || ""
  };
});
const logout_createServerFn_handler = createServerRpc({
  id: "4d545b73b4a77e4062056d437290e3421f05fd54d0aa33fb896c27fcf34b7d8b",
  name: "logout",
  filename: "src/server/tracker.functions.ts"
}, (opts) => logout.__executeServer(opts));
const logout = createServerFn({
  method: "POST"
}).handler(logout_createServerFn_handler, async () => {
  deleteCookie$1(SESSION_COOKIE, {
    path: "/"
  });
  return {
    success: true
  };
});
const getCurrentUser_createServerFn_handler = createServerRpc({
  id: "57bcc599080126d1984bbf90c8ab8281dfba97cc078f69549b15677f0572268b",
  name: "getCurrentUser",
  filename: "src/server/tracker.functions.ts"
}, (opts) => getCurrentUser.__executeServer(opts));
const getCurrentUser = createServerFn({
  method: "GET"
}).handler(getCurrentUser_createServerFn_handler, async () => {
  await ensureDefaultUsers();
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) return null;
  const [user] = await db.select().from(users).where(eq(users.id, sessionUser.userId)).limit(1);
  if (!user) return null;
  return {
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    displayName: user.displayName || user.username,
    imageUrl: user.imageUrl || ""
  };
});
const subscribeToNotifications_createServerFn_handler = createServerRpc({
  id: "ed78c7cd0b6567e2294517db25039af918c1d17e36b17106e6534e82b240d37a",
  name: "subscribeToNotifications",
  filename: "src/server/tracker.functions.ts"
}, (opts) => subscribeToNotifications.__executeServer(opts));
const subscribeToNotifications = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  subscription: z.object({
    endpoint: z.url().refine((value) => value.startsWith("https://"), "HTTPS required"),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1)
    })
  })
})).handler(subscribeToNotifications_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const values = {
    userId: user.userId,
    endpoint: data.subscription.endpoint,
    p256dh: data.subscription.keys.p256dh,
    auth: data.subscription.keys.auth
  };
  await db.insert(notificationSubscriptions).values(values).onConflictDoUpdate({
    target: notificationSubscriptions.endpoint,
    set: {
      ...values,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    success: true
  };
});
const updateUserProfile_createServerFn_handler = createServerRpc({
  id: "afdfc59177bc80b4fadfb8f3b10e175acfcc723cf8b562e6fcda70d4c4491998",
  name: "updateUserProfile",
  filename: "src/server/tracker.functions.ts"
}, (opts) => updateUserProfile.__executeServer(opts));
const updateUserProfile = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  displayName: z.string().optional(),
  imageUrl: z.string().url().optional(),
  password: z.string().min(6).optional(),
  confirmPassword: z.string().optional()
})).handler(updateUserProfile_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (data.password && data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  const updates = {
    displayName: data.displayName || void 0,
    imageUrl: data.imageUrl || void 0
  };
  if (data.password) {
    updates.passwordHash = hashPassword(data.password);
  }
  const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, user.userId)).returning();
  if (!updatedUser) {
    throw new Error("User not found");
  }
  return {
    userId: updatedUser.id,
    username: updatedUser.username,
    isAdmin: updatedUser.isAdmin,
    displayName: updatedUser.displayName || updatedUser.username,
    imageUrl: updatedUser.imageUrl || ""
  };
});
const register_createServerFn_handler = createServerRpc({
  id: "b30cbc3aec8d1df0a258fa883967ae62eb0495a55678748703e5cb6294fe58e9",
  name: "register",
  filename: "src/server/tracker.functions.ts"
}, (opts) => register.__executeServer(opts));
const register = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters")
})).handler(register_createServerFn_handler, async () => {
  throw new Error("Registration is disabled. Please contact an administrator to create an account.");
});
const getWorkItems_createServerFn_handler = createServerRpc({
  id: "d09ea48a367b25d4763d798d1ff02ea1d51e3b45f65bb46379abca584b24dca3",
  name: "getWorkItems",
  filename: "src/server/tracker.functions.ts"
}, (opts) => getWorkItems.__executeServer(opts));
const getWorkItems = createServerFn({
  method: "GET"
}).handler(getWorkItems_createServerFn_handler, async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return db.select().from(workItems).orderBy(desc(workItems.updatedAt));
});
const createWorkItem_createServerFn_handler = createServerRpc({
  id: "58a5ff6bb2bf5bd6c3203985a1983902f8c4af025f97159d785ca0ead57918d9",
  name: "createWorkItem",
  filename: "src/server/tracker.functions.ts"
}, (opts) => createWorkItem.__executeServer(opts));
const createWorkItem = createServerFn({
  method: "POST"
}).inputValidator(z.object({
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
  what3words: z.string().optional()
})).handler(createWorkItem_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const [newItem] = await db.insert(workItems).values({
    customerName: data.customerName,
    customerPhone: data.customerPhone || "",
    site: data.site,
    status: data.status,
    notes: data.notes || "",
    samples: data.samples || "",
    googleDriveUrl: data.googleDriveUrl || "",
    assignedTo: data.assignedTo,
    measuredBy: data.measuredBy || "",
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
    what3words: data.what3words || ""
  }).returning();
  await notifyAllSubscribers("Job added", `${await actorName(user)} added ${data.customerName}.`, user.userId);
  return newItem;
});
const updateWorkItem_createServerFn_handler = createServerRpc({
  id: "9fdde814ef11a7e1d5c5809799057a541c59510ed38d22ca7a938c9c50230110",
  name: "updateWorkItem",
  filename: "src/server/tracker.functions.ts"
}, (opts) => updateWorkItem.__executeServer(opts));
const updateWorkItem = createServerFn({
  method: "POST"
}).inputValidator(z.object({
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
  what3words: z.string().optional()
})).handler(updateWorkItem_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const {
    id,
    ...values
  } = data;
  const [existing] = await db.select().from(workItems).where(eq(workItems.id, id));
  let customerContacted = values.customerContacted ?? existing?.customerContacted ?? false;
  if (existing && (existing.fittingDate || "") !== (values.fittingDate || "") && existing.customerContacted && customerContacted) {
    customerContacted = false;
  }
  const [updatedItem] = await db.update(workItems).set({
    ...values,
    customerContacted,
    whereNeedsMeasuring: values.whereNeedsMeasuring || "",
    customerPhone: values.customerPhone || "",
    notes: values.notes || "",
    samples: values.samples || "",
    googleDriveUrl: values.googleDriveUrl || "",
    measuredBy: values.measuredBy || "",
    measuredBooked: values.measuredBooked || "",
    fittingDate: values.fittingDate || "",
    carpetOrderedDate: values.carpetOrderedDate || "",
    carpetCostPerSqm: values.carpetCostPerSqm || "",
    what3words: values.what3words || "",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(workItems.id, id)).returning();
  if (!updatedItem) {
    throw new Error("Job not found");
  }
  await notifyAllSubscribers("Job updated", `${await actorName(user)} updated ${data.customerName}.`, user.userId);
  return updatedItem;
});
const deleteWorkItem_createServerFn_handler = createServerRpc({
  id: "331aa7bdbc2f9fe4698ac075391dc430da36aafb879eb895c428034aacb645e1",
  name: "deleteWorkItem",
  filename: "src/server/tracker.functions.ts"
}, (opts) => deleteWorkItem.__executeServer(opts));
const deleteWorkItem = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(deleteWorkItem_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const [itemToDelete] = await db.select().from(workItems).where(eq(workItems.id, data.id)).limit(1);
  await db.delete(workItems).where(eq(workItems.id, data.id));
  if (itemToDelete) {
    await notifyAllSubscribers("Job removed", `${await actorName(user)} removed ${itemToDelete.customerName}.`, user.userId);
  }
  return {
    success: true
  };
});
const getCalendarEvents_createServerFn_handler = createServerRpc({
  id: "cd50deabb5a5afd740f30930a622276d1f68d10003a6f942f6594448755f9ef9",
  name: "getCalendarEvents",
  filename: "src/server/tracker.functions.ts"
}, (opts) => getCalendarEvents.__executeServer(opts));
const getCalendarEvents = createServerFn({
  method: "GET"
}).handler(getCalendarEvents_createServerFn_handler, async () => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return db.select().from(calendarEvents).orderBy(desc(calendarEvents.date));
});
const createCalendarEvent_createServerFn_handler = createServerRpc({
  id: "b56afba7f9502e31800ffa222c52f89b686cbe39b00283383bebd1fe87203d12",
  name: "createCalendarEvent",
  filename: "src/server/tracker.functions.ts"
}, (opts) => createCalendarEvent.__executeServer(opts));
const createCalendarEvent = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  eventType: z.string().default("general"),
  assignedTo: z.string().optional()
})).handler(createCalendarEvent_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const [newEvent] = await db.insert(calendarEvents).values({
    title: data.title,
    date: data.date,
    endDate: data.endDate || "",
    notes: data.notes || "",
    eventType: data.eventType || "general",
    assignedTo: data.assignedTo || ""
  }).returning();
  await notifyAllSubscribers("Calendar update", `${await actorName(user)} added ${data.title} to the calendar.`, user.userId);
  return newEvent;
});
const updateCalendarEvent_createServerFn_handler = createServerRpc({
  id: "5199314997844e24679d2cef393c9f0a3559b3e56a7b9040dce5669ca1c05fc4",
  name: "updateCalendarEvent",
  filename: "src/server/tracker.functions.ts"
}, (opts) => updateCalendarEvent.__executeServer(opts));
const updateCalendarEvent = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  eventType: z.string().default("general"),
  assignedTo: z.string().optional()
})).handler(updateCalendarEvent_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const {
    id,
    ...values
  } = data;
  const [updatedEvent] = await db.update(calendarEvents).set({
    ...values,
    endDate: values.endDate || "",
    notes: values.notes || "",
    eventType: values.eventType || "general",
    assignedTo: values.assignedTo || "",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(calendarEvents.id, id)).returning();
  if (!updatedEvent) {
    throw new Error("Calendar event not found");
  }
  await notifyAllSubscribers("Calendar update", `${await actorName(user)} updated ${data.title}.`, user.userId);
  return updatedEvent;
});
const deleteCalendarEvent_createServerFn_handler = createServerRpc({
  id: "93480159426157c83a7a376c42a7ac5acc91e9a4cd945f4209e598b4d975a35a",
  name: "deleteCalendarEvent",
  filename: "src/server/tracker.functions.ts"
}, (opts) => deleteCalendarEvent.__executeServer(opts));
const deleteCalendarEvent = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(deleteCalendarEvent_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const [eventToDelete] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, data.id)).limit(1);
  await db.delete(calendarEvents).where(eq(calendarEvents.id, data.id));
  if (eventToDelete) {
    await notifyAllSubscribers("Calendar update", `${await actorName(user)} removed ${eventToDelete.title} from the calendar.`, user.userId);
  }
  return {
    success: true
  };
});
const getNotificationKey_createServerFn_handler = createServerRpc({
  id: "a4c80a4dc632ad35a104f7f34ef8c01bb2860bbfbf76b2b59b6f73f7d5c11195",
  name: "getNotificationKey",
  filename: "src/server/tracker.functions.ts"
}, (opts) => getNotificationKey.__executeServer(opts));
const getNotificationKey = createServerFn({
  method: "GET"
}).handler(getNotificationKey_createServerFn_handler, async () => {
  if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
  return {
    publicKey: (await getPushKeys()).publicKey
  };
});
const unsubscribeFromNotifications_createServerFn_handler = createServerRpc({
  id: "28375f9ff8842164d09ec6c116c08488760eb2c9d33444ba5c96b02622a1354e",
  name: "unsubscribeFromNotifications",
  filename: "src/server/tracker.functions.ts"
}, (opts) => unsubscribeFromNotifications.__executeServer(opts));
const unsubscribeFromNotifications = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  endpoint: z.string()
})).handler(unsubscribeFromNotifications_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  await db.delete(notificationSubscriptions).where(and(eq(notificationSubscriptions.userId, user.userId), eq(notificationSubscriptions.endpoint, data.endpoint)));
  return {
    success: true
  };
});
const testNotification_createServerFn_handler = createServerRpc({
  id: "b295f2abbacff488c5434e12faccb88e6c2e95820dbe4c754bc07f80a45b7380",
  name: "testNotification",
  filename: "src/server/tracker.functions.ts"
}, (opts) => testNotification.__executeServer(opts));
const testNotification = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  endpoint: z.string()
})).handler(testNotification_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  const [subscription] = await db.select().from(notificationSubscriptions).where(and(eq(notificationSubscriptions.userId, user.userId), eq(notificationSubscriptions.endpoint, data.endpoint)));
  if (!subscription || !await sendPush(subscription, "Notifications are ready", "You’ll receive job changes and install and measuring reminders on this device.", "test")) throw new Error("Unable to send test notification. Try enabling notifications again.");
  return {
    success: true
  };
});
const getCalendarFeedKey_createServerFn_handler = createServerRpc({
  id: "d993e66873ab05c95e49929bed4cbf40401df1bac7aa72c846d8ca9c13935d69",
  name: "getCalendarFeedKey",
  filename: "src/server/tracker.functions.ts"
}, (opts) => getCalendarFeedKey.__executeServer(opts));
const getCalendarFeedKey = createServerFn({
  method: "GET"
}).handler(getCalendarFeedKey_createServerFn_handler, async () => {
  if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
  return {
    key: await calendarFeedToken()
  };
});
const markCustomerContacted_createServerFn_handler = createServerRpc({
  id: "4ad28db1d0bfa2ade8d47a12e029198a902c8f4a9a16fdd7c295c4f0e2933804",
  name: "markCustomerContacted",
  filename: "src/server/tracker.functions.ts"
}, (opts) => markCustomerContacted.__executeServer(opts));
const markCustomerContacted = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(markCustomerContacted_createServerFn_handler, async ({
  data
}) => {
  if (!await getAuthenticatedUser()) throw new Error("Unauthorized");
  await db.update(workItems).set({
    customerContacted: true,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(workItems.id, data.id));
  return {
    success: true
  };
});
const setWorkItemStatus_createServerFn_handler = createServerRpc({
  id: "ce47509f1d7ac8104908b2bd2f49e47820472008682a800041799263e6be7340",
  name: "setWorkItemStatus",
  filename: "src/server/tracker.functions.ts"
}, (opts) => setWorkItemStatus.__executeServer(opts));
const setWorkItemStatus = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number(),
  status: z.enum(JOB_STAGES)
})).handler(setWorkItemStatus_createServerFn_handler, async ({
  data
}) => {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  const [updated] = await db.update(workItems).set({
    status: data.status,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(workItems.id, data.id)).returning();
  if (!updated) throw new Error("Job not found");
  await notifyAllSubscribers("Job updated", `${await actorName(user)} moved ${updated.customerName} to ${data.status}.`, user.userId);
  return updated;
});
export {
  createCalendarEvent_createServerFn_handler,
  createWorkItem_createServerFn_handler,
  deleteCalendarEvent_createServerFn_handler,
  deleteWorkItem_createServerFn_handler,
  getCalendarEvents_createServerFn_handler,
  getCalendarFeedKey_createServerFn_handler,
  getCurrentUser_createServerFn_handler,
  getNotificationKey_createServerFn_handler,
  getWorkItems_createServerFn_handler,
  login_createServerFn_handler,
  logout_createServerFn_handler,
  markCustomerContacted_createServerFn_handler,
  register_createServerFn_handler,
  setWorkItemStatus_createServerFn_handler,
  subscribeToNotifications_createServerFn_handler,
  testNotification_createServerFn_handler,
  unsubscribeFromNotifications_createServerFn_handler,
  updateCalendarEvent_createServerFn_handler,
  updateUserProfile_createServerFn_handler,
  updateWorkItem_createServerFn_handler
};
