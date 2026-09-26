import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));

test("native driver applications and carrier inquiries", async (t) => {
  const database = new DatabaseSync(":memory:");
  for (const migration of (await readdir(path.join(root, "drizzle"))).filter((name) => name.endsWith(".sql")).sort()) database.exec(await readFile(path.join(root, "drizzle", migration), "utf8"));
  await mkdir(path.join(root, ".sites-runtime"), { recursive: true });
  const temporary = await mkdtemp(path.join(root, ".sites-runtime/intake-test-"));
  const binding = { prepare(sql) { return { bind(...args) { return { async first() { return database.prepare(sql).get(...args) ?? null; }, async run() { return database.prepare(sql).run(...args); } }; } }; } };
  globalThis.__rangeIntakeTestDb = binding;
  await writeFile(path.join(temporary, "database.mjs"), "export function getDatabaseBinding() { return globalThis.__rangeIntakeTestDb; }\n");
  const sources = {
    "lib/company.ts": "company.mjs",
    "lib/quote-validation.ts": "quote-validation.mjs",
    "lib/intake-validation.ts": "intake-validation.mjs",
    "lib/server/form-http.ts": "form-http.mjs",
    "lib/server/intake-storage.ts": "intake-storage.mjs",
    "app/api/driver-applications/route.ts": "driver-route.mjs",
    "app/api/carrier-inquiries/route.ts": "carrier-route.mjs",
  };
  const aliases = { "@/db": "./database.mjs", "./company": "./company.mjs", "./quote-validation": "./quote-validation.mjs", "./form-http": "./form-http.mjs", "@/lib/intake-validation": "./intake-validation.mjs", "@/lib/server/form-http": "./form-http.mjs", "@/lib/server/intake-storage": "./intake-storage.mjs" };
  for (const [source, output] of Object.entries(sources)) {
    let code = await readFile(path.join(root, source), "utf8");
    for (const [from, to] of Object.entries(aliases)) code = code.replaceAll(JSON.stringify(from), JSON.stringify(to));
    await writeFile(path.join(temporary, output), ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText);
  }
  const driver = (await import(pathToFileURL(path.join(temporary, "driver-route.mjs")).href)).POST;
  const carrier = (await import(pathToFileURL(path.join(temporary, "carrier-route.mjs")).href)).POST;
  const driverData = { requestId: randomUUID(), firstName: "Jordan", lastName: "Test", email: "driver@example.test", phone: "4248423130", city: "Bloomington", state: "CA", zip: "92316", hasCdlA: "yes", licenseState: "CA", experienceYears: "5", routePreference: "otr", endorsements: ["tanker"], availableDate: "", noHistory: false, workHistory: [{ employer: "Test Transport", jobTitle: "CDL Driver", startMonth: "2024-01", endMonth: "", current: true, reasonForLeaving: "" }], notes: "", certified: true, website: "" };
  const carrierData = { requestId: randomUUID(), company: "Test Carrier", name: "Taylor Test", email: "carrier@example.test", phone: "4248423130", dotNumber: "1234567", mcNumber: "123456", equipment: "reefer", truckCount: "5", interest: "lanes", lanes: "California to Arizona", notes: "", consent: true, website: "" };
  const request = (body, origin = "https://range.test") => new Request("https://range.test/api/intake", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) });

  try {
    await t.test("saves driver contact details and structured employment history", async () => {
      assert.equal((await driver(request(driverData))).status, 201);
      const row = database.prepare("SELECT * FROM driver_applications WHERE id = ?").get(driverData.requestId);
      const saved = JSON.parse(row.payload_json);
      assert.equal(row.name, "Jordan Test");
      assert.equal(saved.workHistory[0].employer, "Test Transport");
      assert.equal(saved.applicationStage, "initial-recruiting");
      assert.equal(saved.consentVersion, "driver-2026-09-06");
    });
    await t.test("saves carrier equipment, authority identifiers, and preferred lanes", async () => {
      assert.equal((await carrier(request(carrierData))).status, 201);
      const saved = JSON.parse(database.prepare("SELECT payload_json FROM carrier_inquiries WHERE id = ?").get(carrierData.requestId).payload_json);
      assert.equal(saved.company, "Test Carrier");
      assert.equal(saved.equipment, "reefer");
      assert.equal(saved.dotNumber, "1234567");
      assert.equal(saved.lanes, "California to Arizona");
    });
    await t.test("both forms acknowledge retries without duplicate records", async () => {
      assert.equal((await driver(request(driverData))).status, 200);
      assert.equal((await carrier(request(carrierData))).status, 200);
      assert.equal(database.prepare("SELECT COUNT(*) AS total FROM driver_applications").get().total, 1);
      assert.equal(database.prepare("SELECT COUNT(*) AS total FROM carrier_inquiries").get().total, 1);
    });
    await t.test("requires driver certification and CDL state when applicable", async () => {
      assert.equal((await driver(request({ ...driverData, requestId: randomUUID(), certified: false }))).status, 400);
      assert.equal((await driver(request({ ...driverData, requestId: randomUUID(), licenseState: "" }))).status, 400);
      assert.equal((await carrier(request({ ...carrierData, requestId: randomUUID(), consent: false }))).status, 400);
    });
    await t.test("rejects reversed employment dates and a missing employment record", async () => {
      const badJob = { ...driverData.workHistory[0], current: false, endMonth: "2023-01" };
      assert.equal((await driver(request({ ...driverData, requestId: randomUUID(), workHistory: [badJob] }))).status, 400);
      assert.equal((await driver(request({ ...driverData, requestId: randomUUID(), workHistory: [] }))).status, 400);
    });
    await t.test("supports a new driver with no previous employment", async () => {
      const id = randomUUID();
      assert.equal((await driver(request({ ...driverData, requestId: id, email: "new@example.test", noHistory: true, experienceYears: "0", workHistory: [] }))).status, 201);
      const saved = JSON.parse(database.prepare("SELECT payload_json FROM driver_applications WHERE id = ?").get(id).payload_json);
      assert.deepEqual(saved.workHistory, []);
    });
    await t.test("rejects cross-origin posts, honeypots, and oversized request bodies", async () => {
      assert.equal((await driver(request(driverData, "https://unrelated.test"))).status, 403);
      assert.equal((await carrier(request({ ...carrierData, website: "spam" }))).status, 400);
      assert.equal((await driver(request({ ...driverData, notes: "x".repeat(40000) }))).status, 413);
    });
    await t.test("limits repeated inquiries without blocking an idempotent retry", async () => {
      assert.equal((await carrier(request({ ...carrierData, requestId: randomUUID() }))).status, 201);
      assert.equal((await carrier(request({ ...carrierData, requestId: randomUUID() }))).status, 201);
      assert.equal((await carrier(request({ ...carrierData, requestId: randomUUID() }))).status, 429);
      assert.equal((await carrier(request(carrierData))).status, 200);
    });
    await t.test("preserves existing quote storage and returns recoverable storage failures", async () => {
      assert.equal(database.prepare("SELECT COUNT(*) AS total FROM quote_requests").get().total, 0);
      globalThis.__rangeIntakeTestDb = { prepare() { throw new Error("Simulated storage failure"); } };
      assert.equal((await driver(request({ ...driverData, requestId: randomUUID() }))).status, 503);
      globalThis.__rangeIntakeTestDb = binding;
    });
  } finally {
    delete globalThis.__rangeIntakeTestDb;
    database.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
