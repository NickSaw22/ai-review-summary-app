import { Product, ProductSchema } from "./types";
 
export const sampleProductsReviews: Record<string, Product> = {
  mower: {
    slug: "mower",
    name: "Mower3000",
    description: "Autonomous robotic lawn mower with smart navigation",
    reviews: [
      {
        reviewer: "John D.",
        stars: 4,
        review:
          "Great mower! Handles slopes well and is very quiet. Setup took about an hour, but once configured it works autonomously. Battery lasts about 90 minutes.",
        date: "2025-11-15T10:30:00Z",
      },
      {
        reviewer: "Sarah M.",
        stars: 5,
        review:
          "Love this thing! My lawn has never looked better. It runs every day at 6am and I don't have to think about it. The app is easy to use and scheduling is straightforward.",
        date: "2025-11-20T14:22:00Z",
      },
      {
        reviewer: "Mike R.",
        stars: 2,
        review:
          "Disappointed. I hate mowing the lawn, and this did not change that.",
        date: "2025-11-28T08:15:00Z",
      },
      {
        reviewer: "Emily K.",
        stars: 4,
        review:
          "Really impressed with the cutting quality. It mulches the grass perfectly. Only downside is it can't handle thick weeds, but that's expected. Worth the price.",
        date: "2025-12-01T16:45:00Z",
      },
    ],
  },
  ecoBright: {
    slug: "ecoBright",
    name: "EcoBright LED Bulbs",
    description: "Energy-efficient smart LED bulbs with color temperature control",
    reviews: [
      {
        reviewer: "Amanda L.",
        stars: 5,
        review:
          "These bulbs are fantastic! Added a lot of ambiance to the room.",
        date: "2025-11-10T09:20:00Z",
      },
      {
        reviewer: "Carlos P.",
        stars: 3,
        review:
          "Decent bulbs for the price. Color temperature control works well, but I wish they were brighter at max setting. They do save energy compared to my old bulbs.",
        date: "2025-11-18T12:33:00Z",
      },
      {
        reviewer: "Lisa T.",
        stars: 4,
        review:
          "Very happy with these. The scheduling feature is great—bulbs dim automatically at 9pm. App is intuitive. Lost one star because one bulb failed after 3 months.",
        date: "2025-11-25T18:10:00Z",
      },
    ],
  },
  aquaHeat: {
    slug: "aquaHeat",
    name: "AquaHeat Tankless Water Heater",
    description: "High-efficiency tankless water heater with digital temperature control",
    reviews: [
      {
        reviewer: "Robert F.",
        stars: 5,
        review:
          "Incredible upgrade from our old tank heater. Endless hot water and our energy bill dropped by 30%. Installation was professional and took about 4 hours.",
        date: "2025-10-05T11:15:00Z",
      },
      {
        reviewer: "Jenny W.",
        stars: 4,
        review:
          "Works great but required upgrading our gas line which added $800 to the cost. Once installed, it's been flawless. Water heats instantly and temperature is consistent.",
        date: "2025-10-20T15:40:00Z",
      },
      {
        reviewer: "Tom H.",
        stars: 3,
        review:
          "Good product but overpriced. It works as advertised but the 'energy savings' haven't been as dramatic as claimed. Still, no more running out of hot water is nice.",
        date: "2025-11-12T07:55:00Z",
      },
      {
        reviewer: "Maria S.",
        stars: 5,
        review:
          "Best home improvement we've made! Compact design freed up space in our utility room. The digital display is clear and adjusting temperature is easy. Highly recommend.",
        date: "2025-11-30T13:25:00Z",
      },
    ],
  },
};
 
// Validate data at runtime
Object.values(sampleProductsReviews).forEach((product) => {
  ProductSchema.parse(product);
});
 
export const Products = Object.values(sampleProductsReviews);

export function getProducts(): Product[] {
  return Products;
}
 
/**
 * Get a single product by slug
 * @throws Error if product not found
 */
export function getProduct(slug: string): Product {
  const product = sampleProductsReviews[slug];
 
  if (!product) {
    throw new Error(`Product not found: ${slug}`);
  }
 
  return product;
}