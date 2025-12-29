import { generateText, generateObject, streamText } from "ai";
import { cacheLife, cacheTag } from "next/cache";
import { Product, ReviewInsights, ReviewInsightsSchema } from "./types";

export async function summarizeReviews(product: Product): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-summary-${product.slug}`);
 
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.stars, 0) /
    product.reviews.length;
  
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
 
  console.log(JSON.stringify({
    event: "ai_request_start",
    requestId,
    function: "summarizeReviews",
    productSlug: product.slug,
    reviewCount: product.reviews.length,
    timestamp: new Date().toISOString(),
  }));
  const prompt = `Write a summary of the reviews for the ${
    product.name
  } product. The product's average rating is ${averageRating} out of 5 stars.
 
Your goal is to highlight the most common themes and sentiments expressed by customers.
If multiple themes are present, try to capture the most important ones.
If no patterns emerge but there is a shared sentiment, capture that instead.
Try to use natural language and keep the summary concise.
Use a maximum of 4 sentences and 30 words.
Don't include any word count or character count.
No need to reference which reviews you're summarizing.
Do not reference the star rating in the summary.
 
Start the summary with "Customers like…" or "Customers mention…"
 
Here are 3 examples of good summaries:
Example 1: Customers like the quality, space, fit and value of the sport equipment bag case. They mention it's heavy duty, has lots of space and pockets, and can fit all their gear. They also appreciate the portability and appearance. That said, some disagree on the zipper.
Example 2: Customers like the quality, ease of installation, and value of the transport rack. They mention that it holds on to everything really well, and is reliable. Some complain about the wind noise, saying it makes a whistling noise at high speeds. Opinions are mixed on fit, and performance.
Example 3: Customers like the quality and value of the insulated water bottle. They say it keeps drinks cold for hours and the lid seals well. Some customers have different opinions on size and durability.
 
Hit the following tone based on rating:
- 1-2 stars: negative
- 3 stars: neutral
- 4-5 stars: positive
 
The customer reviews to summarize are as follows:
${product.reviews
    .map((review, i) => `Review ${i + 1}:\n${review.review}`)
    .join("\n\n")}`;
 
  try {
    const { text, usage } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.75,    
    });

    const duration = Date.now() - startTime;
 
    console.log(JSON.stringify({
      event: "ai_request_success",
      requestId,
      function: "summarizeReviews",
      productSlug: product.slug,
      duration,
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
      totalTokens: usage?.totalTokens,
      timestamp: new Date().toISOString(),
    }));
 
    return text
      .trim()
      .replace(/^"/, "")
      .replace(/"$/, "")
      .replace(/[\[\(]\d+ words[\]\)]/g, "");
  } catch (error) {
    const duration = Date.now() - startTime;
 
    console.error(JSON.stringify({
      event: "ai_request_error",
      requestId,
      function: "summarizeReviews",
      productSlug: product.slug,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }));
 
    throw new Error("Unable to generate review summary. Please try again.");
  }
}

export async function streamReviewSummary(product: Product) {
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.stars, 0) /
    product.reviews.length;
 
  const prompt = `Write a summary of the reviews for the ${
    product.name
  } product. The product's average rating is ${averageRating} out of 5 stars.
 
Your goal is to highlight the most common themes and sentiments expressed by customers.
If multiple themes are present, try to capture the most important ones.
If no patterns emerge but there is a shared sentiment, capture that instead.
Try to use natural language and keep the summary concise.
Use a maximum of 4 sentences and 30 words.
Don't include any word count or character count.
No need to reference which reviews you're summarizing.
Do not reference the star rating in the summary.
 
Start the summary with "Customers like…" or "Customers mention…"
 
Here are 3 examples of good summaries:
Example 1: Customers like the quality, space, fit and value of the sport equipment bag case. They mention it's heavy duty, has lots of space and pockets, and can fit all their gear. They also appreciate the portability and appearance. That said, some disagree on the zipper.
Example 2: Customers like the quality, ease of installation, and value of the transport rack. They mention that it holds on to everything really well, and is reliable. Some complain about the wind noise, saying it makes a whistling noise at high speeds. Opinions are mixed on fit, and performance.
Example 3: Customers like the quality and value of the insulated water bottle. They say it keeps drinks cold for hours and the lid seals well. Some customers have different opinions on size and durability.
 
