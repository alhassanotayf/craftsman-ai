"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { CATEGORIES } from "@/lib/types";

type AnalysisResult = {
  category?: string;
  priority?: "normal" | "urgent";
  confidence?: number;
  reasoning?: string;
  [key: string]: any;
};

export default function HomePage() {
  const { language } = useLanguage();
  const ar = language === "ar";

  const [text, setText] = useState("");

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedPriority, setSelectedPriority] =
    useState<"normal" | "urgent">("normal");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const maxLength = 1000;

  /*
   * Get category label
   */
  function getCategoryLabel(category?: string) {
    const found = CATEGORIES.find(
      (item: any) => item.value === category
    );

    if (!found) {
      return category || (ar ? "غير محدد" : "Not specified");
    }

    return ar
      ? found.labelAr ||
          found.label ||
          found.value
      : found.labelEn ||
          found.label ||
          found.value;
  }

  /*
   * ANALYZE PROBLEM
   */
  async function analyzeProblem() {
    const cleanText = text.trim();

    if (!cleanText) {
      setError(
        ar
          ? "يرجى كتابة وصف المشكلة أولاً."
          : "Please enter a problem description first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);

    try {
      /*
       * Send text to API
       */
      const response = await fetch(
        "/api/classify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          /*
           * IMPORTANT:
           * classify/route.ts expects "text"
           */
          body: JSON.stringify({
            text: cleanText,
          }),
        }
      );

      const data = await response.json();

      console.log("CLASSIFY API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (ar
              ? "فشل تحليل المشكلة."
              : "Problem analysis failed.")
        );
      }

      /*
       * YOUR API RETURNS:
       *
       * {
       *   items: [...]
       * }
       *
       * So we MUST read items[0]
       */
      const analysis =
        data?.items?.[0] ||
        data?.result ||
        data?.classification ||
        null;

      console.log("ANALYSIS RESULT:", analysis);

      if (!analysis) {
        throw new Error(
          ar
            ? "لم يتم استلام نتيجة التحليل."
            : "No analysis result was received."
        );
      }

      /*
       * Save complete result
       */
      setResult(analysis);

      /*
       * Automatically select AI category
       */
      if (analysis.category) {
        setSelectedCategory(
          analysis.category
        );
      } else {
        setSelectedCategory("");
      }

      /*
       * Automatically select AI priority
       */
      if (analysis.priority === "urgent") {
        setSelectedPriority("urgent");
      } else {
        setSelectedPriority("normal");
      }
    } catch (err: any) {
      console.error(
        "CLASSIFICATION ERROR:",
        err
      );

      setError(
        err?.message ||
          (ar
            ? "حدث خطأ أثناء تحليل المشكلة."
            : "An error occurred while analyzing the problem.")
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * SAVE REQUEST
   */
  async function saveRequest() {
    if (!text.trim()) {
      setError(
        ar
          ? "اكتب وصف المشكلة أولاً."
          : "Please enter a problem description."
      );
      return;
    }

    if (!selectedCategory) {
      setError(
        ar
          ? "يرجى اختيار نوع الخدمة."
          : "Please select a service type."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(
        "/api/requests",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            items: [
              {
                description:
                  text.trim(),

                category:
                  selectedCategory,

                priority:
                  selectedPriority,
              },
            ],
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (ar
              ? "فشل حفظ الطلب."
              : "Failed to save request.")
        );
      }

      setSaved(true);
    } catch (err: any) {
      console.error(
        "SAVE ERROR:",
        err
      );

      setError(
        err?.message ||
          (ar
            ? "حدث خطأ أثناء حفظ الطلب."
            : "An error occurred while saving the request.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="hero-grid relative overflow-hidden rounded-[30px] border border-slate-200 bg-white/90 p-7 shadow-sm sm:p-10">

        <div className="relative z-10 max-w-4xl">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f2a51a]/30 bg-[#fff7e6] px-4 py-2 text-xs font-bold text-[#a96800]">

            <span className="h-2 w-2 rounded-full bg-[#f2a51a]" />

            Craftsman AI

          </div>

          <h1 className="text-3xl font-black leading-tight text-[#173743] sm:text-5xl">

            {ar
              ? "حوّل وصف المشكلة إلى طلب صيانة ذكي"
              : "Turn a Problem Description into a Smart Service Request"}

          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">

            {ar
              ? "اكتب المشكلة كما تصفها لفريق الصيانة، وسيتم تحليلها واقتراح نوع الخدمة والأولوية."
              : "Describe the issue as you would tell the maintenance team. The system will analyze it and suggest the service type and priority."}

          </p>

        </div>

      </section>


      {/* ================================================= */}
      {/* NEW ANALYSIS */}
      {/* ================================================= */}

      <section className="rounded-[30px] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">

        <div className="mb-7">

          <div className="mb-2 inline-flex rounded-full bg-[#173743]/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#173743]">

            Analysis

          </div>

          <h2 className="text-2xl font-black text-[#173743] sm:text-3xl">

            {ar
              ? "تحليل مشكلة جديدة"
              : "Analyze a New Problem"}

          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-500">

            {ar
              ? "صف المشكلة بالتفصيل للحصول على تصنيف أدق."
              : "Describe the problem in detail for a more accurate classification."}

          </p>

        </div>


        {/* ================================================= */}
        {/* TEXT AREA */}
        {/* ================================================= */}

        <div className="relative">

          <textarea
            value={text}
            onChange={(e) => {
              setText(
                e.target.value.slice(
                  0,
                  maxLength
                )
              );

              setError("");
              setSaved(false);
            }}
            maxLength={maxLength}
            dir={ar ? "rtl" : "ltr"}
            placeholder={
              ar
                ? "مثال: المكيف لا يعمل ويصدر صوتاً مرتفعاً عند تشغيله..."
                : "Example: The air conditioner is not working and makes a loud noise when turned on..."
            }
            className="min-h-[300px] w-full resize-none rounded-[24px] border border-slate-200 bg-white p-6 text-lg leading-9 text-[#173743] outline-none transition placeholder:text-slate-400 focus:border-[#f2a51a] focus:ring-4 focus:ring-[#f2a51a]/10"
          />

          <div
            className={`absolute bottom-5 ${
              ar
                ? "left-6"
                : "right-6"
            } text-xs font-medium text-slate-500`}
          >

            {text.length} / {maxLength}

          </div>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div
            dir={ar ? "rtl" : "ltr"}
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >

            {error}

          </div>

        )}


        {/* ================================================= */}
        {/* ANALYZE BUTTON */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={analyzeProblem}
          disabled={
            loading ||
            !text.trim()
          }
          className="primary-button mt-6 w-full"
        >

          {loading ? (

            <>

              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#173743]/30 border-t-[#173743]" />

              {ar
                ? "جاري تحليل المشكلة..."
                : "Analyzing problem..."}

            </>

          ) : (

            <>

              <span className="text-xl">
                ✦
              </span>

              {ar
                ? "تحليل المشكلة"
                : "Analyze Problem"}

            </>

          )}

        </button>

      </section>


      {/* ================================================= */}
      {/* ANALYSIS RESULT */}
      {/* ================================================= */}

      {result && (

        <section
          dir={ar ? "rtl" : "ltr"}
          className="rounded-[30px] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8"
        >

          {/* RESULT HEADER */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 inline-flex rounded-full bg-[#173743]/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#173743]">

                Analysis Result

              </div>

              <h2 className="text-2xl font-black text-[#173743] sm:text-3xl">

                {ar
                  ? "نتيجة التحليل"
                  : "Analysis Result"}

              </h2>

            </div>


            {/* CONFIDENCE */}

            {typeof result.confidence ===
              "number" && (

              <div className="rounded-full bg-[#f2a51a]/15 px-4 py-2 text-sm font-bold text-[#8b5b00]">

                {ar
                  ? "الثقة"
                  : "Confidence"}

                {" "}

                {Math.round(
                  result.confidence <= 1
                    ? result.confidence *
                        100
                    : result.confidence
                )}
                %

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* SERVICE TYPE */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <label className="block text-sm font-bold text-slate-500">

              {ar
                ? "نوع الخدمة"
                : "Service Type"}

            </label>


            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-lg font-bold text-[#173743] outline-none transition focus:border-[#f2a51a] focus:ring-4 focus:ring-[#f2a51a]/10"
            >

              <option value="">

                {ar
                  ? "اختر نوع الخدمة"
                  : "Select service type"}

              </option>


              {CATEGORIES.map(
                (item: any) => (

                  <option
                    key={item.value}
                    value={item.value}
                  >

                    {ar
                      ? item.labelAr ||
                        item.label ||
                        item.value
                      : item.labelEn ||
                        item.label ||
                        item.value}

                  </option>

                )
              )}

            </select>


            {/* AI SUGGESTION */}

            {result.category && (

              <div className="mt-3 text-xs font-medium text-slate-400">

                {ar
                  ? "اقتراح الذكاء الاصطناعي:"
                  : "AI suggestion:"}

                {" "}

                <span className="font-bold text-[#173743]">

                  {getCategoryLabel(
                    result.category
                  )}

                </span>

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* PRIORITY */}
          {/* ================================================= */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <label className="block text-sm font-bold text-slate-500">

              {ar
                ? "الأولوية"
                : "Priority"}

            </label>


            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(
                  e.target.value as
                    | "normal"
                    | "urgent"
                )
              }
              className={`mt-3 w-full rounded-xl border bg-white px-4 py-4 text-lg font-bold outline-none transition focus:ring-4 ${
                selectedPriority ===
                "urgent"
                  ? "border-red-200 text-red-600 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 text-[#173743] focus:border-[#f2a51a] focus:ring-[#f2a51a]/10"
              }`}
            >

              <option value="normal">

                {ar
                  ? "عادي"
                  : "Normal"}

              </option>

              <option value="urgent">

                {ar
                  ? "عاجل"
                  : "Urgent"}

              </option>

            </select>


            {/* AI PRIORITY */}

            <div className="mt-3 text-xs font-medium text-slate-400">

              {ar
                ? "اقتراح الذكاء الاصطناعي:"
                : "AI suggestion:"}

              {" "}

              <span className="font-bold text-[#173743]">

                {result.priority ===
                "urgent"
                  ? ar
                    ? "عاجل"
                    : "Urgent"
                  : ar
                  ? "عادي"
                  : "Normal"}

              </span>

            </div>

          </div>


          {/* ================================================= */}
          {/* REASONING */}
          {/* ================================================= */}

          {result.reasoning && (

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">

                {ar
                  ? "تفاصيل التحليل"
                  : "Analysis Details"}

              </div>

              <p className="mt-3 leading-8 text-slate-600">

                {result.reasoning}

              </p>

            </div>

          )}


          {/* ================================================= */}
          {/* SAVE */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={saveRequest}
            disabled={
              saving ||
              saved ||
              !selectedCategory
            }
            className="primary-button mt-6 w-full"
          >

            {saving

              ? ar
                ? "جاري الحفظ..."
                : "Saving..."

              : saved
              ? ar
                ? "✓ تم حفظ الطلب"
                : "✓ Request Saved"

              : ar
              ? "حفظ كطلب صيانة"
              : "Save as Service Request"}

          </button>


          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {saved && (

            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-semibold text-emerald-700">

              {ar
                ? "تم حفظ الطلب بنجاح ويمكنك رؤيته في صفحة الطلبات."
                : "Request saved successfully. You can view it on the Requests page."}

            </div>

          )}

        </section>

      )}


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="py-5 text-center">

        <div className="text-xs font-bold tracking-[0.3em] text-[#173743]">

          CRAFTSMAN AI

        </div>

        <div className="mt-2 text-xs text-slate-400">

          Engineering Dimensions

        </div>

      </div>

    </div>
  );
}