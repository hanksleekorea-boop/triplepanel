import english from "./locale-en.mjs";
let language = "ko";
export const setLanguage = (value) => { language = value === "en" ? "en" : "ko"; };
export const getLanguage = () => language;
export function tr(value) {
  if (language !== "en") return value;
  return value.split(/([<>"\n])/).map((part) => {
    const key = part.trim();
    return Object.hasOwn(english,key) ? part.replace(key,english[key]) : part;
  }).join("");
}
// Only authored literal segments are translated. Interpolated task data is untouched.
export function html(strings, ...values) {
  return strings.reduce((result, part, index) => result + tr(part) + (index < values.length ? values[index] : ""), "");
}
export function dueText(date, today) {
  if (!date) return "";
  const count = Math.round((new Date(`${date}T12:00:00`) - new Date(`${today}T12:00:00`))/86400000);
  if(language === "en") return new Intl.RelativeTimeFormat("en",{numeric:"auto"}).format(count,"day");
  return count === 0 ? "오늘" : count === 1 ? "내일" : count < 0 ? `${-count}일 지남` : `${count}일 남음`;
}
export function coachAdvice(insights) {
  if(language !== "en") return insights.advice;
  const advice=[];
  if(insights.doing.length>3) advice.push(`There are ${insights.doing.length} tasks in Do. Focus on the most important one to three.`);
  if(insights.overdue.length) advice.push(`Review ${insights.overdue.length} overdue tasks and choose whether to finish or reschedule them.`);
  if(!insights.completed.length && (insights.doing.length || insights.top.length)) advice.push("Move finished work to Review after checking the result.");
  return advice.length ? advice : ["Your workflow is steady. Start with your selected tasks."];
}
