import fs from "fs";
import path from "path";
import { ServiceRequest } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "requests.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

export function getAllRequests(): ServiceRequest[] {
  ensureStore();

  const raw = fs.readFileSync(DATA_FILE, "utf-8");

  try {
    const parsed = JSON.parse(raw) as ServiceRequest[];

    // Newest first
    return parsed.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );
  } catch {
    return [];
  }
}

export function saveRequests(
  newOnes: ServiceRequest[]
): ServiceRequest[] {
  ensureStore();

  const existing = getAllRequests();
  const combined = [...existing, ...newOnes];

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(combined, null, 2),
    "utf-8"
  );

  return combined;
}

// Delete ALL requests
export function clearAllRequests(): void {
  ensureStore();

  fs.writeFileSync(
    DATA_FILE,
    "[]",
    "utf-8"
  );
}