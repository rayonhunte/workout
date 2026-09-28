import { test, expect } from "@playwright/test";
test("production shell reopens without connectivity after installation", async ({
  page,
  context,
}) => {
  await page.goto("http://127.0.0.1:5199");
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  const urls = await page.evaluate(async () => {
    const names = await caches.keys();
    const keys = await (
      await caches.open(names.find((n) => n.startsWith("workout-shell-")))
    ).keys();
    return keys.map((k) => new URL(k.url).pathname);
  });
  expect(
    urls.every((path) => path === "/index.html" || path.startsWith("/assets/")),
  ).toBe(true);
});
