const JOB_STAGES = ["New enquiry", "Measure booked", "Quote sent", "Fitting booked", "In progress", "Completed"];
function nextStage(status) {
  const i = JOB_STAGES.indexOf(status);
  if (i === -1) return "Measure booked";
  return JOB_STAGES[i + 1] ?? null;
}
const STAGE_STYLES = {
  "New enquiry": { badge: "bg-slate-500/15 text-slate-200 border border-slate-500/30", stripe: "border-l-slate-500" },
  "Measure booked": { badge: "bg-sky-500/15 text-sky-300 border border-sky-500/30", stripe: "border-l-sky-500" },
  "Quote sent": { badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30", stripe: "border-l-amber-500" },
  "Fitting booked": { badge: "bg-violet-500/15 text-violet-300 border border-violet-500/30", stripe: "border-l-violet-500" },
  "In progress": { badge: "bg-orange-500/15 text-orange-300 border border-orange-500/30", stripe: "border-l-orange-500" },
  Completed: { badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30", stripe: "border-l-emerald-500" }
};
function stageStyle(status) {
  return STAGE_STYLES[status === "Pending" ? "New enquiry" : status] ?? STAGE_STYLES["New enquiry"];
}
export {
  JOB_STAGES as J,
  nextStage as n,
  stageStyle as s
};
