import { Category, ClassifiedItem, Priority } from "./types";

/**
 * Craftsman AI
 * Gemini-powered problem classification
 *
 * API key:
 * GEMINI_API_KEY
 *
 * The API key is only used on the server.
 */

/* ============================================================================
 * MAIN ENTRY POINT
 * ========================================================================== */

export async function classifyProblem(
  rawText: string
): Promise<ClassifiedItem[]> {
  const text = rawText.trim();

  if (!text) return [];

  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  console.log("==========================================");
  console.log("🧠 Craftsman AI classification started");
  console.log("Gemini API key found:", hasGeminiKey);
  console.log("==========================================");

  if (hasGeminiKey) {
    try {
      console.log("🤖 Gemini AI: analyzing problem...");

      const result = await classifyWithGemini(text);

      console.log("✅ Gemini AI: analysis successful");
      console.log("📊 Gemini result:", result);
      console.log("==========================================");

      return result;
    } catch (err) {
      console.error("❌ Gemini AI failed:", err);
      console.log("⚠️ Falling back to local Mock classifier");
      console.log("==========================================");

      return classifyWithMock(text);
    }
  }

  console.log("⚠️ GEMINI_API_KEY not found");
  console.log("⚠️ Using local Mock classifier");
  console.log("==========================================");

  return classifyWithMock(text);
}

/* ============================================================================
 * MOCK CLASSIFIER
 * ========================================================================== */

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  plumbing: [
    "leak",
    "pipe",
    "faucet",
    "tap",
    "sink",
    "toilet",
    "drain",
    "water heater",
    "sewage",
    "water",
    "flood",
    "flooding",

    "تسريب",
    "سباك",
    "سباكة",
    "مواسير",
    "ماسورة",
    "حنفية",
    "صنبور",
    "مغسلة",
    "مرحاض",
    "صرف",
    "مجاري",
    "سخان",
    "مويه",
    "مياه",
    "غرق",
  ],

  electrical: [
    "electric",
    "electricity",
    "power",
    "outlet",
    "socket",
    "wire",
    "wiring",
    "breaker",
    "fuse",
    "short circuit",
    "spark",
    "light",
    "bulb",
    "switch",

    "كهرباء",
    "كهربائي",
    "كهرباء مقطوعة",
    "سلك",
    "أسلاك",
    "قاطع",
    "فيوز",
    "دائرة قصر",
    "شرارة",
    "إضاءة",
    "لمبة",
    "مفتاح كهرباء",
    "مقبس",
    "فيشة",
  ],

  ac: [
    "ac ",
    "a/c",
    "air condition",
    "air conditioner",
    "cooling",
    "compressor",
    "thermostat",
    "hvac",
    "freon",
    "cold air",
    "not cooling",

    "تكييف",
    "مكيف",
    "مبرد",
    "كمبروسر",
    "ثيرموستات",
    "تبريد",
    "برودة",
  ],

  carpentry: [
    "door",
    "window frame",
    "cabinet",
    "wood",
    "carpenter",
    "furniture",
    "shelf",
    "hinge",
    "wardrobe",

    "نجار",
    "نجارة",
    "باب",
    "خزانة",
    "خشب",
    "رف",
    "مفصلة",
    "دولاب",
  ],

  insulation: [
    "insulation",
    "roof leak",
    "waterproofing",
    "damp",
    "moisture",
    "mold",

    "عزل",
    "عزل مائي",
    "رطوبة",
    "تسرب سطح",
    "عزل حراري",
    "فطريات",
  ],

  flooring: [
    "floor",
    "tile",
    "tiles",
    "parquet",
    "marble",
    "flooring",

    "أرضية",
    "أرضيات",
    "بلاط",
    "رخام",
    "باركيه",
    "سيراميك",
  ],

  other: [],
};

const URGENT_KEYWORDS = [
  "flooding",
  "flood",
  "no water",
  "no power",
  "power out",
  "power is out",
  "electricity is out",
  "electricity out",
  "gas smell",
  "smoke",
  "fire",
  "spark",
  "sparks",
  "sparking",
  "leaking badly",
  "emergency",
  "urgent",
  "immediately",
  "can't",
  "cannot",
  "dangerous",

  "غرق",
  "يغرق",
  "طارئ",
  "عاجل",
  "حريق",
  "شرارة",
  "رائحة غاز",
  "خطر",
  "الآن",
  "مافي مويه",
  "مافي كهرباء",
  "منقطع",
  "مقطوعة",
  "تسرب غاز",
];

const SPLIT_CONNECTORS = [
  " and also ",
  " and ",
  " as well as ",
  " also ",
  "; ",
  " و ",
  " وكذلك ",
  " وأيضا ",
  " وأيضاً ",
  "؛ ",
];

/* ============================================================================
 * MOCK HELPERS
 * ========================================================================== */

function scoreCategory(
  segment: string
): { category: Category; score: number } {
  const lower = segment.toLowerCase();

  let best: Category = "other";
  let bestScore = 0;

  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((cat) => {
    if (cat === "other") return;

    const hits = CATEGORY_KEYWORDS[cat].filter((keyword) =>
      lower.includes(keyword.toLowerCase())
    );

    if (hits.length > bestScore) {
      bestScore = hits.length;
      best = cat;
    }
  });

  return {
    category: best,
    score: bestScore,
  };
}

