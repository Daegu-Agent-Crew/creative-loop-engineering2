import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "results/reproduced-summary.json");
const SCOREBOARD_URL = "https://pattern.plus/api/v1/scoreboard.json";
const LISTING_URL = "https://pattern.plus/api/v1/events/futures_listing.json";
const FEES_URL = "https://pattern.plus/api/v1/events/fees_jump.json";
const ROUND_TRIP_COST = 0.004;

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function summarize(values, seed = 20261011) {
  if (values.length === 0) return null;
  const random = createRandom(seed);
  const bootstrap = new Array(20000);
  for (let iteration = 0; iteration < bootstrap.length; iteration++) {
    let sum = 0;
    for (let index = 0; index < values.length; index++) {
      sum += values[Math.floor(random() * values.length)];
    }
    bootstrap[iteration] = sum / values.length;
  }
  bootstrap.sort((left, right) => left - right);
  return {
    n: values.length,
    mean: average(values),
    median: median(values),
    positiveRate: values.filter((value) => value > 0).length / values.length,
    meanCi95: [bootstrap[500], bootstrap[19500]],
  };
}

function sign(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function screenEvents(scoreboard) {
  const candidates = [];
  for (const pattern of scoreboard.data) {
    for (const [horizon, result] of Object.entries(pattern.horizons)) {
      const intervalExcludesZero = result.ci95_points[0] > 0 || result.ci95_points[1] < 0;
      const halvesAgree = sign(result.halves_points[0]) === sign(result.halves_points[1])
        && sign(result.halves_points[0]) === sign(result.edge_points);
      const halvesMaterial = result.halves_points.every((value) => Math.abs(value) >= 2);
      if (result.n >= 100 && Math.abs(result.edge_points) >= 2 && intervalExcludesZero && halvesAgree && halvesMaterial) {
        candidates.push({
          kind: pattern.kind,
          horizon,
          n: result.n,
          edgePoints: result.edge_points,
          ci95Points: result.ci95_points,
          halvesPoints: result.halves_points,
        });
      }
    }
  }
  return {
    patterns: scoreboard.data.length,
    tests: scoreboard.data.reduce((sum, pattern) => sum + Object.keys(pattern.horizons).length, 0),
    candidates,
  };
}

function analyzeListings(payload) {
  const deduplicated = new Map();
  for (const event of payload.data) {
    if (!Number.isFinite(event.move?.["1d"]) || !Number.isFinite(event.move?.["30d"])) continue;
    const key = `${event.date}:${event.token}`;
    if (!deduplicated.has(key)) deduplicated.set(key, event);
  }
  const rows = [...deduplicated.values()];
  const firstDay = rows.map((event) => event.move["1d"] - ROUND_TRIP_COST);
  const postDayOneShort = rows.map((event) => {
    const underlying = (1 + event.move["30d"]) / (1 + event.move["1d"]) - 1;
    return -underlying - ROUND_TRIP_COST;
  });
  return {
    firstDayLongNet: summarize(firstDay),
    postDayOneShortNet: summarize(postDayOneShort),
  };
}

function analyzeFeeSurges(payload) {
  const deduplicated = new Map();
  for (const event of payload.data) {
    if (!Number.isFinite(event.move?.["1d"]) || !Number.isFinite(event.move?.["30d"])) continue;
    const key = `${event.date}:${event.token}`;
    if (!deduplicated.has(key)) deduplicated.set(key, event);
  }
  const rows = [...deduplicated.values()]
    .map((event) => ({
      date: event.date,
      value: (1 + event.move["30d"]) / (1 + event.move["1d"]) - 1 - ROUND_TRIP_COST,
      vsBtc: event.vs_btc_30d,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
  const middle = Math.floor(rows.length / 2);
  return {
    all: summarize(rows.map((row) => row.value)),
    early: summarize(rows.slice(0, middle).map((row) => row.value), 20261012),
    late: summarize(rows.slice(middle).map((row) => row.value), 20261013),
    vsBtcFromEventDate: summarize(rows.map((row) => row.vsBtc).filter(Number.isFinite), 20261014),
  };
}

const [scoreboard, listings, feeSurges] = await Promise.all([
  getJson(SCOREBOARD_URL),
  getJson(LISTING_URL),
  getJson(FEES_URL),
]);

const result = {
  generatedAt: new Date().toISOString(),
  sources: [SCOREBOARD_URL, LISTING_URL, FEES_URL],
  attribution: { text: "Data: PatternPlus", url: "https://pattern.plus" },
  eventScreen: screenEvents(scoreboard),
  perpetualListings: analyzeListings(listings),
  protocolFeeSurges: analyzeFeeSurges(feeSurges),
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
