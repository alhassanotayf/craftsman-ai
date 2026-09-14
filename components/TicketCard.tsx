"use client";

import { CATEGORIES, Category, ClassifiedItem, Priority } from "@/lib/types";
import { useLanguage } from "./LanguageContext";

interface Props { item: ClassifiedItem; index: number; onChange: (index: number, patch: Partial<ClassifiedItem>) => void; }

export default function TicketCard({ item, index, onChange }: Props) {
  const { language } = useLanguage();
  const ar = language === "ar";
  const urgent = item.priority === "urgent";
  return (
    <div className={`rounded-2xl border bg-white p-4 sm:p-5 ${urgent ? "border-red-200" : "border-slate-200"}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl text-center leading-10 ${urgent ? "bg-red-50 text-red-600" : "bg-[#edf5f6] text-[#2b5d6b]"}`}>{urgent ? "!" : "✓"}</div>
        <div className="min-w-0 flex-1"><p className="text-sm font-medium leading-6 text-[#173743]">{item.description}</p><p className="mt-1 text-[11px] text-slate-400">{ar ? "درجة الثقة" : "Confidence"}: {Math.round(item.confidence * 100)}%</p></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label><span className="mb-1.5 block text-xs font-semibold text-slate-500">{ar ? "نوع الخدمة" : "Service type"}</span><select value={item.category} onChange={(e) => onChange(index, { category: e.target.value as Category })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#173743] focus:border-[#f2a51a] focus:outline-none">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{ar ? c.labelAr : c.labelEn}</option>)}</select></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-slate-500">{ar ? "الأولوية" : "Priority"}</span><select value={item.priority} onChange={(e) => onChange(index, { priority: e.target.value as Priority })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#173743] focus:border-[#f2a51a] focus:outline-none"><option value="normal">{ar ? "عادية" : "Normal"}</option><option value="urgent">{ar ? "عاجلة" : "Urgent"}</option></select></label>
      </div>
    </div>
  );
}