function scorePriority(segment: string): Priority {
  const lower = segment.toLowerCase();

  const isUrgent = URGENT_KEYWORDS.some((keyword) =>
    lower.includes(keyword.toLowerCase())
  );

  return isUrgent ? "urgent" : "normal";
}

function splitIntoSegments(text: string): string[] {
  let candidates = [text];

  for (const connector of SPLIT_CONNECTORS) {
    const next: string[] = [];

    for (const piece of candidates) {
      if (
        piece
          .toLowerCase()
          .includes(connector.trim().toLowerCase())
      ) {
        next.push(...piece.split(new RegExp(connector, "i")));
      } else {
        next.push(piece);
      }
    }

    candidates = next;
  }

  candidates = candidates
    .map((candidate) => candidate.trim())
    .filter((candidate) => candidate.length > 3);

  if (candidates.length <= 1) {
    return [text];
  }

  const distinctCategories = new Set(
    candidates.map(
      (candidate) => scoreCategory(candidate).category
    )
  );

  if (distinctCategories.size <= 1) {
    return [text];
  }

  return candidates;
}

/* ============================================================================
 * MOCK CLASSIFIER
 * ========================================================================== */

function classifyWithMock(text: string): ClassifiedItem[] {
  console.log("🔧 Mock classifier running...");

  const segments = splitIntoSegments(text);

  const result = segments.map((segment) => {
    const { category, score } = scoreCategory(segment);

    const priority = scorePriority(segment);

    const confidence =
      category === "other"
        ? 0.3
        : Math.min(0.55 + score * 0.15, 0.95);

    return {
      description: segment,
      category,
      priority,
      confidence,
    };
  });

  console.log("🔧 Mock result:", result);

  return result;
}

/* ============================================================================
 * GEMINI SYSTEM PROMPT
 * ========================================================================== */

const SYSTEM_PROMPT = `
You are Craftsman AI, an intelligent service-triage assistant
for Engineering Dimensions.

The application connects customers with professional craftsmen.

The user may describe one or more maintenance problems in:

- Arabic
- English
- informal language
- mixed Arabic and English

Analyze the meaning of the complete problem.

For every DISTINCT problem:

1. Identify the service category.

Allowed categories ONLY:

- plumbing
- electrical
- carpentry
- ac
- insulation
- flooring
- other

2. Determine priority.

Use "urgent" when the problem involves:

- flooding
- serious water leakage
- no water
- no electricity
- electrical danger
- fire
- smoke
- gas smell
- dangerous situation
- another immediate safety or utility issue

Use "normal" for routine maintenance.

3. Create a short description of the problem.

Keep the description in the same language used by the customer.

4. Provide confidence from 0 to 1.

Important:

- Understand the meaning, not just keywords.
- Arabic and English are both supported.
- Do not unnecessarily split one problem.
- If there are multiple genuinely different problems,
  return multiple items.

Examples:

"المكيف ما يبرد"

should be:

category = "ac"

"فيه تسريب من الحنفية"

should be:

category = "plumbing"

"الكهرباء طافية بالكامل"

should be:

category = "electrical"
priority = "urgent"

Return ONLY valid JSON.
No markdown.
No explanation.

Required format:

[
  {
    "description": "short description",
    "category": "plumbing",
    "priority": "normal",
    "confidence": 0.95
  }
]
`;

/* ============================================================================
 * GEMINI API
 * ========================================================================== */

async function classifyWithGemini(
  text: string
): Promise<ClassifiedItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = "gemini-3.8-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${model}:generateContent`;

  console.log("📡 Sending request to Gemini...");
  console.log("🤖 Model:", model);

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },

    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text,
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,

        responseMimeType: "application/json",

        responseSchema: {
          type: "array",

          items: {
            type: "object",

            properties: {
              description: {
                type: "string",
              },

              category: {
                type: "string",

                enum: [
                  "plumbing",
                  "electrical",
                  "carpentry",
                  "ac",
                  "insulation",
                  "flooring",
                  "other",
                ],
              },

              priority: {
                type: "string",

                enum: [
                  "normal",
                  "urgent",
                ],
              },

              confidence: {
                type: "number",
              },
            },

            required: [
              "description",
              "category",
              "priority",
              "confidence",
            ],
          },
        },
      },
    }),
  });

  console.log("📡 Gemini HTTP status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("❌ Gemini API response:", errorText);

    throw new Error(
      `Gemini API error: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  console.log("✅ Gemini API responded successfully");

  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text ?? "")
      .join("")
      .trim() ?? "";

  if (!content) {
    console.error(
      "❌ Gemini returned no text",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      "Gemini returned an empty response"
    );
  }

  console.log("🧠 Gemini raw response:", content);

  return parseModelJson(content);
}

/* ============================================================================
 * JSON PARSER
 * ========================================================================== */

function parseModelJson(
  raw: string
): ClassifiedItem[] {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Gemini did not return a JSON array"
    );
  }

  return parsed.map((item) => ({
    description: String(
      item?.description ?? ""
    ).trim(),

    category: (
      CATEGORY_KEYWORDS[
        item?.category as Category
      ] !== undefined
        ? item.category
        : "other"
    ) as Category,

    priority:
      item?.priority === "urgent"
        ? "urgent"
        : "normal",

    confidence:
      typeof item?.confidence === "number"
        ? Math.max(
            0,
            Math.min(1, item.confidence)
          )
        : 0.7,
  }));
}