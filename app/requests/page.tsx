"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { CATEGORIES, ServiceRequest } from "@/lib/types";

type Filter = "all" | "urgent" | "normal";

export default function RequestsPage() {
  const { language } = useLanguage();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isArabic = language === "ar";

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);

      const response = await fetch("/api/requests");
      const data = await response.json();

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    const message = isArabic
      ? "هل أنت متأكد من حذف جميع الطلبات؟\n\nلا يمكن التراجع عن هذا الإجراء."
      : "Are you sure you want to delete all requests?\n\nThis action cannot be undone.";

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    try {
      setDeleting(true);

      const response = await fetch("/api/requests", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete requests");
      }

      setRequests([]);

      alert(
        isArabic
          ? "تم حذف جميع الطلبات بنجاح."
          : "All requests have been deleted successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        isArabic
          ? "حدث خطأ أثناء حذف الطلبات."
          : "An error occurred while deleting the requests."
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredRequests = requests.filter((request) => {
    if (filter === "urgent") {
      return request.priority === "urgent";
    }

    if (filter === "normal") {
      return request.priority === "normal";
    }

    return true;
  });

  const urgentCount = requests.filter(
    (request) => request.priority === "urgent"
  ).length;

  const normalCount = requests.filter(
    (request) => request.priority === "normal"
  ).length;

  function getCategoryLabel(category: string) {
    const found = CATEGORIES.find(
      (item) => item.value === category
    );

    if (!found) return category;

    if (isArabic) {
      return found.labelAr;
    }

    return found.labelEn;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
      isArabic ? "ar-SA" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <main className="space-y-8">

      {/* Header */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f2a51a]">
            {isArabic ? "سجل الصيانة" : "Maintenance Register"}
          </div>

          <h1 className="text-3xl font-bold text-[#173743] md:text-4xl">
            {isArabic ? "الطلبات" : "Service Requests"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667782]">
            {isArabic
              ? "إدارة ومتابعة جميع طلبات الصيانة التي تم تحليلها وحفظها."
              : "Manage and monitor all analyzed and saved maintenance requests."}
          </p>
        </div>

        {/* Delete All Button */}
        {requests.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-lg">🗑️</span>

            {deleting
              ? isArabic
                ? "جاري الحذف..."
                : "Deleting..."
              : isArabic
                ? "مسح جميع الطلبات"
                : "Delete All Requests"}
          </button>
        )}
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-[#667782]">
            {isArabic ? "إجمالي الطلبات" : "Total Requests"}
          </div>

          <div className="mt-2 text-3xl font-bold text-[#173743]">
            {requests.length}
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-[#667782]">
            {isArabic ? "طلبات عاجلة" : "Urgent"}
          </div>

          <div className="mt-2 text-3xl font-bold text-red-600">
            {urgentCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-[#667782]">
            {isArabic ? "طلبات عادية" : "Normal"}
          </div>

          <div className="mt-2 text-3xl font-bold text-[#173743]">
            {normalCount}
          </div>
        </div>

      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3">

        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            filter === "all"
              ? "bg-[#173743] text-white shadow-sm"
              : "border border-slate-200 bg-white text-[#667782] hover:bg-slate-50"
          }`}
        >
          {isArabic ? "الكل" : "All"}
        </button>

        <button
          type="button"
          onClick={() => setFilter("urgent")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            filter === "urgent"
              ? "bg-red-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-[#667782] hover:bg-slate-50"
          }`}
        >
          {isArabic ? "عاجل" : "Urgent"}
        </button>

        <button
          type="button"
          onClick={() => setFilter("normal")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            filter === "normal"
              ? "bg-[#173743] text-white shadow-sm"
              : "border border-slate-200 bg-white text-[#667782] hover:bg-slate-50"
          }`}
        >
          {isArabic ? "عادي" : "Normal"}
        </button>

      </section>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-sm text-[#667782]">
            {isArabic
              ? "جاري تحميل الطلبات..."
              : "Loading requests..."}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRequests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            📋
          </div>

          <h2 className="text-xl font-bold text-[#173743]">
            {isArabic
              ? "لا توجد طلبات"
              : "No requests found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667782]">
            {isArabic
              ? "ابدأ بتحليل مشكلة جديدة باستخدام الذكاء الاصطناعي، ثم احفظ الطلب ليظهر هنا."
              : "Analyze a new issue using AI and save the request to see it here."}
          </p>

        </div>
      )}

      {/* Requests */}
      {!loading && filteredRequests.length > 0 && (
        <section className="space-y-4">

          {filteredRequests.map((request) => (

            <article
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                {/* Main Content */}
                <div className="min-w-0 flex-1">

                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    {/* Category */}
                    <span className="rounded-lg bg-[#173743]/10 px-3 py-1.5 text-xs font-bold text-[#173743]">
                      🔧 {getCategoryLabel(request.category)}
                    </span>

                    {/* Priority */}
                    {request.priority === "urgent" ? (
                      <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                        🚨 {isArabic ? "عاجل" : "Urgent"}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#667782]">
                        {isArabic ? "عادي" : "Normal"}
                      </span>
                    )}

                  </div>

                  {/* Description */}
                  <p className="text-base font-semibold leading-7 text-[#173743]">
                    {request.description}
                  </p>

                  {/* Date */}
                  <div className="mt-4 text-xs text-[#667782]">
                    {isArabic ? "تاريخ الطلب: " : "Created: "}
                    {formatDate(request.createdAt)}
                  </div>

                </div>

                {/* Request ID */}
                <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-3 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#667782]">
                    ID
                  </div>

                  <div className="mt-1 max-w-[180px] truncate font-mono text-xs text-[#173743]">
                    {request.id}
                  </div>
                </div>

              </div>

            </article>

          ))}

        </section>
      )}

    </main>
  );
}