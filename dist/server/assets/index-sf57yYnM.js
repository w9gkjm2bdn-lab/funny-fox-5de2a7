import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ExternalLink, Check, Download, ChevronLeft, ChevronRight, Rss, Filter, User, Plus, Clock, Edit2, Trash2, Smartphone, Copy, Bell, Database, Key, AlertCircle, LogOut, Briefcase, CheckCircle2, Search, Clipboard, X, FolderOpen, Archive, Ruler, Hammer, MapPin, Phone, MessageCircle, MessageSquare, Edit } from "lucide-react";
import { T as TSS_SERVER_FUNCTION, a as getServerFnById, c as createServerFn } from "../server.js";
import { z } from "zod";
import { J as JOB_STAGES, s as stageStyle, n as nextStage } from "./job-stages-CoP1oJna.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const login = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
})).handler(createSsrRpc("da43996aa46c6f804e0b0aa60b870e698702fb6a24546d59811dcd5dc1f7978d"));
const logout = createServerFn({
  method: "POST"
}).handler(createSsrRpc("4d545b73b4a77e4062056d437290e3421f05fd54d0aa33fb896c27fcf34b7d8b"));
const getCurrentUser = createServerFn({
  method: "GET"
}).handler(createSsrRpc("57bcc599080126d1984bbf90c8ab8281dfba97cc078f69549b15677f0572268b"));
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
})).handler(createSsrRpc("ed78c7cd0b6567e2294517db25039af918c1d17e36b17106e6534e82b240d37a"));
const updateUserProfile = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  displayName: z.string().optional(),
  imageUrl: z.string().url().optional(),
  password: z.string().min(6).optional(),
  confirmPassword: z.string().optional()
})).handler(createSsrRpc("afdfc59177bc80b4fadfb8f3b10e175acfcc723cf8b562e6fcda70d4c4491998"));
createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters")
})).handler(createSsrRpc("b30cbc3aec8d1df0a258fa883967ae62eb0495a55678748703e5cb6294fe58e9"));
const getWorkItems = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d09ea48a367b25d4763d798d1ff02ea1d51e3b45f65bb46379abca584b24dca3"));
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
})).handler(createSsrRpc("58a5ff6bb2bf5bd6c3203985a1983902f8c4af025f97159d785ca0ead57918d9"));
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
})).handler(createSsrRpc("9fdde814ef11a7e1d5c5809799057a541c59510ed38d22ca7a938c9c50230110"));
const deleteWorkItem = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(createSsrRpc("331aa7bdbc2f9fe4698ac075391dc430da36aafb879eb895c428034aacb645e1"));
const getCalendarEvents = createServerFn({
  method: "GET"
}).handler(createSsrRpc("cd50deabb5a5afd740f30930a622276d1f68d10003a6f942f6594448755f9ef9"));
const createCalendarEvent = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  eventType: z.string().default("general"),
  assignedTo: z.string().optional()
})).handler(createSsrRpc("b56afba7f9502e31800ffa222c52f89b686cbe39b00283383bebd1fe87203d12"));
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
})).handler(createSsrRpc("5199314997844e24679d2cef393c9f0a3559b3e56a7b9040dce5669ca1c05fc4"));
const deleteCalendarEvent = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(createSsrRpc("93480159426157c83a7a376c42a7ac5acc91e9a4cd945f4209e598b4d975a35a"));
const getNotificationKey = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a4c80a4dc632ad35a104f7f34ef8c01bb2860bbfbf76b2b59b6f73f7d5c11195"));
const unsubscribeFromNotifications = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  endpoint: z.string()
})).handler(createSsrRpc("28375f9ff8842164d09ec6c116c08488760eb2c9d33444ba5c96b02622a1354e"));
const testNotification = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  endpoint: z.string()
})).handler(createSsrRpc("b295f2abbacff488c5434e12faccb88e6c2e95820dbe4c754bc07f80a45b7380"));
const getCalendarFeedKey = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d993e66873ab05c95e49929bed4cbf40401df1bac7aa72c846d8ca9c13935d69"));
const markCustomerContacted = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number()
})).handler(createSsrRpc("4ad28db1d0bfa2ade8d47a12e029198a902c8f4a9a16fdd7c295c4f0e2933804"));
const setWorkItemStatus = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.number(),
  status: z.enum(JOB_STAGES)
})).handler(createSsrRpc("ce47509f1d7ac8104908b2bd2f49e47820472008682a800041799263e6be7340"));
function pad(n) {
  return String(n).padStart(2, "0");
}
function toUtcBasic(date) {
  if (!date) return null;
  return date.getUTCFullYear().toString() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + "T" + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + "Z";
}
function escapeICSText(s) {
  return (s || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function parseDateTimeString(raw) {
  if (!raw || !raw.trim()) return { dateStr: "", hasTime: false };
  const trimmed = raw.trim();
  if (trimmed.includes("T")) {
    const [d, t] = trimmed.split("T");
    const timeOnly = t ? t.slice(0, 5) : "";
    return { dateStr: d, timeStr: timeOnly || void 0, hasTime: Boolean(timeOnly) };
  }
  if (trimmed.includes(" ")) {
    const [d, t] = trimmed.split(" ");
    if (t && t.includes(":")) {
      const timeOnly = t.slice(0, 5);
      return { dateStr: d, timeStr: timeOnly, hasTime: true };
    }
  }
  return { dateStr: trimmed, hasTime: false };
}
function formatDateTimeDisplay(raw, defaultDurationHours = 1) {
  const parsed = parseDateTimeString(raw);
  if (!parsed.dateStr) return "";
  const [y, m, d] = parsed.dateStr.split("-").map(Number);
  if (!y || !m || !d) return parsed.dateStr;
  const dateObj = new Date(y, m - 1, d);
  const formattedDate = dateObj.toLocaleDateString(void 0, { day: "numeric", month: "short", year: "numeric" });
  if (parsed.hasTime && parsed.timeStr) {
    const [h, min] = parsed.timeStr.split(":").map(Number);
    const endH = (h + defaultDurationHours) % 24;
    const endTimeStr = `${pad(endH)}:${pad(min)}`;
    return `${formattedDate} • ${parsed.timeStr} – ${endTimeStr} (${defaultDurationHours} hr)`;
  }
  return formattedDate;
}
function generateICSFeed(calName, events) {
  const now = /* @__PURE__ */ new Date();
  const dtstamp = toUtcBasic(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Work Tracker//TM Flooring Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICSText(calName)}`,
    "X-WR-TIMEZONE:UTC",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H"
  ];
  for (const ev of events) {
    if (!ev.dateStr) continue;
    const parsedStart = parseDateTimeString(ev.dateStr);
    if (!parsedStart.dateStr) continue;
    const [y, m, d] = parsedStart.dateStr.split("-").map(Number);
    if (!y || !m || !d) continue;
    const duration = ev.durationHours || 1;
    let startH = 9, startM = 0;
    if (parsedStart.hasTime && parsedStart.timeStr) {
      const [h, min] = parsedStart.timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(min)) {
        startH = h;
        startM = min;
      }
    }
    const startDate = new Date(Date.UTC(y, m - 1, d, startH, startM, 0));
    let endDate;
    if (ev.endDateStr) {
      const parsedEnd = parseDateTimeString(ev.endDateStr);
      const [ey, em, ed] = parsedEnd.dateStr.split("-").map(Number);
      let endH = 17, endM = 0;
      if (parsedEnd.hasTime && parsedEnd.timeStr) {
        const [h, min] = parsedEnd.timeStr.split(":").map(Number);
        if (!isNaN(h) && !isNaN(min)) {
          endH = h;
          endM = min;
        }
      }
      endDate = new Date(Date.UTC(ey || y, em ? em - 1 : m - 1, ed || d, endH, endM, 0));
    } else {
      endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1e3);
    }
    const dtstart = toUtcBasic(startDate);
    const dtend = toUtcBasic(endDate);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICSText(ev.title)}`);
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeICSText(ev.description)}`);
    }
    if (ev.location) {
      lines.push(`LOCATION:${escapeICSText(ev.location)}`);
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function makeGoogleCalendarUrl(opts) {
  const parsedStart = parseDateTimeString(opts.dateStr);
  if (!parsedStart.dateStr) return "";
  const [y, m, d] = parsedStart.dateStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  const duration = opts.durationHours || 1;
  let startH = 9, startM = 0;
  if (parsedStart.hasTime && parsedStart.timeStr) {
    const [h, min] = parsedStart.timeStr.split(":").map(Number);
    if (!isNaN(h) && !isNaN(min)) {
      startH = h;
      startM = min;
    }
  }
  const startDate = new Date(Date.UTC(y, m - 1, d, startH, startM, 0));
  let endDate;
  if (opts.endDateStr) {
    const parsedEnd = parseDateTimeString(opts.endDateStr);
    const [ey, em, ed] = parsedEnd.dateStr.split("-").map(Number);
    let endH = 17, endM = 0;
    if (parsedEnd.hasTime && parsedEnd.timeStr) {
      const [h, min] = parsedEnd.timeStr.split(":").map(Number);
      if (!isNaN(h) && !isNaN(min)) {
        endH = h;
        endM = min;
      }
    }
    endDate = new Date(Date.UTC(ey || y, em ? em - 1 : m - 1, ed || d, endH, endM, 0));
  } else {
    endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1e3);
  }
  const startFormatted = toUtcBasic(startDate)?.replace(/[-:]/g, "") || "";
  const endFormatted = toUtcBasic(endDate)?.replace(/[-:]/g, "") || "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details || "",
    location: opts.location || "",
    dates: `${startFormatted}/${endFormatted}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function downloadICSFile(filename, event) {
  const ics = generateICSFeed("Work Tracker Event", [event]);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function AddToCalendarButton({
  title,
  dateStr,
  endDateStr,
  location,
  details,
  uid,
  compact = true,
  buttonLabel = "Add to Calendar"
}) {
  const [open, setOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  const handleDownloadICS = () => {
    downloadICSFile(`event-${dateStr}.ics`, {
      uid,
      title,
      description: details,
      location,
      dateStr,
      endDateStr
    });
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setOpen(false);
    }, 1500);
  };
  const googleUrl = makeGoogleCalendarUrl({
    title,
    details,
    location,
    dateStr,
    endDateStr
  });
  return /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", ref: dropdownRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen(!open),
        className: `inline-flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer font-medium ${compact ? "p-1.5 text-xs text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700" : "px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600 shadow-sm"}`,
        title: "Add to personal or shared calendar",
        children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }),
          !compact && /* @__PURE__ */ jsx("span", { children: buttonLabel }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3 text-slate-500 shrink-0" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-1.5 sm:mb-0 sm:mt-1.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in", children: [
      /* @__PURE__ */ jsx("p", { className: "px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80", children: "Export Event" }),
      googleUrl && /* @__PURE__ */ jsxs(
        "a",
        {
          href: googleUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: () => setOpen(false),
          className: "flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-blue-400" }),
              /* @__PURE__ */ jsx("span", { children: "Google Calendar" })
            ] }),
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 text-slate-500 group-hover:text-slate-300" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleDownloadICS,
          className: "w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group text-left",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
              /* @__PURE__ */ jsx("span", { children: "Apple / Phone (.ics)" })
            ] }),
            downloaded ? /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Download, { className: "w-3 h-3 text-slate-500 group-hover:text-slate-300" })
          ]
        }
      )
    ] })
  ] });
}
function WorkCalendarModal({
  workItems,
  manualEvents,
  onOpenJob,
  onAddManualEvent,
  onEditManualEvent,
  onDeleteManualEvent
}) {
  const [currentDate, setCurrentDate] = useState(() => /* @__PURE__ */ new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = /* @__PURE__ */ new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [filterType, setFilterType] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copiedFeedUrl, setCopiedFeedUrl] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const unifiedEvents = useMemo(() => {
    const events = [];
    workItems.forEach((job) => {
      if (job.status === "Completed") return;
      if (job.measuredBooked && job.measuredBooked.trim()) {
        const d = job.measuredBooked.trim();
        const parsed = parseDateTimeString(d);
        events.push({
          uniqueKey: `job-measure-${job.id}-${d}`,
          id: job.id,
          type: "job-measure",
          title: `📏 Measure: ${job.customerName}`,
          subtitle: job.site,
          rawDateStr: d,
          dayDate: parsed.dateStr,
          timeStr: parsed.timeStr,
          hasTime: parsed.hasTime,
          color: "amber",
          badgeBg: "bg-amber-500/15",
          badgeText: "text-amber-300",
          borderColor: "border-amber-500/30",
          dotColor: "bg-amber-400",
          assignedTo: job.measuredBy || job.assignedTo,
          rawJob: job
        });
      }
      if (job.fittingDate && job.fittingDate.trim()) {
        const fittingList = job.fittingDate.split(",").map((s) => s.trim()).filter(Boolean);
        fittingList.forEach((fitDate, idx) => {
          const parsed = parseDateTimeString(fitDate);
          events.push({
            uniqueKey: `job-fitting-${job.id}-${fitDate}-${idx}`,
            id: job.id,
            type: "job-fitting",
            title: `🔨 Fitting: ${job.customerName}`,
            subtitle: job.site,
            rawDateStr: fitDate,
            dayDate: parsed.dateStr,
            timeStr: parsed.timeStr,
            hasTime: parsed.hasTime,
            color: "violet",
            badgeBg: "bg-violet-500/15",
            badgeText: "text-violet-300",
            borderColor: "border-violet-500/30",
            dotColor: "bg-violet-400",
            assignedTo: job.assignedTo,
            rawJob: job
          });
        });
      }
    });
    manualEvents.forEach((man) => {
      let color = "emerald";
      let badgeBg = "bg-emerald-500/15";
      let badgeText = "text-emerald-300";
      let borderColor = "border-emerald-500/30";
      let dotColor = "bg-emerald-400";
      if (man.eventType === "holiday") {
        color = "rose";
        badgeBg = "bg-rose-500/15";
        badgeText = "text-rose-300";
        borderColor = "border-rose-500/30";
        dotColor = "bg-rose-400";
      } else if (man.eventType === "delivery") {
        color = "sky";
        badgeBg = "bg-sky-500/15";
        badgeText = "text-sky-300";
        borderColor = "border-sky-500/30";
        dotColor = "bg-sky-400";
      } else if (man.eventType === "measure") {
        color = "amber";
        badgeBg = "bg-amber-500/15";
        badgeText = "text-amber-300";
        borderColor = "border-amber-500/30";
        dotColor = "bg-amber-400";
      } else if (man.eventType === "fitting") {
        color = "violet";
        badgeBg = "bg-violet-500/15";
        badgeText = "text-violet-300";
        borderColor = "border-violet-500/30";
        dotColor = "bg-violet-400";
      }
      const parsed = parseDateTimeString(man.date);
      events.push({
        uniqueKey: `manual-${man.id}`,
        id: man.id,
        type: "manual",
        title: man.title,
        subtitle: man.notes || void 0,
        rawDateStr: man.date,
        dayDate: parsed.dateStr,
        timeStr: parsed.timeStr,
        hasTime: parsed.hasTime,
        endDate: man.endDate || void 0,
        color,
        badgeBg,
        badgeText,
        borderColor,
        dotColor,
        assignedTo: man.assignedTo,
        rawManual: man
      });
    });
    return events;
  }, [workItems, manualEvents]);
  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((ev) => {
      if (filterType === "measures" && ev.type !== "job-measure") return false;
      if (filterType === "fittings" && ev.type !== "job-fitting") return false;
      if (filterType === "jobs" && ev.type !== "job-measure" && ev.type !== "job-fitting") return false;
      if (filterType === "manual" && ev.type !== "manual") return false;
      if (filterAssignee !== "all") {
        const assigned = (ev.assignedTo || "").toLowerCase();
        if (!assigned.includes(filterAssignee)) return false;
      }
      return true;
    });
  }, [unifiedEvents, filterType, filterAssignee]);
  const eventsByDate = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    filteredEvents.forEach((ev) => {
      if (!ev.dayDate) return;
      const list = map.get(ev.dayDate) || [];
      list.push(ev);
      map.set(ev.dayDate, list);
    });
    map.forEach((items, key) => {
      items.sort((a, b) => {
        if (a.hasTime && b.hasTime) {
          return (a.timeStr || "").localeCompare(b.timeStr || "");
        }
        if (a.hasTime) return -1;
        if (b.hasTime) return 1;
        return 0;
      });
      map.set(key, items);
    });
    return map;
  }, [filteredEvents]);
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const mondayOffset = (firstDayIndex + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false
      });
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true
      });
    }
    const remaining = (7 - days.length % 7) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false
      });
    }
    return days;
  }, [year, month]);
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const goToToday = () => {
    const now = /* @__PURE__ */ new Date();
    setCurrentDate(now);
    setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };
  const selectedDateEvents = eventsByDate.get(selectedDate) || [];
  const [feedKey, setFeedKey] = useState("");
  useEffect(() => {
    if (!showSyncModal || feedKey) return;
    getCalendarFeedKey().then((r) => setFeedKey(r.key)).catch(() => {
    });
  }, [showSyncModal, feedKey]);
  const todayStr = (() => {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const feedUrl = feedKey ? `${baseUrl}/api/calendar-feed.ics?key=${feedKey}` : "";
  const webcalUrl = feedUrl.replace(/^https?:\/\//, "webcal://");
  const copyFeedLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(feedUrl);
      setCopiedFeedUrl(true);
      setTimeout(() => setCopiedFeedUrl(false), 2e3);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between sm:justify-start gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-white tracking-tight", children: [
              monthNames[month],
              " ",
              year
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
              unifiedEvents.length,
              " scheduled item",
              unifiedEvents.length === 1 ? "" : "s",
              " across jobs & calendar"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 ml-0 sm:ml-4 bg-slate-950 p-1 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: prevMonth,
              className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer",
              title: "Previous Month",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: goToToday,
              className: "px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer",
              children: "Today"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: nextMonth,
              className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer",
              title: "Next Month",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowSyncModal(true),
            className: "flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm",
            title: "Sync live calendar with iPhone / Android / Google Calendar",
            children: [
              /* @__PURE__ */ jsx(Rss, { className: "w-3.5 h-3.5 text-emerald-400" }),
              /* @__PURE__ */ jsx("span", { children: "Sync Phone Calendar" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              className: "appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Events" }),
                /* @__PURE__ */ jsx("option", { value: "measures", children: "📏 Measures Only" }),
                /* @__PURE__ */ jsx("option", { value: "fittings", children: "🔨 Fittings Only" }),
                /* @__PURE__ */ jsx("option", { value: "jobs", children: "All Job Dates" }),
                /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual Entries Only" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Filter, { className: "w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filterAssignee,
              onChange: (e) => setFilterAssignee(e.target.value),
              className: "appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "Everyone" }),
                /* @__PURE__ */ jsx("option", { value: "tom", children: "Tom" }),
                /* @__PURE__ */ jsx("option", { value: "chris", children: "Chris" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onAddManualEvent(selectedDate),
            className: "flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer shrink-0 ml-auto sm:ml-0",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Add Entry" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center", children: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-400 py-1", children: dayName }, dayName)) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5 sm:gap-2", children: calendarDays.map(({ dayNum, dateStr, isCurrentMonth }) => {
          const dayEvents = eventsByDate.get(dateStr) || [];
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => setSelectedDate(dateStr),
              className: `min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none relative ${isSelected ? "bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-md" : isToday ? "bg-slate-900/90 border-slate-700 hover:border-slate-600" : isCurrentMonth ? "bg-slate-950/60 border-slate-800/70 hover:bg-slate-900/60 hover:border-slate-700" : "bg-slate-950/20 border-slate-900/50 opacity-40 hover:opacity-75"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${isToday ? "bg-emerald-500 text-white" : isSelected ? "text-emerald-400" : isCurrentMonth ? "text-slate-200" : "text-slate-500"}`,
                      children: dayNum
                    }
                  ),
                  dayEvents.length > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700", children: dayEvents.length })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-1 overflow-hidden", children: [
                  dayEvents.slice(0, 2).map((ev) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `text-xs leading-tight font-medium px-1.5 py-0.5 rounded truncate border ${ev.badgeBg} ${ev.badgeText} ${ev.borderColor}`,
                      title: `${ev.title} ${ev.timeStr ? `at ${ev.timeStr}` : ""} ${ev.subtitle ? `(${ev.subtitle})` : ""}`,
                      children: [
                        ev.timeStr ? `${ev.timeStr} ` : "",
                        ev.title
                      ]
                    },
                    ev.uniqueKey
                  )),
                  dayEvents.length > 2 && /* @__PURE__ */ jsxs("div", { className: "text-[9px] font-semibold text-slate-400 pl-1", children: [
                    "+",
                    dayEvents.length - 2,
                    " more"
                  ] })
                ] })
              ]
            },
            dateStr
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-400 uppercase tracking-wider", children: selectedDate === todayStr ? "Today’s Schedule" : "Selected Date" }),
              /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-white mt-0.5", children: (/* @__PURE__ */ new Date(selectedDate + "T00:00:00")).toLocaleDateString(void 0, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric"
              }) })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onAddManualEvent(selectedDate),
                className: "p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer",
                title: "Add event for this date",
                children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
              }
            )
          ] }),
          selectedDateEvents.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-12 text-center text-slate-500 space-y-2", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-8 h-8 mx-auto opacity-40 text-slate-400" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "No events scheduled for this day" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => onAddManualEvent(selectedDate),
                className: "inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer pt-1",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  "Add an entry or reminder"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[480px] overflow-y-auto pr-1", children: selectedDateEvents.map((ev) => {
            return /* @__PURE__ */ jsx(
              "div",
              {
                className: `p-3.5 rounded-xl border ${ev.badgeBg} ${ev.borderColor} bg-slate-950/70 transition-all hover:bg-slate-950`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${ev.dotColor} shrink-0` }),
                      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-white leading-snug truncate", children: ev.title })
                    ] }),
                    ev.hasTime && ev.timeStr ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold text-emerald-400 pl-4", children: [
                      /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 shrink-0" }),
                      /* @__PURE__ */ jsx("span", { children: formatDateTimeDisplay(ev.rawDateStr, 1).split("•")[1]?.trim() || `${ev.timeStr} (1 hr)` })
                    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-400 pl-4", children: [
                      /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 shrink-0" }),
                      /* @__PURE__ */ jsx("span", { children: "All-day slot (1 hr default)" })
                    ] }),
                    ev.subtitle && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-300 pl-4 truncate", children: ev.subtitle }),
                    ev.assignedTo && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-400 pl-4", children: [
                      /* @__PURE__ */ jsx(User, { className: "w-3 h-3 text-slate-400" }),
                      /* @__PURE__ */ jsx("span", { className: "capitalize", children: ev.assignedTo })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
                    /* @__PURE__ */ jsx(
                      AddToCalendarButton,
                      {
                        uid: ev.uniqueKey,
                        title: ev.title,
                        dateStr: ev.rawDateStr,
                        endDateStr: ev.endDate,
                        location: ev.subtitle,
                        details: ev.type !== "manual" && ev.rawJob ? `Required: ${ev.rawJob.whatsRequired}
Measuring: ${ev.rawJob.whereNeedsMeasuring}` : ev.subtitle,
                        compact: true
                      }
                    ),
                    ev.type !== "manual" && ev.rawJob && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => onOpenJob(ev.rawJob),
                        className: "p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer",
                        title: "Open and edit Job Card",
                        children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5 text-emerald-400" })
                      }
                    ),
                    ev.type === "manual" && ev.rawManual && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => onEditManualEvent(ev.rawManual),
                          className: "p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer",
                          title: "Edit entry",
                          children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" })
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => onDeleteManualEvent(ev.rawManual.id),
                          className: "p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer",
                          title: "Delete entry",
                          children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                        }
                      )
                    ] })
                  ] })
                ] })
              },
              ev.uniqueKey
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-amber-400" }),
            /* @__PURE__ */ jsx("span", { children: "Job Measure Date" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-violet-400" }),
            /* @__PURE__ */ jsx("span", { children: "Job Fitting Date" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
            /* @__PURE__ */ jsx("span", { children: "General Note / Task" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-rose-400" }),
            /* @__PURE__ */ jsx("span", { children: "Holiday / Off" })
          ] })
        ] })
      ] })
    ] }),
    showSyncModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: /* @__PURE__ */ jsx(Smartphone, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Sync Shared Phone Calendar" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Live automatic 2-way sync across all devices" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSyncModal(false),
            className: "text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer",
            children: "Close"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-300 leading-relaxed", children: [
        "You can subscribe to this live calendar on your ",
        /* @__PURE__ */ jsx("strong", { children: "iPhone (Apple Calendar)" }),
        ", ",
        /* @__PURE__ */ jsx("strong", { children: "Android (Google Calendar)" }),
        ", or ",
        /* @__PURE__ */ jsx("strong", { children: "Outlook" }),
        ". Whenever anyone adds or edits a measure or fitting date in the app, your phone calendar updates automatically!"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
            "Option 1: iPhone / Apple Calendar"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Tap below to auto-subscribe in Apple Calendar" })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: feedUrl ? webcalUrl : void 0,
            className: "px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer",
            children: "Subscribe on iPhone"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-blue-400" }),
          "Option 2: Google Calendar (Android / Web)"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-300 leading-relaxed", children: [
          "1. Copy the subscription link below.",
          /* @__PURE__ */ jsx("br", {}),
          "2. In Google Calendar on desktop or mobile, go to ",
          /* @__PURE__ */ jsx("em", { children: "Other calendars (+) → From URL" }),
          " and paste it."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              readOnly: true,
              value: feedUrl || "Loading your private link…",
              className: "flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono select-all focus:outline-none"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: copyFeedLink,
              className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0",
              children: [
                copiedFeedUrl ? /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: copiedFeedUrl ? "Copied" : "Copy" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-300/80 leading-relaxed", children: "This link is private — it shows customer details to anyone who has it. Only add it to your own devices." }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setShowSyncModal(false),
          className: "px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer",
          children: "Done"
        }
      ) })
    ] }) })
  ] });
}
function applicationKey(value) {
  const decoded = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, (c) => c.charCodeAt(0));
}
function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    const support = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(support);
    if (!support) {
      setBusy(false);
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await save(subscription);
      if (active) setEnabled(!!subscription);
    }).catch(() => {
      if (active) setMessage("Unable to check notifications. Please try again.");
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => {
      active = false;
    };
  }, []);
  async function save(subscription) {
    const json = subscription.toJSON();
    await subscribeToNotifications({ data: { subscription: { endpoint: subscription.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } } } });
  }
  async function toggle() {
    setBusy(true);
    setMessage("");
    try {
      if (!enabled && await Notification.requestPermission() !== "granted") {
        throw new Error("Notifications are blocked. Allow them in your browser settings. On iPhone or iPad, add this site to your Home Screen and open it there.");
      }
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (enabled) {
        if (subscription) {
          await unsubscribeFromNotifications({ data: { endpoint: subscription.endpoint } });
          await subscription.unsubscribe();
        }
        setEnabled(false);
      } else {
        const { publicKey } = await getNotificationKey();
        subscription ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(publicKey) });
        await save(subscription);
        setEnabled(true);
        setMessage("Notifications enabled on this device.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update notifications.");
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    setBusy(true);
    setMessage("");
    try {
      const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (!subscription) throw new Error("Enable notifications first.");
      await testNotification({ data: { endpoint: subscription.endpoint } });
      setMessage("Test notification sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send test.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/50 p-5", "aria-label": "Push notifications", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5 text-emerald-400 shrink-0 mt-1" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-semibold text-white", children: [
            "Job notifications ",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400 ml-2", children: enabled ? "On for this device" : "Off for this device" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mt-1", children: "New jobs and changes, plus install, measuring and delivery reminders at 6 pm the day before and 7 am on the day (UK time)." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 shrink-0", children: [
        enabled && /* @__PURE__ */ jsx("button", { disabled: busy, onClick: test, className: "px-3 py-2 rounded-lg border border-slate-700 text-sm disabled:opacity-50", children: "Send test" }),
        /* @__PURE__ */ jsx("button", { disabled: busy || !supported, onClick: toggle, className: "px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-sm font-semibold disabled:opacity-50", children: busy ? "Checking…" : enabled ? "Turn off" : "Enable notifications" })
      ] })
    ] }),
    !supported && !busy && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-amber-300", children: "Push notifications need a supported browser. On iPhone or iPad, add this site to your Home Screen, then open it there." }),
    message && /* @__PURE__ */ jsx("p", { role: "status", className: "mt-3 text-sm text-slate-300", children: message })
  ] });
}
function upcoming(raw, today) {
  return (raw || "").split(",").map((s) => s.trim()).filter((s) => /^\d{4}-\d{2}-\d{2}/.test(s) && s.slice(0, 10) >= today);
}
function nextAppointment(measuredBooked, fittingDate, today) {
  const all = [
    ...upcoming(measuredBooked, today).map((value) => ({ kind: "Measure", value })),
    ...upcoming(fittingDate, today).map((value) => ({ kind: "Fitting", value }))
  ];
  all.sort((a, b) => a.value.localeCompare(b.value));
  return all[0] ?? null;
}
function formatAppointmentDate(value, today) {
  const date = value.slice(0, 10);
  const time = /T(\d{2}:\d{2})/.exec(value)?.[1];
  const d = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
  const t = /* @__PURE__ */ new Date(`${today}T12:00:00Z`);
  const days = Math.round((d.getTime() - t.getTime()) / 864e5);
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return time ? `${label} · ${time}` : label;
}
const TITLES = /* @__PURE__ */ new Set(["mr", "mrs", "ms", "miss", "mx", "dr"]);
function greetingName(customerName) {
  const words = customerName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (TITLES.has(words[0].replace(/\.$/, "").toLowerCase()) && words.length > 1) {
    return `${words[0]} ${words[words.length - 1]}`;
  }
  return words[0];
}
function nextFittingDate(fittingDate, today) {
  return (fittingDate || "").split(",").map((s) => s.trim().slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today).sort()[0] || null;
}
function ordinal(n) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${s}`;
}
function friendlyDate(date) {
  const d = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${weekday} ${ordinal(d.getUTCDate())} ${month}`;
}
function fittingMessage(customerName, date) {
  const name = greetingName(customerName);
  return `Hi${name ? ` ${name}` : ""}, just confirming your fitting on ${friendlyDate(date)}. If you have any questions before then, just let us know. Thanks`;
}
function whatsappHref(phone, text) {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
function smsHref(phone, text) {
  return `sms:${phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(text)}`;
}
function TrackerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [workItemsList, setWorkItemsList] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [formMode, setFormMode] = useState("none");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [site, setSite] = useState("");
  const [what3words, setWhat3words] = useState("");
  const [status, setStatus] = useState("Measure booked");
  const [whatsRequired, setWhatsRequired] = useState("");
  const [whereNeedsMeasuring, setWhereNeedsMeasuring] = useState("");
  const [notes, setNotes] = useState("");
  const [samples, setSamples] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [editingDriveUrl, setEditingDriveUrl] = useState(false);
  const [upliftAndDisposal, setUpliftAndDisposal] = useState(false);
  const [furniture, setFurniture] = useState(false);
  const [customerContacted, setCustomerContacted] = useState(false);
  const [assignedTo, setAssignedTo] = useState("tom");
  const [carpetOrderedDate, setCarpetOrderedDate] = useState("");
  const [carpetCostPerSqm, setCarpetCostPerSqm] = useState("");
  const [measuredBy, setMeasuredBy] = useState("");
  const [measuredBookedDate, setMeasuredBookedDate] = useState("");
  const [measuredBookedTime, setMeasuredBookedTime] = useState("");
  const [fittingSlots, setFittingSlots] = useState([{
    date: "",
    time: ""
  }]);
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState("active");
  const [calendarEventsList, setCalendarEventsList] = useState([]);
  const [calendarModalMode, setCalendarModalMode] = useState("none");
  const [selectedCalendarEventId, setSelectedCalendarEventId] = useState(null);
  const [calTitle, setCalTitle] = useState("");
  const [calDate, setCalDate] = useState("");
  const [calTime, setCalTime] = useState("");
  const [calEndDate, setCalEndDate] = useState("");
  const [calNotes, setCalNotes] = useState("");
  const [calEventType, setCalEventType] = useState("general");
  const [calAssignedTo, setCalAssignedTo] = useState("");
  const [calFormError, setCalFormError] = useState(null);
  const [calFormSubmitting, setCalFormSubmitting] = useState(false);
  useEffect(() => {
    if (formMode === "none") {
      return;
    }
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setFormMode("none");
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [formMode]);
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await Promise.all([fetchWorkItems(), fetchCalendarEvents()]);
        }
      } catch (err) {
        console.error("Failed to get current user:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);
  const fetchWorkItems = async () => {
    setItemsLoading(true);
    try {
      const data = await getWorkItems();
      const mapped = data.map((item) => ({
        ...item,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt)
      }));
      setWorkItemsList(mapped);
    } catch (err) {
      console.error("Error fetching work items:", err);
    } finally {
      setItemsLoading(false);
    }
  };
  const fetchCalendarEvents = async () => {
    try {
      const data = await getCalendarEvents();
      const mapped = data.map((ev) => ({
        ...ev,
        createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : String(ev.createdAt),
        updatedAt: ev.updatedAt instanceof Date ? ev.updatedAt.toISOString() : String(ev.updatedAt)
      }));
      setCalendarEventsList(mapped);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    }
  };
  const openAddCalendarModal = (presetDate) => {
    setSelectedCalendarEventId(null);
    setCalTitle("");
    const defaultDate = presetDate || (() => {
      const today = /* @__PURE__ */ new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    })();
    const parsed = parseDateTimeString(defaultDate);
    setCalDate(parsed.dateStr);
    setCalTime(parsed.timeStr || "");
    setCalEndDate("");
    setCalNotes("");
    setCalEventType("general");
    setCalAssignedTo("");
    setCalFormError(null);
    setCalendarModalMode("add");
  };
  const openEditCalendarModal = (event) => {
    setSelectedCalendarEventId(event.id);
    setCalTitle(event.title);
    const parsed = parseDateTimeString(event.date);
    setCalDate(parsed.dateStr);
    setCalTime(parsed.timeStr || "");
    setCalEndDate(event.endDate || "");
    setCalNotes(event.notes || "");
    setCalEventType(event.eventType || "general");
    setCalAssignedTo(event.assignedTo || "");
    setCalFormError(null);
    setCalendarModalMode("edit");
  };
  const handleCalendarFormSubmit = async (e) => {
    e.preventDefault();
    setCalFormError(null);
    if (!calTitle.trim() || !calDate.trim()) {
      setCalFormError("Title and Date are required");
      return;
    }
    const fullDate = calDate.trim() + (calTime.trim() ? `T${calTime.trim()}` : "");
    setCalFormSubmitting(true);
    try {
      if (calendarModalMode === "add") {
        await createCalendarEvent({
          data: {
            title: calTitle.trim(),
            date: fullDate,
            endDate: calEndDate.trim() || void 0,
            notes: calNotes.trim() || void 0,
            eventType: calEventType,
            assignedTo: calAssignedTo.trim() || void 0
          }
        });
      } else if (calendarModalMode === "edit" && selectedCalendarEventId) {
        await updateCalendarEvent({
          data: {
            id: selectedCalendarEventId,
            title: calTitle.trim(),
            date: fullDate,
            endDate: calEndDate.trim() || void 0,
            notes: calNotes.trim() || void 0,
            eventType: calEventType,
            assignedTo: calAssignedTo.trim() || void 0
          }
        });
      }
      setCalendarModalMode("none");
      await fetchCalendarEvents();
    } catch (err) {
      setCalFormError(err?.message || "Failed to save calendar entry");
    } finally {
      setCalFormSubmitting(false);
    }
  };
  const handleDeleteCalendarEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this calendar entry?")) return;
    try {
      await deleteCalendarEvent({
        data: {
          id
        }
      });
      await fetchCalendarEvents();
    } catch (err) {
      console.error("Delete calendar event error:", err);
      alert("Failed to delete calendar entry");
    }
  };
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!usernameInput || !passwordInput) {
      setAuthError("Please fill in all fields");
      return;
    }
    setAuthSubmitting(true);
    try {
      const loggedInUser = await login({
        data: {
          username: usernameInput,
          password: passwordInput
        }
      });
      setUser(loggedInUser);
      setUsernameInput("");
      setPasswordInput("");
      await fetchWorkItems();
    } catch (err) {
      setAuthError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };
  const handleLogout = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("/sw.js");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await unsubscribeFromNotifications({
            data: {
              endpoint: subscription.endpoint
            }
          });
          await subscription.unsubscribe();
        }
      }
      await logout();
      setUser(null);
      setWorkItemsList([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const openProfile = () => {
    if (!user) return;
    setProfileDisplayName(user.displayName || user.username);
    setProfileImageUrl(user.imageUrl || "");
    setProfilePassword("");
    setProfileConfirmPassword("");
    setProfileError(null);
    setProfileOpen(true);
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileError("Passwords must match");
      return;
    }
    setProfileSubmitting(true);
    try {
      const updatedUser = await updateUserProfile({
        data: {
          displayName: profileDisplayName,
          imageUrl: profileImageUrl,
          password: profilePassword || void 0,
          confirmPassword: profileConfirmPassword || void 0
        }
      });
      setUser(updatedUser);
      setProfileOpen(false);
      setProfilePassword("");
      setProfileConfirmPassword("");
    } catch (err) {
      setProfileError(err?.message || "Unable to save profile settings");
    } finally {
      setProfileSubmitting(false);
    }
  };
  const openAddForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setSite("");
    setWhat3words("");
    setStatus("Measure booked");
    setWhatsRequired("");
    setWhereNeedsMeasuring("");
    setNotes("");
    setSamples("");
    setGoogleDriveUrl("");
    setEditingDriveUrl(false);
    setUpliftAndDisposal(false);
    setFurniture(false);
    setCustomerContacted(false);
    setAssignedTo("tom");
    setCarpetOrderedDate("");
    setCarpetCostPerSqm("");
    setMeasuredBy("");
    setMeasuredBookedDate("");
    setMeasuredBookedTime("");
    setFittingSlots([{
      date: "",
      time: ""
    }]);
    setFormError(null);
    setFormMode("add");
  };
  const openEditForm = (item) => {
    setSelectedItemId(item.id);
    setCustomerName(item.customerName);
    setCustomerPhone(item.customerPhone || "");
    setSite(item.site);
    setWhat3words(item.what3words || "");
    setStatus(item.status);
    setWhatsRequired(item.whatsRequired);
    setWhereNeedsMeasuring(item.whereNeedsMeasuring || "");
    setNotes(item.notes || "");
    setSamples(item.samples || "");
    setGoogleDriveUrl(item.googleDriveUrl || "");
    setEditingDriveUrl(false);
    setUpliftAndDisposal(Boolean(item.upliftAndDisposal));
    setFurniture(Boolean(item.furniture));
    setCustomerContacted(Boolean(item.customerContacted));
    setAssignedTo(item.assignedTo || "tom");
    setCarpetOrderedDate(item.carpetOrderedDate || "");
    setCarpetCostPerSqm(item.carpetCostPerSqm || "");
    setMeasuredBy(item.measuredBy || "");
    const parsedMeasure = parseDateTimeString(item.measuredBooked || "");
    setMeasuredBookedDate(parsedMeasure.dateStr);
    setMeasuredBookedTime(parsedMeasure.timeStr || "");
    const loadedFittingDates = (item.fittingDate || "").split(",").map((d) => d.trim()).filter(Boolean);
    const slots = loadedFittingDates.map((raw) => {
      const p = parseDateTimeString(raw);
      return {
        date: p.dateStr,
        time: p.timeStr || ""
      };
    });
    setFittingSlots(slots.length ? slots : [{
      date: "",
      time: ""
    }]);
    setFormError(null);
    setFormMode("edit");
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!customerName || !site || !whatsRequired) {
      setFormError("Please fill in all required fields");
      return;
    }
    const measuredBooked = measuredBookedDate.trim() ? measuredBookedTime.trim() ? `${measuredBookedDate.trim()}T${measuredBookedTime.trim()}` : measuredBookedDate.trim() : "";
    const fittingDate = fittingSlots.filter((s) => s.date.trim()).map((s) => s.time.trim() ? `${s.date.trim()}T${s.time.trim()}` : s.date.trim()).join(",");
    setFormSubmitting(true);
    try {
      if (formMode === "add") {
        await createWorkItem({
          data: {
            customerName,
            customerPhone,
            site,
            what3words: what3words.trim() || void 0,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            googleDriveUrl,
            upliftAndDisposal,
            furniture,
            customerContacted,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
            carpetCostPerSqm
          }
        });
      } else if (formMode === "edit" && selectedItemId !== null) {
        await updateWorkItem({
          data: {
            id: selectedItemId,
            customerName,
            customerPhone,
            site,
            what3words: what3words.trim() || void 0,
            status,
            assignedTo,
            whatsRequired,
            whereNeedsMeasuring,
            notes,
            samples,
            googleDriveUrl,
            upliftAndDisposal,
            furniture,
            customerContacted,
            measuredBy,
            measuredBooked,
            fittingDate,
            carpetOrderedDate,
            carpetCostPerSqm
          }
        });
      }
      setFormMode("none");
      await fetchWorkItems();
    } catch (err) {
      setFormError(err?.message || "Failed to save job.");
    } finally {
      setFormSubmitting(false);
    }
  };
  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) {
      return false;
    }
    try {
      await deleteWorkItem({
        data: {
          id
        }
      });
      await fetchWorkItems();
      return true;
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete job");
      return false;
    }
  };
  const updateFittingSlot = (index, field, value) => {
    setFittingSlots((prev) => prev.map((s, i) => i === index ? {
      ...s,
      [field]: value
    } : s));
  };
  const addFittingSlot = () => {
    setFittingSlots((prev) => [...prev, {
      date: "",
      time: ""
    }]);
  };
  const removeFittingSlot = (index) => {
    setFittingSlots((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{
        date: "",
        time: ""
      }];
    });
  };
  const getDialHref = (phone) => {
    const dialable = phone.replace(/[^\d+]/g, "");
    return dialable ? `tel:${dialable}` : "#";
  };
  const localToday = () => {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const [advancingId, setAdvancingId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(/* @__PURE__ */ new Set());
  const toggleExpanded = (id) => setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const advanceStage = async (item) => {
    const next = nextStage(item.status);
    if (!next || advancingId !== null) return;
    if (next === "Completed" && !window.confirm(`Mark ${item.customerName} as completed? It will move to the Archive.`)) return;
    setAdvancingId(item.id);
    try {
      await setWorkItemStatus({
        data: {
          id: item.id,
          status: next
        }
      });
      await fetchWorkItems();
    } catch {
      window.alert("Could not update the job. Please try again.");
    } finally {
      setAdvancingId(null);
    }
  };
  const onMessagedCustomer = (item) => {
    if (item.customerContacted) return;
    markCustomerContacted({
      data: {
        id: item.id
      }
    }).then(() => fetchWorkItems()).catch(() => {
    });
  };
  const getWhat3WordsHref = (w3w) => {
    const clean = w3w.trim().replace(/^\/{1,3}/, "");
    return `https://what3words.com/${encodeURIComponent(clean)}`;
  };
  const activeItems = workItemsList.filter((item) => item.status !== "Completed");
  const archivedItems = workItemsList.filter((item) => item.status === "Completed");
  const filteredItems = (view === "archive" ? archivedItems : activeItems).filter((item) => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || item.customerPhone && item.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) || item.site.toLowerCase().includes(searchQuery.toLowerCase()) || item.what3words && item.what3words.toLowerCase().includes(searchQuery.toLowerCase()) || item.googleDriveUrl && item.googleDriveUrl.toLowerCase().includes(searchQuery.toLowerCase()) || item.whatsRequired.toLowerCase().includes(searchQuery.toLowerCase()) || (item.whereNeedsMeasuring || "").toLowerCase().includes(searchQuery.toLowerCase()) || item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = view === "archive" || statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalJobs = activeItems.length;
  const measureBookedJobs = workItemsList.filter((i) => i.status === "Measure booked").length;
  const progressJobs = workItemsList.filter((i) => i.status === "In progress").length;
  const completedJobs = archivedItems.length;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-emerald-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-100", children: "Loading Work Tracker..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20", children: /* @__PURE__ */ jsx(Database, { className: "w-10 h-10" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-4xl font-extrabold tracking-tight text-white sm:text-5xl", children: "Work Tracker" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: "Access across all devices • Fully persistent • Team accounts" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-md py-8 px-4 shadow-xl ring-1 ring-slate-800 rounded-3xl sm:px-10 border border-slate-800", children: [
        /* @__PURE__ */ jsxs("form", { className: "space-y-5", onSubmit: handleAuthSubmit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300", children: "Username" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500", children: /* @__PURE__ */ jsx(User, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsx("input", { type: "text", value: usernameInput, onChange: (e) => setUsernameInput(e.target.value), required: true, className: "block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all", placeholder: "Enter username" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500", children: /* @__PURE__ */ jsx(Key, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsx("input", { type: "password", value: passwordInput, onChange: (e) => setPasswordInput(e.target.value), required: true, className: "block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all", placeholder: "••••••••" })
            ] })
          ] }),
          authError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-sm text-red-400 flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsx("span", { children: authError })
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: authSubmitting, className: "w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/15", children: authSubmitting ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }) : "Log In" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 border-t border-slate-800/80 pt-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-emerald-950/20 border border-emerald-900/30 p-4", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-2 w-2 rounded-full bg-emerald-400" }),
            "Team Login"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "Enter your team credentials to access the tracker. Accounts are managed centrally and cannot be created here." })
        ] }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 font-sans pb-16", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: /* @__PURE__ */ jsx(Database, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-tight text-white", children: "Work Tracker" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 hidden sm:block", children: "Persistent Multi-Device Task Registry" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("button", { onClick: openProfile, className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-sm text-left hover:bg-slate-900 transition-all", title: "Edit profile", children: [
          /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-emerald-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-300 font-medium capitalize", children: user.displayName || user.username })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: handleLogout, className: "p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer", title: "Log Out", children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8", children: [
      /* @__PURE__ */ jsx(NotificationSettings, {}),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Active Jobs" }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold text-white mt-1", children: totalJobs })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-slate-800/80 rounded-xl text-slate-300 border border-slate-700/50", children: /* @__PURE__ */ jsx(Briefcase, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-amber-400 uppercase tracking-wider", children: "Measure Booked" }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold text-white mt-1", children: measureBookedJobs })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20", children: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-sky-400 uppercase tracking-wider", children: "In Progress" }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold text-white mt-1", children: progressJobs })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20", children: /* @__PURE__ */ jsx(Filter, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setView("archive"), className: "text-left bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all cursor-pointer", title: "View archived (completed) jobs", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-400 uppercase tracking-wider", children: "Archived" }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold text-white mt-1", children: completedJobs })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-slate-900/30 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col sm:flex-row gap-2.5 sm:gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500", children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Search by customer, site, needs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all" })
          ] }),
          view !== "calendar" && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), disabled: view === "archive", className: "appearance-none w-full sm:w-44 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed", children: [
              /* @__PURE__ */ jsx("option", { value: "All", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "New enquiry", children: "New enquiry" }),
              /* @__PURE__ */ jsx("option", { value: "Measure booked", children: "Measure booked" }),
              /* @__PURE__ */ jsx("option", { value: "Quote sent", children: "Quote sent" }),
              /* @__PURE__ */ jsx("option", { value: "Fitting booked", children: "Fitting booked" }),
              /* @__PURE__ */ jsx("option", { value: "In progress", children: "In progress" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500", children: /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setView(view === "calendar" ? "active" : "calendar"), className: `flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${view === "calendar" ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20" : "bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800"}`, title: "Toggle Schedule View", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-emerald-400 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: view === "calendar" ? "Show Cards" : "Schedule" })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: openAddForm, className: "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-all cursor-pointer shadow-md shadow-emerald-500/10 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "Add Job" })
          ] })
        ] })
      ] }),
      profileOpen && /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl shadow-emerald-950/5 mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-emerald-400" }),
            "Edit Profile"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setProfileOpen(false), className: "text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer", children: "Close" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSubmit, className: "p-6 space-y-6", children: [
          profileError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: profileError })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Display Name" }),
              /* @__PURE__ */ jsx("input", { type: "text", value: profileDisplayName, onChange: (e) => setProfileDisplayName(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Tom, Chris, or your name" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Profile Image URL" }),
              /* @__PURE__ */ jsx("input", { type: "url", value: profileImageUrl, onChange: (e) => setProfileImageUrl(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "https://..." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "New Password" }),
              /* @__PURE__ */ jsx("input", { type: "password", value: profilePassword, onChange: (e) => setProfilePassword(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Leave blank to keep current password" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Confirm Password" }),
              /* @__PURE__ */ jsx("input", { type: "password", value: profileConfirmPassword, onChange: (e) => setProfileConfirmPassword(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Confirm new password" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-800", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setProfileOpen(false), className: "px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer", children: "Cancel" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: profileSubmitting, className: "flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10", children: profileSubmitting ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }) : "Save Profile" })
          ] })
        ] })
      ] }),
      formMode !== "none" && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto px-3 py-4 sm:px-6 sm:py-8", role: "dialog", "aria-modal": "true", "aria-labelledby": "work-item-form-title", onMouseDown: (event) => {
        if (event.target === event.currentTarget) {
          setFormMode("none");
        }
      }, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl shadow-slate-950/60", children: [
        /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-10 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Clipboard, { className: "w-5 h-5 text-emerald-400" }),
            /* @__PURE__ */ jsx("span", { id: "work-item-form-title", children: formMode === "add" ? "Add New Job" : "Edit Job" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFormMode("none"), className: "p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/70 transition-all cursor-pointer", title: "Close form", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleFormSubmit, className: "p-4 sm:p-6 space-y-6", children: [
          formError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: formError })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
                "Customer Name ",
                /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "text", value: customerName, onChange: (e) => setCustomerName(e.target.value), required: true, className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Enter customer name" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Customer Phone" }),
              /* @__PURE__ */ jsx("input", { type: "tel", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Enter phone number" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
                "Site Address / Location ",
                /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "text", value: site, onChange: (e) => setSite(e.target.value), required: true, className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "E.g. Main Office, North Wing, Sydney Branch" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "what3words Location (Optional)" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-400 font-mono font-bold", children: "///" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400 font-mono font-bold text-sm", children: "///" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: what3words.replace(/^\/{1,3}/, ""), onChange: (e) => setWhat3words(e.target.value ? `///${e.target.value.replace(/^\/{1,3}/, "")}` : ""), className: "w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-sm font-mono", placeholder: "e.g. filled.count.soap" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
                "Status ",
                /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm cursor-pointer", children: [
                /* @__PURE__ */ jsx("option", { value: "New enquiry", children: "New enquiry" }),
                /* @__PURE__ */ jsx("option", { value: "Measure booked", children: "Measure booked" }),
                /* @__PURE__ */ jsx("option", { value: "Quote sent", children: "Quote sent" }),
                /* @__PURE__ */ jsx("option", { value: "Fitting booked", children: "Fitting booked" }),
                /* @__PURE__ */ jsx("option", { value: "In progress", children: "In progress" }),
                /* @__PURE__ */ jsx("option", { value: "Completed", children: "Completed" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
                "Where needs measuring ",
                /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-normal", children: "(optional)" })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "text", value: whereNeedsMeasuring, onChange: (e) => setWhereNeedsMeasuring(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "E.g. Ground floor windows, boardroom skylight" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
              "What flooring is required ",
              /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx("textarea", { value: whatsRequired, onChange: (e) => setWhatsRequired(e.target.value), required: true, rows: 3, className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none", placeholder: "Describe what tasks or materials are required..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Additional Notes (Optional)" }),
            /* @__PURE__ */ jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none", placeholder: "Any other helpful observations..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Samples (Optional)" }),
              /* @__PURE__ */ jsx("input", { type: "text", value: samples, onChange: (e) => setSamples(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Samples required or notes about samples" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Google Drive Folder" }),
              googleDriveUrl.trim() && !editingDriveUrl ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl", children: [
                /* @__PURE__ */ jsxs("a", { href: googleDriveUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 text-sm text-sky-300 hover:text-sky-200 transition-colors min-w-0", children: [
                  /* @__PURE__ */ jsx(FolderOpen, { className: "w-4 h-4 shrink-0 text-sky-400/80" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate underline underline-offset-2", children: customerName.trim() || "Open folder" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditingDriveUrl(true), className: "text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors", children: "Change" }),
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                    setGoogleDriveUrl("");
                    setEditingDriveUrl(false);
                  }, className: "text-xs font-semibold text-slate-400 hover:text-red-300 transition-colors", children: "Remove" })
                ] })
              ] }) : /* @__PURE__ */ jsx("input", { type: "url", value: googleDriveUrl, onChange: (e) => setGoogleDriveUrl(e.target.value), onBlur: () => googleDriveUrl.trim() && setEditingDriveUrl(false), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "Paste the customer folder link" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Assigned To" }),
              /* @__PURE__ */ jsxs("select", { value: assignedTo, onChange: (e) => setAssignedTo(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", children: [
                /* @__PURE__ */ jsx("option", { value: "tom", children: "Tom" }),
                /* @__PURE__ */ jsx("option", { value: "chris", children: "Chris" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer hover:border-emerald-500/40 transition-all", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: upliftAndDisposal, onChange: (e) => setUpliftAndDisposal(e.target.checked), className: "h-4 w-4 accent-emerald-500" }),
              "Uplift and disposal"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer hover:border-emerald-500/40 transition-all", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: furniture, onChange: (e) => setFurniture(e.target.checked), className: "h-4 w-4 accent-emerald-500" }),
              "Furniture"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 cursor-pointer hover:border-emerald-500/40 transition-all md:col-span-2", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: customerContacted, onChange: (e) => setCustomerContacted(e.target.checked), className: "h-4 w-4 accent-emerald-500" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Customer contacted before fitting",
                /* @__PURE__ */ jsx("span", { className: "block text-xs font-normal text-slate-500", children: "Stops the check-in reminder. Clears itself if the fitting date changes." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Carpet ordered" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-stretch gap-2", children: [
                /* @__PURE__ */ jsx("input", { type: "date", value: carpetOrderedDate, onChange: (e) => setCarpetOrderedDate(e.target.value), className: "flex-1 min-w-0 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCarpetOrderedDate(""), disabled: !carpetOrderedDate, className: "px-3 text-xs font-semibold text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0", title: "Clear carpet ordered date", children: "Clear" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Carpet cost per m² (excl. VAT)" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm", children: "£" }),
                /* @__PURE__ */ jsx("input", { type: "number", min: "0", step: "0.01", inputMode: "decimal", value: carpetCostPerSqm, onChange: (e) => setCarpetCostPerSqm(e.target.value), className: "w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", placeholder: "0.00" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "Measure booked" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-normal", children: "Defaults to 1 hr" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5", children: [
                /* @__PURE__ */ jsx("input", { type: "date", value: measuredBookedDate, onChange: (e) => setMeasuredBookedDate(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" }),
                /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("input", { type: "time", value: measuredBookedTime, onChange: (e) => setMeasuredBookedTime(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" }) })
              ] }),
              (measuredBookedDate || measuredBookedTime) && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                setMeasuredBookedDate("");
                setMeasuredBookedTime("");
              }, className: "mt-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors cursor-pointer", children: "Clear measure date" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300", children: "Fitting date(s) & start times" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-normal", children: "Defaults to 1 hr duration" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-2", children: "Select the date and optional start time for each day of the fitting." }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: fittingSlots.map((slot, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-2", children: [
              /* @__PURE__ */ jsx("input", { type: "date", value: slot.date, onChange: (e) => updateFittingSlot(index, "date", e.target.value), className: "flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" }),
              /* @__PURE__ */ jsx("input", { type: "time", value: slot.time, onChange: (e) => updateFittingSlot(index, "time", e.target.value), className: "w-full sm:w-36 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => removeFittingSlot(index), disabled: fittingSlots.length === 1 && !slot.date && !slot.time, className: "p-2.5 text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center", title: "Remove this date", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
            ] }, index)) }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: addFittingSlot, className: "mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/20 transition-all cursor-pointer", children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add another date"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Who's measuring" }),
            /* @__PURE__ */ jsxs("select", { value: measuredBy, onChange: (e) => setMeasuredBy(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "-- Select --" }),
              /* @__PURE__ */ jsx("option", { value: "tom", children: "Tom" }),
              /* @__PURE__ */ jsx("option", { value: "chris", children: "Chris" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-800", children: [
            formMode === "edit" && selectedItemId !== null && /* @__PURE__ */ jsxs("button", { type: "button", onClick: async () => {
              if (await handleDeleteItem(selectedItemId)) setFormMode("none");
            }, className: "mr-auto inline-flex items-center gap-1.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-semibold transition-all cursor-pointer", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
              "Delete job"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFormMode("none"), className: "px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer", children: "Cancel" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: formSubmitting, className: "flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10", children: formSubmitting ? /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }) : formMode === "add" ? "Add Job" : "Save Changes" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 sm:gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setView("active"), className: `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${view === "active" ? "border-emerald-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Briefcase, { className: "w-4 h-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: "Active Jobs" }),
          /* @__PURE__ */ jsx("span", { className: "ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300", children: activeItems.length })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setView("calendar"), className: `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${view === "calendar" ? "border-emerald-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 shrink-0 text-emerald-400" }),
          /* @__PURE__ */ jsx("span", { children: "Schedule" }),
          /* @__PURE__ */ jsx("span", { className: "ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", children: workItemsList.filter((i) => i.measuredBooked || i.fittingDate).length + calendarEventsList.length })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setView("archive"), className: `flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap shrink-0 ${view === "archive" ? "border-emerald-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`, children: [
          /* @__PURE__ */ jsx(Archive, { className: "w-4 h-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: "Archive" }),
          /* @__PURE__ */ jsx("span", { className: "ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300", children: archivedItems.length })
        ] })
      ] }),
      view === "calendar" ? /* @__PURE__ */ jsx(WorkCalendarModal, { workItems: workItemsList, manualEvents: calendarEventsList, onOpenJob: (job) => {
        openEditForm(job);
      }, onAddManualEvent: (presetDate) => {
        openAddCalendarModal(presetDate);
      }, onEditManualEvent: (event) => {
        openEditCalendarModal(event);
      }, onDeleteManualEvent: (id) => {
        handleDeleteCalendarEvent(id);
      }, currentUser: user }) : itemsLoading && workItemsList.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Loading work database..." })
      ] }) : filteredItems.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/20 py-20 text-center rounded-3xl border border-dashed border-slate-800", children: [
        /* @__PURE__ */ jsx(Clipboard, { className: "w-12 h-12 text-slate-600 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-300", children: view === "archive" ? "No Archived Jobs Yet" : "No Jobs Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-1 max-w-sm mx-auto", children: view === "archive" ? searchQuery ? "No archived jobs match your active search." : "Jobs marked as “Completed” are moved here automatically so your active list stays clear." : searchQuery || statusFilter !== "All" ? "No items match your active search filter settings." : "Get started by adding your team's first work tracking entry!" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredItems.map((item) => {
        const stage = stageStyle(item.status);
        const statusBadgeClass = stage.badge;
        const upcoming2 = nextAppointment(item.measuredBooked, item.fittingDate, localToday());
        const expanded = expandedIds.has(item.id);
        return /* @__PURE__ */ jsxs("div", { className: `bg-slate-900/40 rounded-2xl border border-slate-800 border-l-4 ${stage.stripe} hover:bg-slate-900/65 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl`, children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-white text-xl tracking-tight", children: item.customerName }),
                upcoming2 && /* @__PURE__ */ jsxs("p", { className: `flex items-center gap-1.5 text-base font-bold ${upcoming2.kind === "Measure" ? "text-sky-300" : "text-violet-300"}`, children: [
                  upcoming2.kind === "Measure" ? /* @__PURE__ */ jsx(Ruler, { className: "w-4 h-4 shrink-0" }) : /* @__PURE__ */ jsx(Hammer, { className: "w-4 h-4 shrink-0" }),
                  upcoming2.kind,
                  " ",
                  formatAppointmentDate(upcoming2.value, localToday())
                ] }),
                /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("a", { href: `https://maps.google.com/?q=${encodeURIComponent(item.site)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 text-sm font-semibold transition-all shadow-sm group/site max-w-full", title: "Open address in Maps", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover/site:scale-110 transition-transform" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: item.site }),
                  /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 text-emerald-400/70 group-hover/site:text-emerald-300 shrink-0 ml-0.5" })
                ] }) }),
                item.what3words && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("a", { href: getWhat3WordsHref(item.what3words), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 hover:border-rose-500/40 text-xs font-mono font-semibold transition-all group/w3w max-w-full", title: "Open location in what3words", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-rose-400 font-bold", children: "///" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: item.what3words.trim().replace(/^\/{1,3}/, "") }),
                  /* @__PURE__ */ jsx(ExternalLink, { className: "w-2.5 h-2.5 text-rose-400/70 group-hover/w3w:text-rose-300 shrink-0 ml-0.5" })
                ] }) }),
                item.customerPhone && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("a", { href: getDialHref(item.customerPhone), className: "inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-emerald-300 transition-colors", children: [
                    /* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5 text-emerald-400/80" }),
                    /* @__PURE__ */ jsx("span", { children: item.customerPhone })
                  ] }),
                  (() => {
                    const fitting = nextFittingDate(item.fittingDate, localToday());
                    if (!fitting || !item.customerPhone) return null;
                    const message = fittingMessage(item.customerName, fitting);
                    return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
                      /* @__PURE__ */ jsxs("a", { href: whatsappHref(item.customerPhone, message), target: "_blank", rel: "noreferrer", onClick: () => onMessagedCustomer(item), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-sm font-semibold transition-all", title: "WhatsApp the customer to confirm their fitting", children: [
                        /* @__PURE__ */ jsx(MessageCircle, { className: "w-3.5 h-3.5" }),
                        "WhatsApp"
                      ] }),
                      /* @__PURE__ */ jsxs("a", { href: smsHref(item.customerPhone, message), onClick: () => onMessagedCustomer(item), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 text-sm font-semibold transition-all", title: "Text the customer to confirm their fitting", children: [
                        /* @__PURE__ */ jsx(MessageSquare, { className: "w-3.5 h-3.5" }),
                        "Text"
                      ] })
                    ] });
                  })()
                ] }),
                item.googleDriveUrl && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("a", { href: item.googleDriveUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200 transition-colors", children: [
                  /* @__PURE__ */ jsx(FolderOpen, { className: "w-3.5 h-3.5 text-sky-400/80" }),
                  /* @__PURE__ */ jsx("span", { className: "underline underline-offset-2", children: item.customerName })
                ] }) }),
                item.assignedTo && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-400", children: [
                  /* @__PURE__ */ jsx(Briefcase, { className: "w-3.5 h-3.5 text-violet-400/80" }),
                  /* @__PURE__ */ jsxs("span", { className: "capitalize", children: [
                    "Assigned to ",
                    item.assignedTo
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-sm font-bold shrink-0 ${statusBadgeClass}`, children: item.status })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggleExpanded(item.id), className: "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-800 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer", "aria-expanded": expanded, children: [
              expanded ? "Less" : "More details",
              /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}` })
            ] }),
            expanded && /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-400 uppercase tracking-wider", children: "What’s Required" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: item.whatsRequired })
              ] }),
              item.whereNeedsMeasuring && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-sky-400 uppercase tracking-wider", children: "Where Needs Measuring" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: item.whereNeedsMeasuring })
              ] }),
              item.notes && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Notes" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed italic mt-0.5 whitespace-pre-line", children: item.notes })
              ] }),
              item.samples && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-violet-400 uppercase tracking-wider", children: "Samples" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: item.samples })
              ] }),
              (item.upliftAndDisposal || item.furniture || item.customerContacted) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                item.upliftAndDisposal && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300", children: "Uplift and disposal" }),
                item.furniture && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300", children: "Furniture" }),
                item.customerContacted && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300", children: "✓ Customer contacted" })
              ] }),
              item.carpetOrderedDate && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-amber-400 uppercase tracking-wider", children: "Carpet ordered" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: new Date(item.carpetOrderedDate).toLocaleDateString() })
              ] }),
              item.carpetCostPerSqm && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-400 uppercase tracking-wider", children: "Carpet cost per m² (excl. VAT)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: [
                  "£",
                  item.carpetCostPerSqm
                ] })
              ] }),
              item.measuredBooked && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-amber-400 uppercase tracking-wider", children: "Measure booked" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 leading-relaxed font-medium mt-1", children: formatDateTimeDisplay(item.measuredBooked, 1) })
                ] }),
                /* @__PURE__ */ jsx(AddToCalendarButton, { uid: `work-${item.id}-measure@worktracker`, title: `📏 Measure: ${item.customerName}`, dateStr: item.measuredBooked, location: item.site, details: `${item.whereNeedsMeasuring ? `Where needs measuring: ${item.whereNeedsMeasuring}
` : ""}What's required: ${item.whatsRequired}${item.notes ? `
Notes: ${item.notes}` : ""}${item.what3words ? `
what3words: ${item.what3words}` : ""}`, compact: true })
              ] }),
              item.fittingDate && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-violet-400 uppercase tracking-wider", children: [
                    "Fitting date",
                    item.fittingDate.includes(",") ? "s" : ""
                  ] }),
                  /* @__PURE__ */ jsx(AddToCalendarButton, { uid: `work-${item.id}-fitting@worktracker`, title: `🔨 Fitting: ${item.customerName}`, dateStr: item.fittingDate.split(",")[0].trim(), location: item.site, details: `What's required: ${item.whatsRequired}${item.notes ? `
Notes: ${item.notes}` : ""}${item.what3words ? `
what3words: ${item.what3words}` : ""}`, compact: true })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-1", children: item.fittingDate.split(",").map((d) => d.trim()).filter(Boolean).map((d, i) => /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-300 leading-relaxed font-medium bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1", children: formatDateTimeDisplay(d, 1) }, i)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 bg-slate-950/80 border-t border-slate-800/50 flex items-center justify-between gap-3 text-sm text-slate-500 mt-auto", children: [
            /* @__PURE__ */ jsxs("span", { title: `Updated: ${new Date(item.updatedAt).toLocaleString()}`, children: [
              "Updated ",
              new Date(item.updatedAt).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric"
              })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              nextStage(item.status) && /* @__PURE__ */ jsxs("button", { onClick: () => advanceStage(item), disabled: advancingId === item.id, className: "inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50", title: `Move this job to ${nextStage(item.status)}`, children: [
                advancingId === item.id ? "Saving…" : nextStage(item.status),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => openEditForm(item), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-all cursor-pointer", title: "Edit job", children: [
                /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" }),
                "Edit"
              ] })
            ] })
          ] })
        ] }, item.id);
      }) }),
      calendarModalMode !== "none" && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5 text-emerald-400" }),
            calendarModalMode === "add" ? "Add Calendar Entry" : "Edit Calendar Entry"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setCalendarModalMode("none"), className: "p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleCalendarFormSubmit, className: "p-6 space-y-4", children: [
          calFormError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2 border border-red-500/25", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: calFormError })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
              "Event Title / Note ",
              /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, value: calTitle, onChange: (e) => setCalTitle(e.target.value), placeholder: "e.g. Workshop inventory, Supplier delivery, Tom off", className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: [
                "Date ",
                /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "date", required: true, value: calDate, onChange: (e) => setCalDate(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: "Start Time" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-normal", children: "1 hr default" })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "time", value: calTime, onChange: (e) => setCalTime(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "End Date (Optional)" }),
              /* @__PURE__ */ jsx("input", { type: "date", value: calEndDate, onChange: (e) => setCalEndDate(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Category / Type" }),
              /* @__PURE__ */ jsxs("select", { value: calEventType, onChange: (e) => setCalEventType(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", children: [
                /* @__PURE__ */ jsx("option", { value: "general", children: "General Note / Task" }),
                /* @__PURE__ */ jsx("option", { value: "measure", children: "Measure Appointment" }),
                /* @__PURE__ */ jsx("option", { value: "fitting", children: "Fitting Appointment" }),
                /* @__PURE__ */ jsx("option", { value: "delivery", children: "Material / Carpet Delivery" }),
                /* @__PURE__ */ jsx("option", { value: "holiday", children: "Holiday / Day Off" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Assigned To (Optional)" }),
              /* @__PURE__ */ jsxs("select", { value: calAssignedTo, onChange: (e) => setCalAssignedTo(e.target.value), className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Team / Anyone" }),
                /* @__PURE__ */ jsx("option", { value: "tom", children: "Tom" }),
                /* @__PURE__ */ jsx("option", { value: "chris", children: "Chris" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-300 mb-1.5", children: "Notes / Details (Optional)" }),
            /* @__PURE__ */ jsx("textarea", { rows: 3, value: calNotes, onChange: (e) => setCalNotes(e.target.value), placeholder: "Add any extra notes or requirements...", className: "w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-3 border-t border-slate-800", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCalendarModalMode("none"), className: "px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer", children: "Cancel" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: calFormSubmitting, className: "flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10", children: calFormSubmitting ? /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }) : calendarModalMode === "add" ? "Create Entry" : "Save Entry" })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  TrackerApp as component
};
