import assert from "node:assert/strict";
import test from "node:test";
import { atpBalance, canDivide, createDay } from "../app/domain/rules";
import { completeCell, divideDay, exchangeCell, setCellTitle } from "../app/domain/transitions";

function dayWithTitles(atpStart = 2) {
  let day = divideDay(createDay("2026-08-27", atpStart));
  const [a, b] = day.generations[0].cells;
  day = setCellTitle(day, a.id, "完成作品集修改");
  day = setCellTitle(day, b.id, "整理房间");
  return day;
}

test("an unresolved generation cannot divide", () => {
  const day = dayWithTitles();
  assert.equal(divideDay(day).generations.length, 1);
  assert.equal(canDivide(day.generations[0]), false);
});

test("completion rewards ATP once and matures only after both cells resolve", () => {
  let day = dayWithTitles();
  const [a, b] = day.generations[0].cells;
  day = completeCell(day, a.id);
  assert.equal(day.atpEarned, 1);
  assert.equal(day.generations[0].maturedAt, null);
  day = completeCell(day, a.id);
  assert.equal(day.atpEarned, 1, "repeat completion must not reward twice");
  day = completeCell(day, b.id);
  assert.equal(day.atpEarned, 2);
  assert.equal(day.status, "matured");
  assert.ok(day.generations[0].maturedAt);
  assert.equal(divideDay(day).generations.length, 2);
});

test("minimum action remains active and earns no ATP when completed", () => {
  let day = dayWithTitles();
  const cell = day.generations[0].cells[0];
  day = exchangeCell(day, cell.id, "minimum_action", "修改作品集 5 分钟");
  const exchanged = day.generations[0].cells[0];
  assert.equal(exchanged.status, "active");
  assert.equal(exchanged.originalTitle, "完成作品集修改");
  assert.equal(exchanged.resolutionType, "minimum_action");
  day = completeCell(day, cell.id);
  assert.equal(day.atpEarned, 0);
});

test("equivalent swap preserves history, stays active, then earns one ATP", () => {
  let day = dayWithTitles();
  const cell = day.generations[0].cells[0];
  day = exchangeCell(day, cell.id, "equivalent_swap", "深度整理书桌 30 分钟");
  const exchanged = day.generations[0].cells[0];
  assert.equal(exchanged.status, "active");
  assert.equal(exchanged.exchangeHistory.length, 1);
  assert.equal(exchanged.exchangeHistory[0].beforeTitle, "完成作品集修改");
  day = completeCell(day, cell.id);
  assert.equal(day.atpEarned, 1);
});

test("ATP defer is blocked when energy is insufficient", () => {
  const day = dayWithTitles(1);
  const cell = day.generations[0].cells[0];
  const unchanged = exchangeCell(day, cell.id, "atp_defer");
  assert.equal(unchanged.atpSpent, 0);
  assert.equal(unchanged.generations[0].cells[0].status, "active");
});

test("ATP defer costs two, resolves the cell, and preserves it as dormant", () => {
  let day = dayWithTitles();
  const cell = day.generations[0].cells[0];
  day = exchangeCell(day, cell.id, "atp_defer");
  assert.equal(day.atpSpent, 2);
  assert.equal(atpBalance(day), 0);
  assert.equal(day.generations[0].cells[0].status, "dormant");
  assert.equal(day.dormantTasks.length, 1);
  assert.equal(day.dormantTasks[0].originalTitle, "完成作品集修改");
});

test("empty titles and completed cells cannot bypass rules", () => {
  let day = divideDay(createDay("2026-08-27"));
  const cell = day.generations[0].cells[0];
  day = completeCell(day, cell.id);
  assert.equal(day.generations[0].cells[0].status, "active");
  assert.equal(day.atpEarned, 0);

  day = setCellTitle(day, cell.id, "真实承诺");
  day = completeCell(day, cell.id);
  const afterComplete = exchangeCell(day, cell.id, "minimum_action", "做一分钟");
  assert.equal(afterComplete.generations[0].cells[0].currentTitle, "真实承诺");
  assert.equal(afterComplete.generations[0].cells[0].exchangeHistory.length, 0);
});
