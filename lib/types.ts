export type Category =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "ac"
  | "insulation"
  | "flooring"
  | "other";

export type Priority = "normal" | "urgent";

export interface CategoryMeta {
  value: Category;
  labelEn: string;
  labelAr: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { value: "plumbing", labelEn: "Plumbing", labelAr: "سباكة" },
  { value: "electrical", labelEn: "Electrical", labelAr: "كهرباء" },
  { value: "carpentry", labelEn: "Carpentry", labelAr: "نجارة" },
  { value: "ac", labelEn: "AC / Cooling", labelAr: "تكييف" },
  { value: "insulation", labelEn: "Insulation", labelAr: "عزل" },
  { value: "flooring", labelEn: "Flooring", labelAr: "أرضيات" },
  { value: "other", labelEn: "Other", labelAr: "أخرى" },
];

// A single classified problem, split out from the user's raw text if needed.
export interface ClassifiedItem {
  description: string;
  category: Category;
  priority: Priority;
  confidence: number; // 0-1, informational only, not shown as a hard guarantee
}

// A saved, submitted request (after the user has confirmed / edited it).
export interface ServiceRequest {
  id: string;
  description: string;
  category: Category;
  priority: Priority;
  createdAt: string; // ISO date string
  groupId: string; // requests that were split from the same submission share this
}