Hit the following tone based on rating:
- 1-2 stars: negative
- 3 stars: neutral
- 4-5 stars: positive
 
The customer reviews to summarize are as follows:
${product.reviews
    .map((review, i) => `Review ${i + 1}:\n${review.review}`)
    .join("\n\n")}`;
 
  const result = streamText({
    model: "anthropic/claude-sonnet-4-5",
    prompt,
    maxOutputTokens: 1000,
    temperature: 0.75,
  });
 
  return result;
}

export async function streamComparison(productA: Product, productB: Product) {
  const avgA =
    productA.reviews.reduce((acc, r) => acc + r.stars, 0) / productA.reviews.length;
  const avgB =
    productB.reviews.reduce((acc, r) => acc + r.stars, 0) / productB.reviews.length;

  const prompt = `Compare customer reviews for two products and provide a concise, balanced analysis.

Products:
- ${productA.name} (average rating: ${avgA.toFixed(1)}/5)
- ${productB.name} (average rating: ${avgB.toFixed(1)}/5)

Guidelines:
- Highlight similarities and differences in themes, sentiment, and reliability.
- Note where opinions diverge and which use-cases each product fits best.
- Avoid mentioning star ratings directly in the narrative.
- Keep it to 4-6 sentences, clear and neutral.
- Begin with "Compared to each other…".

Reviews for ${productA.name}:
${productA.reviews.map((review, i) => `A${i + 1} (${review.stars}★): ${review.review}`).join("\n")}

Reviews for ${productB.name}:
${productB.reviews.map((review, i) => `B${i + 1} (${review.stars}★): ${review.review}`).join("\n")}`;

  const result = streamText({
    model: "anthropic/claude-sonnet-4-5",
    prompt,
    maxOutputTokens: 1200,
    temperature: 0.7,
  });

  return result;
}

export async function getReviewInsights(product: Product): Promise<ReviewInsights> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-insights-${product.slug}`);
 
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.stars, 0) /
    product.reviews.length;
 
  const prompt = `Analyze the following customer reviews for the ${product.name} product (average rating: ${averageRating}/5).
 
Extract:
1. Pros: 3-5 positive aspects customers appreciate
2. Cons: 3-5 negative aspects or concerns mentioned
3. Themes: 3-5 key themes that emerge across reviews
 
Be specific and concise. Each item should be 3-7 words.
 
Reviews:
${product.reviews
    .map(
      (review, i) => `Review ${i + 1} (${review.stars} stars):\n${review.review}`
    )
    .join("\n\n")}`;
 
  try {
    const { object } = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      schema: ReviewInsightsSchema,
      prompt,
    });
 
    return object;
  } catch (error) {
    console.error("Failed to extract insights:", error);
    throw new Error("Unable to extract review insights. Please try again.");
  }
}

export async function streamRecommendations(history: Product[]) {
  const catalog = (await import("./sample-data")).getProducts();
  const historySlugs = new Set(history.map((p) => p.slug));
  const candidates = catalog.filter((p) => !historySlugs.has(p.slug));

  const prompt = `You are an assistant recommending products based on a user's viewing history.

User history (recently viewed):
${history
    .map((p) => `- ${p.name}: ${p.description}`)
    .join("\n")}

Available candidates to consider (exclude history):
${candidates.map((p) => `- ${p.name}: ${p.description}`).join("\n")}

Instructions:
- Recommend 3 products from the candidates.
- Provide a brief rationale tailored to the history themes.
- Keep it concise (1-2 sentences per recommendation).
- Output as a simple list:
  1. Product Name — short rationale
  2. Product Name — short rationale
  3. Product Name — short rationale
`;

  const result = streamText({
    model: "anthropic/claude-sonnet-4-5",
    prompt,
    maxOutputTokens: 1000,
    temperature: 0.7,
  });

  return result;
}