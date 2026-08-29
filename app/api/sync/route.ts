import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { days, mutations, plans, userProfiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import type { CellState } from "../../domain/types";

export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "CHATGPT_SIGN_IN_REQUIRED" }, { status: 401 });
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();
  const db = getDb();
  const [profile, dayRows, planRows, mutationRows] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, user.userId)).limit(1),
    db.select().from(days).where(eq(days.userId, user.userId)),
    db.select().from(plans).where(eq(plans.userId, user.userId)),
    db.select().from(mutations).where(eq(mutations.userId, user.userId)),
  ]);
  if (!profile[0]) return Response.json({ state: null, user: { displayName: user.displayName } });
  const state: CellState = {
    version: 2,
    currentDate: profile[0].currentDate,
    days: dayRows.map((row) => JSON.parse(row.payload)),
    plans: planRows.map((row) => JSON.parse(row.payload)),
    mutationUsageByWeek: Object.fromEntries(mutationRows.map((row) => [row.weekKey, row.count])),
    preferences: JSON.parse(profile[0].preferences),
  };
  return Response.json({ state, user: { displayName: user.displayName }, syncedAt: profile[0].updatedAt });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthorized();
  const state = (await request.json()) as CellState;
  if (state.version !== 2 || !Array.isArray(state.days) || !Array.isArray(state.plans)) return Response.json({ error: "INVALID_STATE" }, { status: 400 });
  const db = getDb();
  const timestamp = Date.now();
  await db.transaction(async (tx) => {
    await tx.insert(userProfiles).values({ userId: user.userId, currentDate: state.currentDate, preferences: JSON.stringify(state.preferences), stateVersion: state.version, updatedAt: timestamp })
      .onConflictDoUpdate({ target: userProfiles.userId, set: { currentDate: state.currentDate, preferences: JSON.stringify(state.preferences), stateVersion: state.version, updatedAt: timestamp } });
    for (const day of state.days) await tx.insert(days).values({ userId: user.userId, date: day.date, payload: JSON.stringify(day), updatedAt: timestamp })
      .onConflictDoUpdate({ target: [days.userId, days.date], set: { payload: JSON.stringify(day), updatedAt: timestamp } });
    for (const plan of state.plans) await tx.insert(plans).values({ userId: user.userId, date: plan.date, payload: JSON.stringify(plan), updatedAt: timestamp })
      .onConflictDoUpdate({ target: [plans.userId, plans.date], set: { payload: JSON.stringify(plan), updatedAt: timestamp } });
    for (const [weekKey, count] of Object.entries(state.mutationUsageByWeek)) await tx.insert(mutations).values({ userId: user.userId, weekKey, count, updatedAt: timestamp })
      .onConflictDoUpdate({ target: [mutations.userId, mutations.weekKey], set: { count, updatedAt: timestamp } });
  });
  return Response.json({ ok: true, syncedAt: timestamp });
}
