// TEMPORARY visual-check harness. Delete after use.
localStorage.setItem("theme", "light"); localStorage.setItem("app-lang", "en");
const names = ["Yasmine El Amrani","Omar Benali","Salma Chraibi","Youssef Alaoui","Imane Tazi","Hamza Bennani","Nadia Idrissi","Mehdi Fassi","Khadija Berrada","Anas Lahlou"];
const users = names.map((n, i) => ({ id: i + 1, fullName: i === 0 ? "Ayman Chabbaki" : n, email: `${n.split(" ")[0].toLowerCase()}${i}@mail.ma`, role: i ? "user" : "admin", status: "active", region: ["Casablanca-Settat","Rabat-Salé-Kénitra","Fès-Meknès"][i % 3], createdAt: new Date().toISOString() }));
const campaigns = [
  { id: 3, segment: "selected", subject: "Welcome to the new legislature", message: "Dear members,\n\nThe new session opens on Monday.\n\nSee you there!", lang: "en", recipients: users.slice(1, 6).map(u => u.email), sentCount: 4, failedCount: 1, failures: [{ email: users[3].email, error: "Mailbox full" }], createdAt: new Date(Date.now() - 3600e3).toISOString(), sender: users[0], legacy: false },
  { id: 2, segment: "active_users", subject: "Monthly newsletter — October", message: "Hello!\n\nHere is what happened this month.", lang: "ar", recipients: users.map(u => u.email), sentCount: 10, failedCount: 0, failures: [], createdAt: new Date(Date.now() - 5 * 86400e3).toISOString(), sender: users[0], legacy: false },
  { id: "legacy-9", segment: "all_users", subject: "Platform launch", message: null, lang: null, recipients: null, recipientCount: 42, sentCount: 42, failedCount: 0, createdAt: new Date(Date.now() - 40 * 86400e3).toISOString(), sender: users[0], legacy: true },
];
const routes: [RegExp, () => unknown][] = [
  [/\/api\/auth\/me/, () => users[0]], [/\/api\/users(\?|$)/, () => ({ users, total: users.length })],
  [/\/api\/admin\/email\/history/, () => ({ campaigns })], [/\/api\/admin\/email\/status/, () => ({ configured: true })],
  [/\/api\/admin\/email\/recipients/, () => ({ count: 9 })], [/\/api\/roles\/applications/, () => ({ applications: [] })],
  [/\/api\/support/, () => ({ tickets: [] })], [/\/api\/crises/, () => ({ crises: [] })], [/\/api\/press/, () => ({ articles: [] })], [/\/api\/events/, () => ({ events: [] })],
];
const real = window.fetch.bind(window);
window.fetch = async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input.url ?? String(input);
  if (url.includes("/api/")) { const hit = routes.find(([re]) => re.test(url)); return new Response(JSON.stringify(hit ? hit[1]() : {}), { headers: { "Content-Type": "application/json" } }); }
  return real(input, init);
};
history.replaceState(null, "", "/admin" + location.hash);
import("../main");
