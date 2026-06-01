import type { Type } from "@google/genai";
import { createGoogleGenAIClient } from "@/app/lib/googleGenAICompat";

type ActivityLevelValue =
  | "RELAXED_HOMEBODY"
  | "CASUAL_MOVER"
  | "PRETTY_ACTIVE"
  | "FITNESS_BEAST";

type IdentityValue = "Male" | "Female" | "Other";

export interface NutritionRecommendation {
  calorieIntake: number;
  proteinIntake: number;
  carbohydrateIntake: number;
  fatIntake: number;
  waterIntakeLiters: number;
}

interface NutritionProfileInput {
  age: number | null;
  height: number | null;
  weight: number | null;
  identity: IdentityValue | null;
  mainGoals: string[];
  averageSleep: string | null;
  activityLevel: ActivityLevelValue | null;
  dietaryApproaches: string[];
  biggestChallenges: string[];
  preferredWorkouts: string[];
  fitnessSuperpower: string | null;
}

const NUTRITION_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return createGoogleGenAIClient(apiKey);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryGeminiError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const status = "status" in error ? Number(error.status) : undefined;

  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function normalizeNutritionRecommendation(
  value: Partial<NutritionRecommendation>
): NutritionRecommendation | null {
  const calorieIntake = Number(value.calorieIntake);
  const proteinIntake = Number(value.proteinIntake);
  const carbohydrateIntake = Number(value.carbohydrateIntake);
  const fatIntake = Number(value.fatIntake);
  const waterIntakeLiters = Number(value.waterIntakeLiters);

  if (
    !Number.isFinite(calorieIntake) ||
    !Number.isFinite(proteinIntake) ||
    !Number.isFinite(carbohydrateIntake) ||
    !Number.isFinite(fatIntake) ||
    !Number.isFinite(waterIntakeLiters)
  ) {
    return null;
  }

  return {
    calorieIntake: Math.max(1200, Math.round(calorieIntake)),
    proteinIntake: Math.max(40, Math.round(proteinIntake)),
    carbohydrateIntake: Math.max(50, Math.round(carbohydrateIntake)),
    fatIntake: Math.max(20, Math.round(fatIntake)),
    waterIntakeLiters: Math.max(1.5, Number(waterIntakeLiters.toFixed(1))),
  };
}

function calculateFallbackNutrition(profile: NutritionProfileInput): NutritionRecommendation {
  const weight = profile.weight ?? 70;
  const height = profile.height ?? 170;
  const age = profile.age ?? 30;
  const identity = profile.identity ?? "Other";

  const baseBmr =
    identity === "Male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : identity === "Female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age - 78;

  const activityMultiplierMap: Record<ActivityLevelValue, number> = {
    RELAXED_HOMEBODY: 1.2,
    CASUAL_MOVER: 1.375,
    PRETTY_ACTIVE: 1.55,
    FITNESS_BEAST: 1.725,
  };

  const activityMultiplier = profile.activityLevel
    ? activityMultiplierMap[profile.activityLevel]
    : 1.375;

  let calorieTarget = baseBmr * activityMultiplier;
  const goals = profile.mainGoals.join(" ").toLowerCase();

  if (goals.includes("lose") || goals.includes("fat")) {
    calorieTarget -= 350;
  } else if (goals.includes("gain") || goals.includes("bulk") || goals.includes("muscle")) {
    calorieTarget += 250;
  }

  const proteinTarget = weight * (goals.includes("muscle") ? 2 : 1.7);
  const fatTarget = (calorieTarget * 0.28) / 9;
  const carbTarget = (calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4;
  const workoutBonus =
    profile.activityLevel === "FITNESS_BEAST"
      ? 0.9
      : profile.activityLevel === "PRETTY_ACTIVE"
        ? 0.6
        : 0.3;
  const waterTarget = weight * 0.035 + workoutBonus;

  return normalizeNutritionRecommendation({
    calorieIntake: calorieTarget,
    proteinIntake: proteinTarget,
    carbohydrateIntake: carbTarget,
    fatIntake: fatTarget,
    waterIntakeLiters: waterTarget,
  })!;
}

export async function generateResponse(prompt: string) {
  const ai = await getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

export async function generateNutritionRecommendation(
  profile: NutritionProfileInput
): Promise<{ data: NutritionRecommendation; source: "gemini" | "fallback" }> {
  const ai = await getGeminiClient();
  const prompt = `Based on the following user information, provide nutritional recommendations in JSON format exactly as specified:
User Data:
- Age: ${profile.age}
- Height: ${profile.height}
- Weight: ${profile.weight}
- Identity: ${profile.identity}
- Main Goals: ${profile.mainGoals.join(", ")}
- Average Sleep: ${profile.averageSleep}
- Activity Level: ${profile.activityLevel}
- Dietary Approaches: ${profile.dietaryApproaches.join(", ")}
- Biggest Challenges: ${profile.biggestChallenges.join(", ")}
- Preferred Workouts: ${profile.preferredWorkouts.join(", ")}
- Fitness Superpower: ${profile.fitnessSuperpower}

Return an array with exactly one object using this schema:
[
  {
    "calorieIntake": number,
    "proteinIntake": number,
    "carbohydrateIntake": number,
    "fatIntake": number,
    "waterIntakeLiters": number
  }
]`;

  for (const model of NUTRITION_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY" as Type,
              items: {
                type: "OBJECT" as Type,
                properties: {
                  calorieIntake: { type: "NUMBER" as Type },
                  proteinIntake: { type: "NUMBER" as Type },
                  carbohydrateIntake: { type: "NUMBER" as Type },
                  fatIntake: { type: "NUMBER" as Type },
                  waterIntakeLiters: { type: "NUMBER" as Type },
                },
                required: [
                  "calorieIntake",
                  "proteinIntake",
                  "carbohydrateIntake",
                  "fatIntake",
                  "waterIntakeLiters",
                ],
              },
            },
          },
        });

        const parsed = JSON.parse(response.text ?? "[]");
        const recommendation = normalizeNutritionRecommendation(parsed?.[0]);

        if (recommendation) {
          return { data: recommendation, source: "gemini" };
        }
      } catch (error) {
        const isRetryable = shouldRetryGeminiError(error);
        const hasAttemptsLeft = attempt < 3;

        if (isRetryable && hasAttemptsLeft) {
          await delay(500 * attempt);
          continue;
        }

        if (!isRetryable) {
          break;
        }
      }
    }
  }

  return {
    data: calculateFallbackNutrition(profile),
    source: "fallback",
  };
}
