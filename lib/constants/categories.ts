export const STANDARD_CATEGORIES = [
  { name: "Women", slug: "women", position: 1, description: "Women's collection & apparel" },
  { name: "Men", slug: "men", position: 2, description: "Men's collection & apparel" },
  { name: "Accessories", slug: "accessories", position: 3, description: "Bags, belts, and leather accessories" },
] as const;

export const STANDARD_SUBCATEGORIES = {
  women: [
    { name: "Sarees", slug: "women-saree", position: 1 },
    { name: "Ethnic Wear", slug: "women-single-ethnic", position: 2 },
    { name: "Shirts & Blouses", slug: "women-shirts-blouses", position: 3 },
    { name: "T-Shirts & Tank Tops", slug: "women-tshirts-tanks", position: 4 },
    { name: "Dresses", slug: "women-dresses", position: 5 },
    { name: "Co-ord Sets", slug: "women-cord-set", position: 6 },
    { name: "Jeans & Bottoms", slug: "women-baggy-jeans", position: 7 },
    { name: "Outerwear", slug: "women-jacket", position: 8 },
  ],
  men: [
    { name: "Panjabi", slug: "men-panjabi", position: 1 },
    { name: "Ethnic Wear", slug: "men-waistcoat", position: 2 },
    { name: "Shirts", slug: "men-shirt", position: 3 },
    { name: "Polo Shirts", slug: "men-polo-shirt", position: 4 },
    { name: "T-Shirts", slug: "men-t-shirt", position: 5 },
    { name: "Bottoms", slug: "men-pants", position: 6 },
    { name: "Outerwear", slug: "men-winter-wear", position: 7 },
    { name: "Blazers & Suits", slug: "men-blazer-suit", position: 8 },
  ],
  accessories: [
    { name: "Bags & Wallets", slug: "accessories-bags-wallets", position: 1 },
    { name: "Belts & Leather", slug: "accessories-belts-leather", position: 2 },
    { name: "Men's Accessories", slug: "accessories-men", position: 3 },
    { name: "Scarves & Stoles", slug: "accessories-scarves-stoles", position: 4 },
  ],
} as const;
