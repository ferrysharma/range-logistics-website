import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));

test("freight quote endpoint with the actual SQLite migration", async (t) => {
  await mkdir(path.join(root, ".sites-runtime"), { recursive: true });
  const temporary = await mkdtemp(path.join(root, ".sites-runtime/quote-test-"));
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile(path.join(root, "drizzle/0000_cultured_lilith.sql"), "utf8"));

  // Only the Cloudflare binding is substituted; the route and validation are transpiled unchanged.
  const binding = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() { return sqlite.prepare(sql).get(...args) ?? null; },
            async run() { return sqlite.prepare(sql).run(...args); },
          };
        },
      };
    },
  };
  globalThis.__rangeTestDb = binding;
  await writeFile(path.join(temporary, "database.mjs"), "export function getDatabaseBinding() { return globalThis.__rangeTestDb; }\n");
  for (const [source, target] of [["lib/company.ts", "company.mjs"], ["lib/quote-validation.ts", "validation.mjs"], ["app/api/quote-requests/route.ts", "route.mjs"]]) {
    const text = (await readFile(path.join(root, source), "utf8"))
      .replace('"@/db"', '"./database.mjs"')
      .replace('"./company"', '"./company.mjs"')
      .replace('"@/lib/quote-validation"', '"./validation.mjs"');
    const { outputText } = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
    await writeFile(path.join(temporary, target), outputText);
  }
  const { POST } = await import(pathToFileURL(path.join(temporary, "route.mjs")).href);
  const payload = {
    requestId: randomUUID(), name: "Test Shipper", company: "Integration Test Company",
    email: "quotes@example.test", phone: "", origin: "Bloomington, CA",
    destination: "Phoenix, AZ", service: "reefer", pickupDate: "", details: "Keep at 35°F", website: "",
  };
  const makeRequest = (body = payload, origin = "https://range.test") => new Request("https://range.test/api/quote-requests", {
    method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body),
  });

  try {
    await t.test("stores a valid request and persists its freight details", async () => {
      const result = await POST(makeRequest());
      assert.equal(result.status, 201);
      assert.deepEqual(await result.json(), { requestId: payload.requestId });
      const row = sqlite.prepare("SELECT * FROM quote_requests WHERE id = ?").get(payload.requestId);
      assert.equal(row.details, "Keep at 35°F");
      assert.equal(row.email, payload.email);
      assert.equal(row.service, "reefer");
      assert.equal(row.status, "new");
    });
    await t.test("retries acknowledge the original record without duplication", async () => {
      const result = await POST(makeRequest());
      assert.equal(result.status, 200);
      assert.equal(sqlite.prepare("SELECT COUNT(*) AS total FROM quote_requests").get().total, 1);
    });
    await t.test("rejects invalid contact information without saving", async () => {
      assert.equal((await POST(makeRequest({ ...payload, requestId: randomUUID(), email: "invalid" }))).status, 400);
      assert.equal(sqlite.prepare("SELECT COUNT(*) AS total FROM quote_requests").get().total, 1);
    });
    await t.test("rejects cross-origin browser submissions", async () => {
      assert.equal((await POST(makeRequest(payload, "https://unrelated.test"))).status, 403);
    });
    await t.test("rejects oversized bodies and filled honeypots", async () => {
      assert.equal((await POST(makeRequest({ ...payload, details: "x".repeat(17000) }))).status, 413);
      assert.equal((await POST(makeRequest({ ...payload, website: "spam" }))).status, 400);
    });
    await t.test("rejects past pickup dates", async () => {
      assert.equal((await POST(makeRequest({ ...payload, pickupDate: "2000-01-01" }))).status, 400);
    });
    await t.test("limits repeated requests while allowing an idempotent retry", async () => {
      assert.equal((await POST(makeRequest({ ...payload, requestId: randomUUID() }))).status, 201);
      assert.equal((await POST(makeRequest({ ...payload, requestId: randomUUID() }))).status, 201);
      assert.equal((await POST(makeRequest({ ...payload, requestId: randomUUID() }))).status, 429);
      assert.equal((await POST(makeRequest())).status, 200);
    });
    await t.test("returns a recoverable failure when storage is unavailable", async () => {
      globalThis.__rangeTestDb = { prepare() { throw new Error("Simulated storage unavailable"); } };
      assert.equal((await POST(makeRequest({ ...payload, requestId: randomUUID() }))).status, 503);
      globalThis.__rangeTestDb = binding;
    });
  } finally {
    sqlite.close();
    delete globalThis.__rangeTestDb;
    await rm(temporary, { recursive: true, force: true });
  }
});
