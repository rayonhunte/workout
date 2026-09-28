import { test, expect } from "@playwright/test";
async function login(page) {
  await page.goto("/");
  await page.evaluate(async () => {
    const { auth } = await import("/src/firebase.js");
    const { signInAnonymously } =
      await import("/node_modules/.vite/deps/firebase_auth.js");
    await signInAnonymously(auth);
  });
  await expect(
    page.getByRole("button", { name: "Start Workout A" }),
  ).toBeVisible();
}
const saved = (page) =>
  expect(page.getByRole("status").first()).toContainText("synced with cloud", {
    timeout: 20000,
  });

test("mobile A: set logging, offline refresh, partial finish, corrections and legacy navigation", async ({
  page,
  context,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await login(page);
  await page.getByRole("button", { name: "Start Workout A" }).click();
  await expect(
    page.getByRole("heading", { name: "Workout A · Strength foundation" }),
  ).toBeVisible();
  const first = page.locator(".fit-set").first();
  await first.getByLabel("Load (lb)", { exact: true }).fill("70");
  await first.getByLabel("RIR (optional)").fill("2");
  await page
    .getByRole("button", { name: "Complete Leg press set 1", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Undo Leg press set 1", exact: true }),
  ).toBeVisible();
  await saved(page);
  await context.setOffline(true);
  await page
    .getByLabel("Session notes / symptoms / shortened session reason")
    .fill("Offline draft survives refresh");
  await expect(page.getByRole("status").first()).toContainText("Offline");
  // Simulate reopening while disconnected from Firestore; shell remains available via Vite.
  await context.setOffline(false);
  await page.route("**/firestore.googleapis.com/**", (route) => route.abort());
  await page.route("http://127.0.0.1:8080/**", (route) => route.abort());
  await page.reload();
  await page.getByRole("button", { name: "Resume workout" }).click();
  await expect(
    page.getByLabel("Session notes / symptoms / shortened session reason"),
  ).toHaveValue("Offline draft survives refresh");
  await expect(
    page.getByRole("button", { name: "Undo Leg press set 1", exact: true }),
  ).toBeVisible();
  await page.unrouteAll();
  await page.reload();
  await page.getByRole("button", { name: "Resume workout" }).click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start Workout B" }),
  ).toBeVisible();
  await expect(page.locator(".fit-history")).toContainText("partial");
  await saved(page);
  const records = await page.evaluate(() =>
    Object.values(
      JSON.parse(
        localStorage.getItem(
          Object.keys(localStorage).find((k) => k.startsWith("fitness-v1:")),
        ),
      ),
    ),
  );
  expect(records.filter((r) => r.kind === "session")).toHaveLength(1);
  const session = records.find((r) => r.kind === "session").data;
  expect(session.exercises[0].actual[0].load).toBe(70);
  expect(session.exercises[0].actual[0].rir).toBe(2);
  expect(session.template.exercises[0].min).toBe(10);
  await page
    .getByRole("button", { name: "Previous workouts & glucose tools" })
    .click();
  await expect(
    page.getByRole("button", { name: "Add workout", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("button", { name: "Today · 12-week program" }).click();
  await expect(
    page.getByRole("button", { name: "Start Workout B" }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({
    path: "test-results/today-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("B/C templates, unilateral work, editable phase review and unit-safe progress", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Move or skip this session" }).count();
  await page.getByText("Move or skip this session", { exact: true }).click();
  await page
    .getByRole("button", { name: "Skip this session", exact: true })
    .click();
  await page.getByRole("button", { name: "Start Workout B" }).click();
  const suitcase = page.locator(".fit-panel").filter({
    has: page.getByRole("heading", { name: "Suitcase carry", exact: true }),
  });
  await expect(suitcase.locator(".fit-set")).toHaveCount(6);
  await expect(suitcase.locator(".fit-set-title").first()).toContainText(
    "left",
  );
  await expect(suitcase.locator(".fit-set-title").nth(1)).toContainText(
    "right",
  );
  await suitcase
    .getByRole("button", { name: "Complete Suitcase carry set 1", exact: true })
    .click();
  await suitcase
    .getByRole("button", { name: "Complete Suitcase carry set 2", exact: true })
    .click();
  await page.getByLabel("Glucose (mg/dL)", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Save reading", exact: true }).click();
  await page.getByLabel("Reading timing").selectOption("after");
  await page.getByLabel("Glucose unit", { exact: true }).selectOption("mmol/L");
  await page.getByLabel("Glucose (mmol/L)", { exact: true }).fill("5.5");
  await page.getByRole("button", { name: "Save reading", exact: true }).click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Start Workout C" }).click();
  await expect(
    page.getByRole("heading", { name: "Incline dumbbell press", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Program", exact: true }).click();
  await page.getByRole("button", { name: "W5", exact: true }).click();
  await expect(
    page.getByText("Proposed defaults — review and edit", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept & save template" }).click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.getByRole("button", { name: "Start Workout A" }).click();
  await expect(
    page.getByText("WEEK 5 · WORKOUT A", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByLabel("Value (lb)", { exact: true }).fill("200");
  await page
    .getByRole("button", { name: "Save measurement", exact: true })
    .click();
  await expect(page.getByText("200 lb", { exact: true })).toBeVisible();
  await expect(page.getByText(/1 session pair/)).toBeVisible();
  await page.getByLabel("Actual activity minutes").fill("25");
  await page
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await saved(page);
  await page.screenshot({
    path: "test-results/progress-mobile.png",
    fullPage: true,
  });
});

test("completed A, undo, unknown RIR, account cache and second-tab protection", async ({
  page,
  context,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Start Workout A" }).click();
  const buttons = page.getByRole("button", { name: /^Complete .* set / });
  while (await buttons.count()) await buttons.first().click();
  await page
    .getByRole("button", { name: "Undo Leg press set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Complete Leg press set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(page.locator(".fit-history")).toContainText("completed");
  await saved(page);
  const second = await context.newPage();
  await second.goto("/");
  await expect(
    second.getByRole("heading", {
      name: "Your program is open in another tab",
    }),
  ).toBeVisible();
  await second.close();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByLabel(
      "Private context (limitations, medication notes, eating preferences)",
    )
    .fill("Private test note");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await saved(page);
  await page
    .getByRole("button", { name: "Clear synced device cache & sign out" })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("fitness-v1:")),
    ),
  ).toHaveLength(0);
});
