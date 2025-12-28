import { generateText, streamText } from "ai";
import { Product } from "./types";
 
export async function summarizeReviews(product: Product): Promise<string> {
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
 
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt,
      maxOutputTokens: 1000,
      temperature: 0.75,
    });
 
    // Clean up the response
    return text
      .trim()
      .replace(/^"/, "")
      .replace(/\"$/, "")
      .replace(/[\[\(]\d+ words[\]\)]/g, "");
  } catch (error) {
    console.error("Failed to generate summary:", error);
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