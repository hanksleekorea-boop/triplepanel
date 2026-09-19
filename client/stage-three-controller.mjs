import { addTimeBlock, applyAiPlan, localAiPlan, localAiSummary, removeTimeBlock } from "./domain.mjs";
import { t3 } from "./stage-three-ui.mjs";

export function createStageThreeController({ runtime, commit, render, openModal, closeModal }) {
  const text = (key) => t3(key, runtime.state.settings?.language === "en" ? "en" : "ko");
  const showError = (key) => { const node = document.querySelector("#stage-three-error"); if (node) node.textContent = text(key); else { runtime.notice = text(key); runtime.noticeKind = "error"; render(); } };
  const save = (next, message = text("saved")) => { if (!commit(next, message, false)) { showError("invalid"); return false; } runtime.modalDirty = false; closeModal(); return true; };
  const parseMinute = (value) => { const [hour, minute] = String(value || "").split(":").map(Number); return Number.isInteger(hour) && Number.isInteger(minute) ? hour * 60 + minute : NaN; };
  return {
    action(action, id) {
      if (["schedule", "aiPlan", "aiSummary", "permissions", "proCenter"].includes(action)) { openModal(action); return true; }
      if (action === "remove-block") {
        save(removeTimeBlock(runtime.state, id));
        runtime.modal = "schedule";
        render();
        return true;
      }
      if (action === "save-ai-summary") {
        if (!runtime.aiSummary) return true;
        const next = structuredClone(runtime.state);
        next.aiSummaries = [...(next.aiSummaries ?? []).filter((item) => !(item.workspaceId === next.workspaceId && item.startDate === runtime.aiSummary.startDate && item.endDate === runtime.aiSummary.endDate)), { id: `summary-${Date.now()}`, workspaceId: next.workspaceId, startDate: runtime.aiSummary.startDate, endDate: runtime.aiSummary.endDate, text: runtime.aiSummary.text, createdAt: Date.now() }].slice(-500);
        save(next, text("summarySaved"));
        runtime.modal = "aiSummary";
        render();
        return true;
      }
      return false;
    },
    bind() {
      for (const id of ["#schedule-form", "#ai-plan-form", "#ai-summary-form"]) {
        document.querySelector(id)?.addEventListener("input", () => { runtime.modalDirty = true; });
        document.querySelector(id)?.addEventListener("change", () => { runtime.modalDirty = true; });
      }
      document.querySelector("#schedule-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget), startMinute = parseMinute(data.get("startTime"));
        try {
          const next = addTimeBlock(runtime.state, { taskId: String(data.get("taskId")), date: String(data.get("date")), startMinute, durationMinutes: Number(data.get("durationMinutes")), label: String(data.get("label") ?? "") });
          runtime.scheduleDate = String(data.get("date"));
          save(next); runtime.modal = "schedule"; render();
        } catch (error) { showError(error.message === "scheduleOverlap" ? "overlap" : error.message === "scheduleTaskMissing" ? "taskMissing" : "invalid"); }
      });
      document.querySelector("#ai-plan-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const plan = runtime.aiPlanPreview ?? localAiPlan(runtime.state, runtime.aiPlanDate);
        const selected = new Set(new FormData(event.currentTarget).getAll("taskId"));
        const items = plan.items.filter((item) => selected.has(item.taskId));
        if (!items.length) { showError("aiNoSelection"); return; }
        try { save(applyAiPlan(runtime.state, { ...plan, items }), text("aiApplied")); } catch { showError("invalid"); }
      });
      document.querySelector("#ai-summary-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget), start = String(data.get("start")), end = String(data.get("end"));
        try { runtime.aiSummaryPeriod = { start, end }; runtime.aiSummary = localAiSummary(runtime.state, start, end); runtime.modalDirty = false; render(); } catch { showError("invalid"); }
      });
    },
  };
}
