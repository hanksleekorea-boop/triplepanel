export { MAX_TIME_BLOCKS, addTimeBlock, applyAiPlan, canRole, isTimeBlock, localAiPlan, localAiSummary, removeTimeBlock, roleCapabilities, timeBlocksForDate } from "./domain.mjs";

export const STAGE_THREE_SCOPE = Object.freeze({
  timePlanning: true,
  localAiPreview: true,
  rolePermissions: true,
  billing: false,
  serverSync: false,
});
