import { SeedProductItem } from "../catalog-data-definitions";

export const WOMEN_PRODUCTS: SeedProductItem[] = [
  // --- 1. Sarees (women-saree) ---
  {
    name: "Midnight Indigo Jamdani Saree",
    slug: "midnight-indigo-jamdani-saree",
    subCategorySlug: "women-saree",
    description: "Hand-spun pure cotton Jamdani woven with intricate floral geometric motifs in deep indigo and subtle silver zari.",
    basePrice: 1250000,
    salePrice: 1050000,
    material: "100% Hand-spun Muslin Cotton with Zari Weave",
    careInstructions: "Dry clean only. Store wrapped in pure muslin cloth.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-JAM-IND-FREE", color: "Indigo", size: "Free Size", stockQuantity: 6 },
      { sku: "SAR-JAM-BLK-FREE", color: "Black", size: "Free Size", stockQuantity: 4 }
    ],
    tags: ["saree", "jamdani", "festive", "traditional", "handwoven"]
  },
  {
    name: "Crimson Royal Katan Silk Saree",
    slug: "crimson-royal-katan-silk-saree",
    subCategorySlug: "women-saree",
    description: "Opulent crimson red Banarasi Katan silk saree adorned with classic paisley motifs and an ornate gilded pallu.",
    basePrice: 1850000,
    material: "100% Pure Mulberry Katan Silk with Antique Gold Zari",
    careInstructions: "Dry clean only. Avoid spraying perfumes directly on zari.",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-KAT-CRM-FREE", color: "Crimson", size: "Free Size", stockQuantity: 5 },
      { sku: "SAR-KAT-MAR-FREE", color: "Maroon", size: "Free Size", stockQuantity: 3 }
    ],
    tags: ["saree", "katan", "silk", "bridal", "wedding"]
  },
  {
    name: "Champagne Tussar Georgette Saree",
    slug: "champagne-tussar-georgette-saree",
    subCategorySlug: "women-saree",
    description: "Ethereal champagne tone silk georgette saree featuring delicate hand-embroidered sequin scapes and scalloped borders.",
    basePrice: 1450000,
    material: "Pure Silk Georgette with Hand-embroidered Resham",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-GEO-CHM-FREE", color: "Champagne", size: "Free Size", stockQuantity: 7 }
    ],
    tags: ["saree", "georgette", "party", "evening", "cocktail"]
  },
  {
    name: "Emerald Green Organza Silk Saree",
    slug: "emerald-green-organza-silk-saree",
    subCategorySlug: "women-saree",
    description: "Airy translucent emerald organza saree accented with hand-painted botanical motifs and a fine foil-stamped border.",
    basePrice: 980000,
    salePrice: 850000,
    material: "100% Pure Sheer Organza Silk",
    careInstructions: "Dry clean only. Steam iron on low setting from reverse side.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-ORG-EMR-FREE", color: "Emerald", size: "Free Size", stockQuantity: 8 },
      { sku: "SAR-ORG-SGE-FREE", color: "Sage Green", size: "Free Size", stockQuantity: 5 }
    ],
    tags: ["saree", "organza", "pastel", "lightweight", "modern"]
  },
  {
    name: "Onyx Black Chanderi Silk Saree",
    slug: "onyx-black-chanderi-silk-saree",
    subCategorySlug: "women-saree",
    description: "Crisp handloom Chanderi silk saree with rich coin butis woven with antique brass zari across a deep midnight canvas.",
    basePrice: 1120000,
    material: "Chanderi Cotton-Silk with Tested Zari",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-CHA-ONY-FREE", color: "Onyx Black", size: "Free Size", stockQuantity: 6 }
    ],
    tags: ["saree", "chanderi", "black", "formal", "handloom"]
  },
  {
    name: "Blush Pink Tissue Linen Saree",
    slug: "blush-pink-tissue-linen-saree",
    subCategorySlug: "women-saree",
    description: "Soft metallic sheen tissue linen saree combining breathable natural fibers with festive rose gold shimmer.",
    basePrice: 780000,
    material: "Pure Linen with Metallic Tissue Interweave",
    careInstructions: "Dry clean or gentle hand wash in mild silk shampoo.",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-TIS-BLS-FREE", color: "Blush Pink", size: "Free Size", stockQuantity: 9 }
    ],
    tags: ["saree", "linen", "tissue", "summer", "daywear"]
  },
  {
    name: "Marigold Yellow Hand-Block Chiffon Saree",
    slug: "marigold-yellow-hand-block-chiffon-saree",
    subCategorySlug: "women-saree",
    description: "Flowing pure chiffon saree stamped with heritage wooden block designs in warm turmeric and marigold hues.",
    basePrice: 850000,
    material: "100% Pure Crinkle Chiffon",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-CHF-MAR-FREE", color: "Marigold Yellow", size: "Free Size", stockQuantity: 7 }
    ],
    tags: ["saree", "chiffon", "haldi", "festive", "printed"]
  },
  {
    name: "Vintage Ivory Dhakai Muslin Saree",
    slug: "vintage-ivory-dhakai-muslin-saree",
    subCategorySlug: "women-saree",
    description: "World-renowned Dhakai muslin weaving featuring fine 300-count spun cotton threads with gossamer feather touch.",
    basePrice: 2200000,
    material: "100% Hand-spun Muslin Yarn (300 Count)",
    careInstructions: "Heirloom preservation: dry clean only, re-fold every six months.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-MUS-IVR-FREE", color: "Ivory", size: "Free Size", stockQuantity: 3 }
    ],
    tags: ["saree", "muslin", "dhakai", "heirloom", "luxury"]
  },
  {
    name: "Royal Peacock Blue Kanjeevaram Saree",
    slug: "royal-peacock-blue-kanjeevaram-saree",
    subCategorySlug: "women-saree",
    description: "Stately temple border Kanjeevaram silk saree with rich peacock blue body and contrasting magenta pallu.",
    basePrice: 2650000,
    material: "Pure Mulberry Silk with Heavy Zari Border",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-KAN-PCK-FREE", color: "Peacock Blue", size: "Free Size", stockQuantity: 4 }
    ],
    tags: ["saree", "kanjeevaram", "traditional", "wedding", "silk"]
  },
  {
    name: "Dusk Lavender Satin Crepe Saree",
    slug: "dusk-lavender-satin-crepe-saree",
    subCategorySlug: "women-saree",
    description: "Sleek contemporary satin crepe saree with liquid drape, crystal rhinestone edge trim, and an unstitched designer blouse piece.",
    basePrice: 940000,
    salePrice: 790000,
    material: "Heavy Silk Satin Crepe",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "SAR-SAT-LAV-FREE", color: "Lavender", size: "Free Size", stockQuantity: 10 }
    ],
    tags: ["saree", "satin", "crepe", "modern", "glamour"]
  },

  // --- 2. Ethnic Wear (women-single-ethnic) ---
  {
    name: "Aura Embroidered Raw Silk Kurti",
    slug: "aura-embroidered-raw-silk-kurti",
    subCategorySlug: "women-single-ethnic",
    description: "Straight-cut single kameez crafted in raw silk with delicate floral needlework along the split neckline and sleeve cuffs.",
    basePrice: 420000,
    material: "100% Textured Raw Silk with Cotton Voile Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-AUR-S", color: "Emerald", size: "S", stockQuantity: 6 },
      { sku: "ETH-AUR-M", color: "Emerald", size: "M", stockQuantity: 8 },
      { sku: "ETH-AUR-L", color: "Emerald", size: "L", stockQuantity: 5 },
      { sku: "ETH-AUR-XL", color: "Emerald", size: "XL", stockQuantity: 4 }
    ],
    tags: ["ethnic", "kurti", "kameez", "silk", "festive"]
  },
  {
    name: "Sahara Handloom Cotton Tunic",
    slug: "sahara-handloom-cotton-tunic",
    subCategorySlug: "women-single-ethnic",
    description: "Breezy relaxed-silhouette ethnic tunic woven from breathable desert cotton with hand-knotted tassel details.",
    basePrice: 285000,
    material: "100% Organic Handloom Cotton",
    careInstructions: "Machine wash gentle cycle cold, shade dry.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-SAH-S", color: "Sand", size: "S", stockQuantity: 7 },
      { sku: "ETH-SAH-M", color: "Sand", size: "M", stockQuantity: 10 },
      { sku: "ETH-SAH-L", color: "Sand", size: "L", stockQuantity: 8 }
    ],
    tags: ["ethnic", "tunic", "cotton", "casual", "summer"]
  },
  {
    name: "Noir Chanderi A-Line Kameez",
    slug: "noir-chanderi-a-line-kameez",
    subCategorySlug: "women-single-ethnic",
    description: "Sophisticated black Chanderi A-line kameez finished with metallic thread stitching and a high mandarin collar.",
    basePrice: 460000,
    material: "Chanderi Silk-Cotton Blend",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-NOI-XS", color: "Black", size: "XS", stockQuantity: 4 },
      { sku: "ETH-NOI-S", color: "Black", size: "S", stockQuantity: 7 },
      { sku: "ETH-NOI-M", color: "Black", size: "M", stockQuantity: 9 },
      { sku: "ETH-NOI-L", color: "Black", size: "L", stockQuantity: 6 }
    ],
    tags: ["ethnic", "kameez", "black", "formal", "chanderi"]
  },
  {
    name: "Gulmohar Floral Printed Anarkali Kurta",
    slug: "gulmohar-floral-printed-anarkali-kurta",
    subCategorySlug: "women-single-ethnic",
    description: "Flared silhouette Anarkali single kurti adorned with vintage floral block prints and potli button detailing.",
    basePrice: 380000,
    salePrice: 320000,
    material: "Fine Cotton Mulmul",
    careInstructions: "Hand wash cold separately.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-GUL-S", color: "Rust Pink", size: "S", stockQuantity: 8 },
      { sku: "ETH-GUL-M", color: "Rust Pink", size: "M", stockQuantity: 10 },
      { sku: "ETH-GUL-L", color: "Rust Pink", size: "L", stockQuantity: 7 }
    ],
    tags: ["ethnic", "anarkali", "floral", "printed", "flared"]
  },
  {
    name: "Zari Woven Georgette Angrakha",
    slug: "zari-woven-georgette-angrakha",
    subCategorySlug: "women-single-ethnic",
    description: "Cross-over asymmetric Angrakha kurti with delicate gold zari borders and dual waist ties.",
    basePrice: 520000,
    material: "Poly Georgette with Butter-Crepe Inner",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-ANG-S", color: "Mustard Gold", size: "S", stockQuantity: 5 },
      { sku: "ETH-ANG-M", color: "Mustard Gold", size: "M", stockQuantity: 6 },
      { sku: "ETH-ANG-L", color: "Mustard Gold", size: "L", stockQuantity: 4 }
    ],
    tags: ["ethnic", "angrakha", "festive", "traditional"]
  },
  {
    name: "Ivory Chikankari Embroidered Long Kurti",
    slug: "ivory-chikankari-embroidered-long-kurti",
    subCategorySlug: "women-single-ethnic",
    description: "Authentic Lucknowi shadow-work chikankari hand embroidery across sheer muslin with pearlescent button closures.",
    basePrice: 490000,
    material: "100% Fine Sheer Muslin",
    careInstructions: "Hand wash in cold water with gentle detergent.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-CHK-S", color: "Ivory", size: "S", stockQuantity: 6 },
      { sku: "ETH-CHK-M", color: "Ivory", size: "M", stockQuantity: 9 },
      { sku: "ETH-CHK-L", color: "Ivory", size: "L", stockQuantity: 7 }
    ],
    tags: ["ethnic", "chikankari", "hand-embroidered", "ivory"]
  },
  {
    name: "Indigo Dabu Print Straight Kameez",
    slug: "indigo-dabu-print-straight-kameez",
    subCategorySlug: "women-single-ethnic",
    description: "Heritage mud-resist dabu block printed straight kameez with deep side slits and wooden button trim.",
    basePrice: 310000,
    material: "100% Natural Dyed Cotton",
    careInstructions: "First wash dry clean, subsequently hand wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-DAB-S", color: "Indigo", size: "S", stockQuantity: 5 },
      { sku: "ETH-DAB-M", color: "Indigo", size: "M", stockQuantity: 8 },
      { sku: "ETH-DAB-L", color: "Indigo", size: "L", stockQuantity: 6 }
    ],
    tags: ["ethnic", "indigo", "cotton", "dabu", "dailywear"]
  },
  {
    name: "Crimson Silk Velvet Kaftan Kurti",
    slug: "crimson-silk-velvet-kaftan-kurti",
    subCategorySlug: "women-single-ethnic",
    description: "Plush silk velvet loose-fit kaftan kurti with rich antique zardozi work around the V-neckline.",
    basePrice: 650000,
    salePrice: 560000,
    material: "Silk Micro-Velvet",
    careInstructions: "Dry clean only. Store on padded hangers.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-KAF-FREE", color: "Crimson Velvet", size: "Free Size", stockQuantity: 6 }
    ],
    tags: ["ethnic", "velvet", "kaftan", "luxury", "winter"]
  },
  {
    name: "Sage Green Organza Layered Kurti",
    slug: "sage-green-organza-layered-kurti",
    subCategorySlug: "women-single-ethnic",
    description: "Dual-layer party kurti featuring a gossamer embroidered organza overlay over an opaque tonal slip.",
    basePrice: 480000,
    material: "Silk Organza with Santoon Slip",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-SGE-S", color: "Sage Green", size: "S", stockQuantity: 5 },
      { sku: "ETH-SGE-M", color: "Sage Green", size: "M", stockQuantity: 7 },
      { sku: "ETH-SGE-L", color: "Sage Green", size: "L", stockQuantity: 4 }
    ],
    tags: ["ethnic", "organza", "layered", "pastel", "party"]
  },
  {
    name: "Mustard Khadi Cotton Long Shirt Kurti",
    slug: "mustard-khadi-cotton-long-shirt-kurti",
    subCategorySlug: "women-single-ethnic",
    description: "Clean modern fusion kurti with western shirt collar and traditional hand-spun khadi texture.",
    basePrice: 295000,
    material: "100% Hand-spun Khadi Cotton",
    careInstructions: "Machine wash cold, warm iron.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ETH-KHD-S", color: "Mustard", size: "S", stockQuantity: 8 },
      { sku: "ETH-KHD-M", color: "Mustard", size: "M", stockQuantity: 11 },
      { sku: "ETH-KHD-L", color: "Mustard", size: "L", stockQuantity: 9 }
    ],
    tags: ["ethnic", "khadi", "fusion", "smartcasual"]
  },

  // --- 3. Shirts & Blouses (women-shirts-blouses) ---
  {
    name: "Pearl White Silk Charmeuse Blouse",
    slug: "pearl-white-silk-charmeuse-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Fluid silk charmeuse blouse with concealed button placket, French cuffs, and a structured point collar.",
    basePrice: 420000,
    material: "100% Mulberry Silk Charmeuse",
    careInstructions: "Dry clean or hand wash cold with silk detergent.",
    imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-PRL-XS", color: "Pearl White", size: "XS", stockQuantity: 5 },
      { sku: "WSH-PRL-S", color: "Pearl White", size: "S", stockQuantity: 8 },
      { sku: "WSH-PRL-M", color: "Pearl White", size: "M", stockQuantity: 10 },
      { sku: "WSH-PRL-L", color: "Pearl White", size: "L", stockQuantity: 6 }
    ],
    tags: ["shirt", "blouse", "silk", "workwear", "minimalist"]
  },
  {
    name: "Azure Oversized Poplin Shirt",
    slug: "azure-oversized-poplin-shirt",
    subCategorySlug: "women-shirts-blouses",
    description: "Boyfriend-cut crisp cotton poplin shirt featuring dropped shoulders, chest patch pocket, and a curved hem.",
    basePrice: 295000,
    material: "100% Organic Giza Cotton Poplin",
    careInstructions: "Machine wash cold, hang dry, medium steam iron.",
    imageUrl: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-AZU-S", color: "Azure Blue", size: "S", stockQuantity: 7 },
      { sku: "WSH-AZU-M", color: "Azure Blue", size: "M", stockQuantity: 10 },
      { sku: "WSH-AZU-L", color: "Azure Blue", size: "L", stockQuantity: 6 }
    ],
    tags: ["shirt", "poplin", "oversized", "cotton", "casual"]
  },
  {
    name: "Onyx Satin Tie-Neck Blouse",
    slug: "onyx-satin-tie-neck-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Sophisticated draped pussy-bow necktie blouse with voluminous blouson sleeves in lustrous black satin.",
    basePrice: 380000,
    material: "Heavy Silk-Finish Poly Satin",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-ONY-S", color: "Onyx", size: "S", stockQuantity: 6 },
      { sku: "WSH-ONY-M", color: "Onyx", size: "M", stockQuantity: 9 },
      { sku: "WSH-ONY-L", color: "Onyx", size: "L", stockQuantity: 5 }
    ],
    tags: ["blouse", "satin", "tie-neck", "evening", "office"]
  },
  {
    name: "Natural Washed French Linen Shirt",
    slug: "natural-washed-french-linen-shirt",
    subCategorySlug: "women-shirts-blouses",
    description: "Relaxed resort-style linen shirt pre-washed for vintage softness with natural shell buttons.",
    basePrice: 360000,
    material: "100% Normandy French Linen",
    careInstructions: "Machine wash cold, line dry in shade.",
    imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-LIN-S", color: "Flax Natural", size: "S", stockQuantity: 8 },
      { sku: "WSH-LIN-M", color: "Flax Natural", size: "M", stockQuantity: 11 },
      { sku: "WSH-LIN-L", color: "Flax Natural", size: "L", stockQuantity: 7 }
    ],
    tags: ["shirt", "linen", "summer", "breathable"]
  },
  {
    name: "Caramel Puff-Sleeve Peplum Blouse",
    slug: "caramel-puff-sleeve-peplum-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Feminine sculpted peplum blouse featuring gathered sweetheart neckline and dramatic puffed shoulders.",
    basePrice: 340000,
    material: "Cotton-Lyocell Stretch Twill",
    careInstructions: "Gentle machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-CAR-XS", color: "Caramel", size: "XS", stockQuantity: 4 },
      { sku: "WSH-CAR-S", color: "Caramel", size: "S", stockQuantity: 7 },
      { sku: "WSH-CAR-M", color: "Caramel", size: "M", stockQuantity: 8 }
    ],
    tags: ["blouse", "peplum", "puffsleeve", "feminine"]
  },
  {
    name: "Breton Striped Oxford Shirt",
    slug: "breton-striped-oxford-shirt",
    subCategorySlug: "women-shirts-blouses",
    description: "Classic blue and white striped Oxford cotton shirt with relaxed tailored cut and mother-of-pearl buttons.",
    basePrice: 310000,
    material: "100% Combed Oxford Cotton",
    careInstructions: "Machine wash warm, tumble dry low.",
    imageUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-STR-S", color: "Blue Stripe", size: "S", stockQuantity: 9 },
      { sku: "WSH-STR-M", color: "Blue Stripe", size: "M", stockQuantity: 12 },
      { sku: "WSH-STR-L", color: "Blue Stripe", size: "L", stockQuantity: 7 }
    ],
    tags: ["shirt", "oxford", "striped", "preppy", "smart"]
  },
  {
    name: "Mocha Ruched Chiffon Blouse",
    slug: "mocha-ruched-chiffon-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Romantic semi-sheer chiffon blouse with subtle front ruching and elasticated bell sleeves.",
    basePrice: 280000,
    salePrice: 235000,
    material: "100% Sheer Poly Chiffon",
    careInstructions: "Hand wash cold, line dry.",
    imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-MCH-S", color: "Mocha", size: "S", stockQuantity: 6 },
      { sku: "WSH-MCH-M", color: "Mocha", size: "M", stockQuantity: 8 },
      { sku: "WSH-MCH-L", color: "Mocha", size: "L", stockQuantity: 5 }
    ],
    tags: ["blouse", "chiffon", "ruched", "romantic"]
  },
  {
    name: "Classic Khaki Utility Safari Shirt",
    slug: "classic-khaki-utility-safari-shirt",
    subCategorySlug: "women-shirts-blouses",
    description: "Structured safari shirt equipped with dual chest flap pockets, epaulettes, and roll-up sleeve tabs.",
    basePrice: 330000,
    material: "100% Cotton Drill",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-SAF-S", color: "Khaki", size: "S", stockQuantity: 7 },
      { sku: "WSH-SAF-M", color: "Khaki", size: "M", stockQuantity: 9 },
      { sku: "WSH-SAF-L", color: "Khaki", size: "L", stockQuantity: 6 }
    ],
    tags: ["shirt", "utility", "safari", "khaki"]
  },
  {
    name: "Olive Draped Wrap Blouse",
    slug: "olive-draped-wrap-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Modern surplice wrap blouse featuring an adjustable side sash tie and clean surplice neckline in olive tencel.",
    basePrice: 350000,
    material: "100% Tencel Lyocell",
    careInstructions: "Gentle machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-WRP-XS", color: "Olive", size: "XS", stockQuantity: 4 },
      { sku: "WSH-WRP-S", color: "Olive", size: "S", stockQuantity: 7 },
      { sku: "WSH-WRP-M", color: "Olive", size: "M", stockQuantity: 10 }
    ],
    tags: ["blouse", "wrap", "tencel", "olive", "daytonight"]
  },
  {
    name: "Black Broderie Anglaise Blouse",
    slug: "black-broderie-anglaise-blouse",
    subCategorySlug: "women-shirts-blouses",
    description: "Intricate eyelet embroidered cotton blouse with scalloped mandarin collar and three-quarter sleeves.",
    basePrice: 370000,
    material: "100% Eyelet Cotton",
    careInstructions: "Machine wash cold on gentle cycle.",
    imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WSH-BRD-S", color: "Black", size: "S", stockQuantity: 6 },
      { sku: "WSH-BRD-M", color: "Black", size: "M", stockQuantity: 9 },
      { sku: "WSH-BRD-L", color: "Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["blouse", "eyelet", "broderie", "black", "summer"]
  },

  // --- 4. T-Shirts & Tank Tops (women-tshirts-tanks) ---
  {
    name: "Essential Heavyweight Boxy Tee",
    slug: "essential-heavyweight-boxy-tee",
    subCategorySlug: "women-tshirts-tanks",
    description: "Signature 240 GSM organic combed cotton t-shirt with ribbed crewneck and relaxed dropped shoulders.",
    basePrice: 165000,
    material: "100% Organic Combed Cotton (240 GSM)",
    careInstructions: "Machine wash cold with like colors, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-BOX-WHT-XS", color: "Optic White", size: "XS", stockQuantity: 10 },
      { sku: "WTS-BOX-WHT-S", color: "Optic White", size: "S", stockQuantity: 15 },
      { sku: "WTS-BOX-WHT-M", color: "Optic White", size: "M", stockQuantity: 20 },
      { sku: "WTS-BOX-WHT-L", color: "Optic White", size: "L", stockQuantity: 12 },
      { sku: "WTS-BOX-BLK-S", color: "Pitch Black", size: "S", stockQuantity: 14 },
      { sku: "WTS-BOX-BLK-M", color: "Pitch Black", size: "M", stockQuantity: 18 }
    ],
    tags: ["t-shirt", "essential", "boxy", "cotton", "basics"]
  },
  {
    name: "Ribbed Modal Racerback Tank",
    slug: "ribbed-modal-racerback-tank",
    subCategorySlug: "women-tshirts-tanks",
    description: "Ultra-soft micro-rib tank top with sleek racerback cut, high crew neck, and flattering body-contouring stretch.",
    basePrice: 125000,
    material: "95% Micro Modal, 5% Elastane",
    careInstructions: "Machine wash cold, lay flat to dry.",
    imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-RC-IVR-XS", color: "Ivory", size: "XS", stockQuantity: 8 },
      { sku: "WTS-RC-IVR-S", color: "Ivory", size: "S", stockQuantity: 14 },
      { sku: "WTS-RC-IVR-M", color: "Ivory", size: "M", stockQuantity: 16 },
      { sku: "WTS-RC-BLK-S", color: "Black", size: "S", stockQuantity: 15 },
      { sku: "WTS-RC-BLK-M", color: "Black", size: "M", stockQuantity: 12 }
    ],
    tags: ["tank", "ribbed", "racerback", "modal", "layering"]
  },
  {
    name: "Classic V-Neck Pima Cotton Tee",
    slug: "classic-v-neck-pima-cotton-tee",
    subCategorySlug: "women-tshirts-tanks",
    description: "Featherlight Peruvian Pima cotton tee with a graceful shallow V-neckline and clean tailored hem.",
    basePrice: 155000,
    material: "100% Peruvian Pima Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-VNK-S", color: "Heather Grey", size: "S", stockQuantity: 10 },
      { sku: "WTS-VNK-M", color: "Heather Grey", size: "M", stockQuantity: 12 },
      { sku: "WTS-VNK-L", color: "Heather Grey", size: "L", stockQuantity: 8 }
    ],
    tags: ["t-shirt", "v-neck", "pima", "basics"]
  },
  {
    name: "Vintage Washed Graphic Baby Tee",
    slug: "vintage-washed-graphic-baby-tee",
    subCategorySlug: "women-tshirts-tanks",
    description: "90s throwback cropped baby tee featuring subtle archival typographic print and contrast baby lock hem.",
    basePrice: 145000,
    salePrice: 119000,
    material: "100% Washed Slub Cotton",
    careInstructions: "Machine wash inside out cold.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-BBY-XS", color: "Washed Charcoal", size: "XS", stockQuantity: 6 },
      { sku: "WTS-BBY-S", color: "Washed Charcoal", size: "S", stockQuantity: 12 },
      { sku: "WTS-BBY-M", color: "Washed Charcoal", size: "M", stockQuantity: 14 }
    ],
    tags: ["t-shirt", "baby-tee", "graphic", "vintage", "y2k"]
  },
  {
    name: "Seamless Sculpt Square-Neck Tank",
    slug: "seamless-sculpt-square-neck-tank",
    subCategorySlug: "women-tshirts-tanks",
    description: "Double-layered seamless compression tank offering built-in light bust support and a modern wide square neckline.",
    basePrice: 175000,
    material: "88% Nylon, 12% Spandex Seamless Knit",
    careInstructions: "Machine wash cold, do not bleach.",
    imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-SQR-XS", color: "Espresso", size: "XS", stockQuantity: 7 },
      { sku: "WTS-SQR-S", color: "Espresso", size: "S", stockQuantity: 11 },
      { sku: "WTS-SQR-M", color: "Espresso", size: "M", stockQuantity: 9 }
    ],
    tags: ["tank", "square-neck", "seamless", "sculpting"]
  },
  {
    name: "Linen-Blend Scoop Neck Tee",
    slug: "linen-blend-scoop-neck-tee",
    subCategorySlug: "women-tshirts-tanks",
    description: "Airy slub texture tee cut with a flattering scoop neckline and rolled raw cuffs.",
    basePrice: 180000,
    material: "55% Linen, 45% Cotton Slub",
    careInstructions: "Gentle machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-LIN-S", color: "Oatmeal", size: "S", stockQuantity: 9 },
      { sku: "WTS-LIN-M", color: "Oatmeal", size: "M", stockQuantity: 12 },
      { sku: "WTS-LIN-L", color: "Oatmeal", size: "L", stockQuantity: 8 }
    ],
    tags: ["t-shirt", "linen", "scoopneck", "summer"]
  },
  {
    name: "High-Neck Sleeveless Mock Bodysuit",
    slug: "high-neck-sleeveless-mock-bodysuit",
    subCategorySlug: "women-tshirts-tanks",
    description: "Streamlined high-neck bodysuit with snap-button gusset, crafted in buttery second-skin fabric.",
    basePrice: 195000,
    material: "Modal Spandex Knit",
    careInstructions: "Hand wash or gentle cycle cold.",
    imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-BOD-S", color: "Black", size: "S", stockQuantity: 8 },
      { sku: "WTS-BOD-M", color: "Black", size: "M", stockQuantity: 10 },
      { sku: "WTS-BOD-L", color: "Black", size: "L", stockQuantity: 6 }
    ],
    tags: ["bodysuit", "tank", "high-neck", "layering"]
  },
  {
    name: "Breton Striped Boatneck Long-Sleeve Tee",
    slug: "breton-striped-boatneck-long-sleeve-tee",
    subCategorySlug: "women-tshirts-tanks",
    description: "Timeless French maritime striped boatneck top in substantial 220 GSM combed cotton.",
    basePrice: 195000,
    material: "100% Combed Cotton Knit",
    careInstructions: "Machine wash cold with like colors.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-STR-S", color: "Navy/White", size: "S", stockQuantity: 9 },
      { sku: "WTS-STR-M", color: "Navy/White", size: "M", stockQuantity: 14 },
      { sku: "WTS-STR-L", color: "Navy/White", size: "L", stockQuantity: 8 }
    ],
    tags: ["t-shirt", "striped", "boatneck", "longsleeve", "classic"]
  },
  {
    name: "Cropped Ribbed Muscle Tank",
    slug: "cropped-ribbed-muscle-tank",
    subCategorySlug: "women-tshirts-tanks",
    description: "Sleeveless muscle tank featuring padded shoulder accents, high neckline, and relaxed crop.",
    basePrice: 135000,
    salePrice: 110000,
    material: "100% Cotton Rib",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-MSC-S", color: "Olive", size: "S", stockQuantity: 7 },
      { sku: "WTS-MSC-M", color: "Olive", size: "M", stockQuantity: 11 },
      { sku: "WTS-MSC-L", color: "Olive", size: "L", stockQuantity: 6 }
    ],
    tags: ["tank", "muscle-tank", "cropped", "ribbed"]
  },
  {
    name: "Silk-Touch Modal Camisole Top",
    slug: "silk-touch-modal-camisole-top",
    subCategorySlug: "women-tshirts-tanks",
    description: "Delicate spaghetti strap camisole with adjustable gold hardware sliders and subtle V-neckline.",
    basePrice: 140000,
    material: "92% Modal, 8% Spandex",
    careInstructions: "Hand wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WTS-CAM-XS", color: "Champagne", size: "XS", stockQuantity: 5 },
      { sku: "WTS-CAM-S", color: "Champagne", size: "S", stockQuantity: 10 },
      { sku: "WTS-CAM-M", color: "Champagne", size: "M", stockQuantity: 8 }
    ],
    tags: ["camisole", "tank", "modal", "layering", "silk-touch"]
  },

  // --- 5. Dresses (women-dresses) ---
  {
    name: "Sculpted Black Column Evening Dress",
    slug: "sculpted-black-column-evening-dress",
    subCategorySlug: "women-dresses",
    description: "Architectural floor-sweeping column gown featuring an off-the-shoulder neckline and subtle back vent.",
    basePrice: 580000,
    material: "Heavy Bonded Crepe with Stretch Satin Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-COL-XS", color: "Black", size: "XS", stockQuantity: 4 },
      { sku: "WDR-COL-S", color: "Black", size: "S", stockQuantity: 7 },
      { sku: "WDR-COL-M", color: "Black", size: "M", stockQuantity: 9 },
      { sku: "WDR-COL-L", color: "Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["dress", "evening", "gown", "black-tie", "formal"]
  },
  {
    name: "Santorini Tiered Linen Maxi Dress",
    slug: "santorini-tiered-linen-maxi-dress",
    subCategorySlug: "women-dresses",
    description: "Flowing tiered silhouette summer maxi dress crafted from breathable European linen with side seam pockets.",
    basePrice: 420000,
    salePrice: 360000,
    material: "100% European Flax Linen",
    careInstructions: "Machine wash cold on gentle cycle, line dry in shade.",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-SAN-S", color: "Cerulean Blue", size: "S", stockQuantity: 6 },
      { sku: "WDR-SAN-M", color: "Cerulean Blue", size: "M", stockQuantity: 10 },
      { sku: "WDR-SAN-L", color: "Cerulean Blue", size: "L", stockQuantity: 7 }
    ],
    tags: ["dress", "maxi", "linen", "summer", "vacation"]
  },
  {
    name: "Aura Bias-Cut Silk Slip Dress",
    slug: "aura-bias-cut-silk-slip-dress",
    subCategorySlug: "women-dresses",
    description: "90s-inspired minimalist slip dress cut on the bias in lustrous silk satin for an effortless fluid drape.",
    basePrice: 450000,
    material: "100% Silk Satin",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-SLP-XS", color: "Mocha Bronze", size: "XS", stockQuantity: 5 },
      { sku: "WDR-SLP-S", color: "Mocha Bronze", size: "S", stockQuantity: 8 },
      { sku: "WDR-SLP-M", color: "Mocha Bronze", size: "M", stockQuantity: 10 }
    ],
    tags: ["dress", "slip-dress", "silk", "minimal", "cocktail"]
  },
  {
    name: "Emerald Pleated Shirt Dress",
    slug: "emerald-pleated-shirt-dress",
    subCategorySlug: "women-dresses",
    description: "Midi-length shirt dress with accordion pleats, matching waist belt, and gold-tone buttons.",
    basePrice: 410000,
    material: "Polyester Twill with Crisp Pleating",
    careInstructions: "Dry clean recommended to preserve pleats.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-PLT-S", color: "Emerald", size: "S", stockQuantity: 6 },
      { sku: "WDR-PLT-M", color: "Emerald", size: "M", stockQuantity: 9 },
      { sku: "WDR-PLT-L", color: "Emerald", size: "L", stockQuantity: 6 }
    ],
    tags: ["dress", "shirt-dress", "pleated", "midi", "workwear"]
  },
  {
    name: "Ivory Cotton Poplin Wrap Dress",
    slug: "ivory-cotton-poplin-wrap-dress",
    subCategorySlug: "women-dresses",
    description: "Crisp cotton poplin wrap dress featuring an adjustable tie waist and elbow-length puff sleeves.",
    basePrice: 380000,
    material: "100% Organic Cotton Poplin",
    careInstructions: "Machine wash cold, warm iron.",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-WRP-S", color: "Ivory", size: "S", stockQuantity: 7 },
      { sku: "WDR-WRP-M", color: "Ivory", size: "M", stockQuantity: 11 },
      { sku: "WDR-WRP-L", color: "Ivory", size: "L", stockQuantity: 8 }
    ],
    tags: ["dress", "wrap-dress", "poplin", "cotton", "daywear"]
  },
  {
    name: "Crimson Velvet Midi Cocktail Dress",
    slug: "crimson-velvet-midi-cocktail-dress",
    subCategorySlug: "women-dresses",
    description: "Plush velvet bodycon midi dress featuring an asymmetrical neckline and gathered side drape.",
    basePrice: 490000,
    material: "Silk Velvet with Stretch Elastane",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-VLV-S", color: "Crimson", size: "S", stockQuantity: 5 },
      { sku: "WDR-VLV-M", color: "Crimson", size: "M", stockQuantity: 8 },
      { sku: "WDR-VLV-L", color: "Crimson", size: "L", stockQuantity: 4 }
    ],
    tags: ["dress", "velvet", "cocktail", "party", "midi"]
  },
  {
    name: "Botanical Chiffon Ruffle Tier Dress",
    slug: "botanical-chiffon-ruffle-tier-dress",
    subCategorySlug: "women-dresses",
    description: "Whimsical midi dress in botanical printed georgette chiffon with tiered ruffle details and sheer sleeves.",
    basePrice: 390000,
    salePrice: 330000,
    material: "Printed Poly Chiffon with Soft Jersey Lining",
    careInstructions: "Hand wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-BOT-S", color: "Floral Multi", size: "S", stockQuantity: 6 },
      { sku: "WDR-BOT-M", color: "Floral Multi", size: "M", stockQuantity: 10 },
      { sku: "WDR-BOT-L", color: "Floral Multi", size: "L", stockQuantity: 7 }
    ],
    tags: ["dress", "floral", "chiffon", "ruffle", "romantic"]
  },
  {
    name: "Tailored Blazer Dress with Satin Lapels",
    slug: "tailored-blazer-dress-with-satin-lapels",
    subCategorySlug: "women-dresses",
    description: "Sharp double-breasted tuxedo dress with contrasting lustrous satin peak lapels and covered buttons.",
    basePrice: 540000,
    material: "Virgin Wool-Blend Suiting",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-BLZ-XS", color: "Black", size: "XS", stockQuantity: 4 },
      { sku: "WDR-BLZ-S", color: "Black", size: "S", stockQuantity: 7 },
      { sku: "WDR-BLZ-M", color: "Black", size: "M", stockQuantity: 8 }
    ],
    tags: ["dress", "blazer-dress", "tuxedo", "tailored", "evening"]
  },
  {
    name: "Sunburst Yellow Halter Sundress",
    slug: "sunburst-yellow-halter-sundress",
    subCategorySlug: "women-dresses",
    description: "Backless halter neck sundress with sunburst pleated skirt and smocked back band.",
    basePrice: 320000,
    material: "Cotton Rayon Blend",
    careInstructions: "Hand wash cold, line dry.",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-HLT-S", color: "Sunburst Yellow", size: "S", stockQuantity: 8 },
      { sku: "WDR-HLT-M", color: "Sunburst Yellow", size: "M", stockQuantity: 11 },
      { sku: "WDR-HLT-L", color: "Sunburst Yellow", size: "L", stockQuantity: 6 }
    ],
    tags: ["dress", "sundress", "halter", "yellow", "summer"]
  },
  {
    name: "Cashmere-Knit Ribbed Turtleneck Dress",
    slug: "cashmere-knit-ribbed-turtleneck-dress",
    subCategorySlug: "women-dresses",
    description: "Luxurious fine-gauge rib knit sweater dress featuring a fold-over turtleneck and midi side split.",
    basePrice: 620000,
    material: "30% Mongolian Cashmere, 70% Merino Wool",
    careInstructions: "Specialist dry clean or hand wash cold in wool shampoo.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WDR-CSH-S", color: "Oatmeal Melange", size: "S", stockQuantity: 5 },
      { sku: "WDR-CSH-M", color: "Oatmeal Melange", size: "M", stockQuantity: 7 },
      { sku: "WDR-CSH-L", color: "Oatmeal Melange", size: "L", stockQuantity: 4 }
    ],
    tags: ["dress", "knit-dress", "cashmere", "winter", "luxury"]
  },

  // --- 6. Co-ord Sets (women-cord-set) ---
  {
    name: "Monochrome Linen Blazer & Shorts Set",
    slug: "monochrome-linen-blazer-and-shorts-set",
    subCategorySlug: "women-cord-set",
    description: "Effortless summer two-piece matching set: single-breasted relaxed blazer and high-waisted pleated tailored shorts.",
    basePrice: 560000,
    material: "100% Pre-washed Pure Linen",
    careInstructions: "Machine wash cold on gentle cycle, warm iron.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-SHR-XS", color: "Oat Sand", size: "XS", stockQuantity: 4 },
      { sku: "WCD-SHR-S", color: "Oat Sand", size: "S", stockQuantity: 8 },
      { sku: "WCD-SHR-M", color: "Oat Sand", size: "M", stockQuantity: 10 },
      { sku: "WCD-SHR-L", color: "Oat Sand", size: "L", stockQuantity: 6 }
    ],
    tags: ["co-ord", "matching-set", "linen", "blazer-set", "summer"]
  },
  {
    name: "Sage Pleated Trousers & Kimono Top Set",
    slug: "sage-pleated-trousers-and-kimono-top-set",
    subCategorySlug: "women-cord-set",
    description: "Flowing two-piece coordinates featuring a belted wrap kimono blouse and matching wide-leg pleated palazzo pants.",
    basePrice: 520000,
    salePrice: 440000,
    material: "100% Textured Crinkle Rayon",
    careInstructions: "Hand wash cold, line dry.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-KIM-S", color: "Sage Green", size: "S", stockQuantity: 6 },
      { sku: "WCD-KIM-M", color: "Sage Green", size: "M", stockQuantity: 9 },
      { sku: "WCD-KIM-L", color: "Sage Green", size: "L", stockQuantity: 5 }
    ],
    tags: ["co-ord", "kimono", "palazzo", "resort", "relaxed"]
  },
  {
    name: "Midnight Silk Satin Camisole & Pant Set",
    slug: "midnight-silk-satin-camisole-and-pant-set",
    subCategorySlug: "women-cord-set",
    description: "Sensual luxury evening co-ord set with a cowl-neck silk cami and tailored straight-cut satin trousers.",
    basePrice: 620000,
    material: "100% Pure Silk Satin",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-SAT-S", color: "Midnight Blue", size: "S", stockQuantity: 5 },
      { sku: "WCD-SAT-M", color: "Midnight Blue", size: "M", stockQuantity: 7 },
      { sku: "WCD-SAT-L", color: "Midnight Blue", size: "L", stockQuantity: 4 }
    ],
    tags: ["co-ord", "satin", "evening", "cocktail", "silk"]
  },
  {
    name: "Terracotta Cotton Rib Knit Lounge Set",
    slug: "terracotta-cotton-rib-knit-lounge-set",
    subCategorySlug: "women-cord-set",
    description: "Cosy knit co-ord pairing an oversized dropped-shoulder sweater with relaxed drawstring knit joggers.",
    basePrice: 420000,
    material: "90% Combed Cotton, 10% Cashmere-Touch Acrylic",
    careInstructions: "Machine wash cold on wool cycle.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-LNG-S", color: "Terracotta", size: "S", stockQuantity: 8 },
      { sku: "WCD-LNG-M", color: "Terracotta", size: "M", stockQuantity: 12 },
      { sku: "WCD-LNG-L", color: "Terracotta", size: "L", stockQuantity: 7 }
    ],
    tags: ["co-ord", "loungewear", "knit-set", "travel"]
  },
  {
    name: "Ivory Tweed Cropped Jacket & Skirt Set",
    slug: "ivory-tweed-cropped-jacket-and-skirt-set",
    subCategorySlug: "women-cord-set",
    description: "Classic Parisian-inspired two-piece bouclé tweed set with gold crest buttons and matching A-line mini skirt.",
    basePrice: 680000,
    material: "Textured Bouclé Tweed with Bemberg Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-TWD-XS", color: "Ivory", size: "XS", stockQuantity: 3 },
      { sku: "WCD-TWD-S", color: "Ivory", size: "S", stockQuantity: 6 },
      { sku: "WCD-TWD-M", color: "Ivory", size: "M", stockQuantity: 8 }
    ],
    tags: ["co-ord", "tweed", "parisian", "suit-set", "skirt-suit"]
  },
  {
    name: "Denim Utility Overshirt & Barrel Pant Set",
    slug: "denim-utility-overshirt-and-barrel-pant-set",
    subCategorySlug: "women-cord-set",
    description: "Contemporary denim-on-denim matching set in soft washed 11 oz cotton denim with antique brass hardware.",
    basePrice: 540000,
    salePrice: 460000,
    material: "100% Washed Indigo Cotton Denim",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-DNM-S", color: "Washed Mid-Blue", size: "S", stockQuantity: 7 },
      { sku: "WCD-DNM-M", color: "Washed Mid-Blue", size: "M", stockQuantity: 11 },
      { sku: "WCD-DNM-L", color: "Washed Mid-Blue", size: "L", stockQuantity: 6 }
    ],
    tags: ["co-ord", "denim", "utility", "streetwear"]
  },
  {
    name: "Black Pinstripe Waistcoat & Trouser Set",
    slug: "black-pinstripe-waistcoat-and-trouser-set",
    subCategorySlug: "women-cord-set",
    description: "Sharply tailored suiting vest and matching high-rise wide-leg trousers in subtle chalk pinstripes.",
    basePrice: 590000,
    material: "Poly-Viscose Tailoring Twill with Stretch",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-PIN-XS", color: "Pinstripe Black", size: "XS", stockQuantity: 4 },
      { sku: "WCD-PIN-S", color: "Pinstripe Black", size: "S", stockQuantity: 7 },
      { sku: "WCD-PIN-M", color: "Pinstripe Black", size: "M", stockQuantity: 9 },
      { sku: "WCD-PIN-L", color: "Pinstripe Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["co-ord", "waistcoat", "trousers", "pinstripe", "power-dressing"]
  },
  {
    name: "Butter Yellow Linen Halter Top & Midi Skirt Set",
    slug: "butter-yellow-linen-halter-top-and-midi-skirt-set",
    subCategorySlug: "women-cord-set",
    description: "Sunny two-piece vacation ensemble featuring a cropped halter neckline top and a tiered button-down midi skirt.",
    basePrice: 470000,
    material: "100% Linen",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-YEL-S", color: "Butter Yellow", size: "S", stockQuantity: 6 },
      { sku: "WCD-YEL-M", color: "Butter Yellow", size: "M", stockQuantity: 9 },
      { sku: "WCD-YEL-L", color: "Butter Yellow", size: "L", stockQuantity: 5 }
    ],
    tags: ["co-ord", "summer-set", "linen", "skirt-set", "resort"]
  },
  {
    name: "Olive Quilted Shacket & Shorts Travel Set",
    slug: "olive-quilted-shacket-and-shorts-travel-set",
    subCategorySlug: "women-cord-set",
    description: "Lightweight onion-quilted shacket and matching elasticized shorts in durable matte ripstop nylon.",
    basePrice: 480000,
    material: "100% Recycled Matte Nylon with Light Polyfill",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-QLT-S", color: "Olive", size: "S", stockQuantity: 5 },
      { sku: "WCD-QLT-M", color: "Olive", size: "M", stockQuantity: 8 },
      { sku: "WCD-QLT-L", color: "Olive", size: "L", stockQuantity: 4 }
    ],
    tags: ["co-ord", "quilted", "travel", "outerwear"]
  },
  {
    name: "Mocha Waffle-Knit Sweatshirt & Biker Set",
    slug: "mocha-waffle-knit-sweatshirt-and-biker-set",
    subCategorySlug: "women-cord-set",
    description: "Athleisure pairing of a half-zip relaxed waffle pullover and matching high-waisted seamless biker shorts.",
    basePrice: 380000,
    material: "100% Organic Waffle Cotton",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WCD-WFL-S", color: "Mocha", size: "S", stockQuantity: 9 },
      { sku: "WCD-WFL-M", color: "Mocha", size: "M", stockQuantity: 12 },
      { sku: "WCD-WFL-L", color: "Mocha", size: "L", stockQuantity: 7 }
    ],
    tags: ["co-ord", "athleisure", "waffle", "loungewear"]
  },

  // --- 7. Jeans & Bottoms (women-baggy-jeans) ---
  {
    name: "Architectural Wide-Leg Pleated Trousers",
    slug: "architectural-wide-leg-pleated-trousers",
    subCategorySlug: "women-baggy-jeans",
    description: "High-rise tailored trousers with deep front double pleats, slanted pockets, and clean floor-grazing drape.",
    basePrice: 360000,
    material: "Wool-Touch Poly-Viscose Suiting",
    careInstructions: "Dry clean or gentle hand wash.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-TR-BLK-XS", color: "Black", size: "XS", stockQuantity: 6 },
      { sku: "WBT-TR-BLK-S", color: "Black", size: "S", stockQuantity: 11 },
      { sku: "WBT-TR-BLK-M", color: "Black", size: "M", stockQuantity: 14 },
      { sku: "WBT-TR-BLK-L", color: "Black", size: "L", stockQuantity: 8 },
      { sku: "WBT-TR-BLK-XL", color: "Black", size: "XL", stockQuantity: 4 }
    ],
    tags: ["trousers", "pleated", "wide-leg", "tailored", "office"]
  },
  {
    name: "Vintage 90s Baggy Dad Jeans",
    slug: "vintage-90s-baggy-dad-jeans",
    subCategorySlug: "women-baggy-jeans",
    description: "Relaxed slouchy denim with an authentic stonewash patina, mid-rise waist, and wide straight legs.",
    basePrice: 340000,
    salePrice: 289000,
    material: "100% Rigid Non-Stretch Cotton Denim (13 oz)",
    careInstructions: "Machine wash cold inside out, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-BGY-26", color: "Vintage Blue", size: "S", stockQuantity: 8 },
      { sku: "WBT-BGY-28", color: "Vintage Blue", size: "M", stockQuantity: 15 },
      { sku: "WBT-BGY-30", color: "Vintage Blue", size: "L", stockQuantity: 12 },
      { sku: "WBT-BGY-32", color: "Vintage Blue", size: "XL", stockQuantity: 6 }
    ],
    tags: ["jeans", "baggy", "90s", "denim", "streetwear"]
  },
  {
    name: "Raw Indigo Straight-Leg Selvedge Jeans",
    slug: "raw-indigo-straight-leg-selvedge-jeans",
    subCategorySlug: "women-baggy-jeans",
    description: "Premium Japanese red-line selvedge denim tailored into a high-waisted, clean straight-leg silhouette.",
    basePrice: 480000,
    material: "100% Japanese Selvedge Denim",
    careInstructions: "Wash sparingly inside out in cold water.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-SLV-26", color: "Raw Indigo", size: "S", stockQuantity: 5 },
      { sku: "WBT-SLV-28", color: "Raw Indigo", size: "M", stockQuantity: 9 },
      { sku: "WBT-SLV-30", color: "Raw Indigo", size: "L", stockQuantity: 7 }
    ],
    tags: ["jeans", "selvedge", "raw-denim", "indigo", "premium"]
  },
  {
    name: "Ecru High-Waist Cargo Trousers",
    slug: "ecru-high-waist-cargo-trousers",
    subCategorySlug: "women-baggy-jeans",
    description: "Utilitarian cargo pants featuring bellows pockets, toggle cord cuffs, and durable cotton canvas construction.",
    basePrice: 320000,
    material: "100% Heavy Cotton Twill Canvas",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-CRG-S", color: "Ecru", size: "S", stockQuantity: 9 },
      { sku: "WBT-CRG-M", color: "Ecru", size: "M", stockQuantity: 13 },
      { sku: "WBT-CRG-L", color: "Ecru", size: "L", stockQuantity: 8 }
    ],
    tags: ["cargo", "trousers", "ecru", "utility", "casual"]
  },
  {
    name: "Pewter Grey Flannel Relaxed Pants",
    slug: "pewter-grey-flannel-relaxed-pants",
    subCategorySlug: "women-baggy-jeans",
    description: "Soft wool flannel trousers with comfortable elasticated back waistband and relaxed taper.",
    basePrice: 390000,
    material: "60% Wool, 40% Viscose Flannel",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-FLN-S", color: "Pewter Grey", size: "S", stockQuantity: 6 },
      { sku: "WBT-FLN-M", color: "Pewter Grey", size: "M", stockQuantity: 10 },
      { sku: "WBT-FLN-L", color: "Pewter Grey", size: "L", stockQuantity: 6 }
    ],
    tags: ["pants", "flannel", "wool", "winter", "tailored"]
  },
  {
    name: "Onyx Black Split-Hem Flare Trousers",
    slug: "onyx-black-split-hem-flare-trousers",
    subCategorySlug: "women-baggy-jeans",
    description: "Elongating stretch ponte flared trousers detailed with front seams and ankle-baring inner split hems.",
    basePrice: 310000,
    material: "Heavy Ponte di Roma Stretch Knit",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-FLR-XS", color: "Black", size: "XS", stockQuantity: 5 },
      { sku: "WBT-FLR-S", color: "Black", size: "S", stockQuantity: 9 },
      { sku: "WBT-FLR-M", color: "Black", size: "M", stockQuantity: 12 },
      { sku: "WBT-FLR-L", color: "Black", size: "L", stockQuantity: 7 }
    ],
    tags: ["trousers", "flare", "split-hem", "black", "evening"]
  },
  {
    name: "Sand Washed Tencel Palazzo Pants",
    slug: "sand-washed-tencel-palazzo-pants",
    subCategorySlug: "women-baggy-jeans",
    description: "Dramatic wide-leg palazzo trousers cut in fluid sand-washed tencel with a wide comfortable waistband.",
    basePrice: 350000,
    material: "100% Sandwashed Tencel",
    careInstructions: "Gentle wash cold, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-PLZ-S", color: "Sand", size: "S", stockQuantity: 7 },
      { sku: "WBT-PLZ-M", color: "Sand", size: "M", stockQuantity: 11 },
      { sku: "WBT-PLZ-L", color: "Sand", size: "L", stockQuantity: 8 }
    ],
    tags: ["palazzo", "trousers", "tencel", "wide-leg", "summer"]
  },
  {
    name: "Classic High-Rise Slim Cigarette Pants",
    slug: "classic-high-rise-slim-cigarette-pants",
    subCategorySlug: "women-baggy-jeans",
    description: "Clean ankle-skimming cigarette trousers with razor-sharp crease lines and discrete concealed side zip.",
    basePrice: 330000,
    material: "Cotton Stretch Gabardine",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-CIG-XS", color: "Navy", size: "XS", stockQuantity: 4 },
      { sku: "WBT-CIG-S", color: "Navy", size: "S", stockQuantity: 8 },
      { sku: "WBT-CIG-M", color: "Navy", size: "M", stockQuantity: 11 },
      { sku: "WBT-CIG-L", color: "Navy", size: "L", stockQuantity: 6 }
    ],
    tags: ["trousers", "cigarette-pant", "slim", "workwear", "navy"]
  },
  {
    name: "Washed Black Distressed Boyfriend Jeans",
    slug: "washed-black-distressed-boyfriend-jeans",
    subCategorySlug: "women-baggy-jeans",
    description: "Relaxed mid-rise boyfriend jeans featuring hand-distressed knee abrasions and a vintage enzyme washed finish.",
    basePrice: 350000,
    salePrice: 295000,
    material: "100% Cotton Denim",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-BF-26", color: "Washed Black", size: "S", stockQuantity: 7 },
      { sku: "WBT-BF-28", color: "Washed Black", size: "M", stockQuantity: 12 },
      { sku: "WBT-BF-30", color: "Washed Black", size: "L", stockQuantity: 8 }
    ],
    tags: ["jeans", "boyfriend", "distressed", "denim", "black"]
  },
  {
    name: "Olive Drawstring Linen Beach Trousers",
    slug: "olive-drawstring-linen-beach-trousers",
    subCategorySlug: "women-baggy-jeans",
    description: "Featherweight pull-on linen trousers with elasticated drawstring waist and casual cuffed hems.",
    basePrice: 295000,
    material: "100% Pure Linen",
    careInstructions: "Machine wash cold, air dry.",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WBT-LIN-S", color: "Olive", size: "S", stockQuantity: 8 },
      { sku: "WBT-LIN-M", color: "Olive", size: "M", stockQuantity: 14 },
      { sku: "WBT-LIN-L", color: "Olive", size: "L", stockQuantity: 9 }
    ],
    tags: ["linen", "pants", "drawstring", "beach", "summer"]
  },

  // --- 8. Outerwear (women-jacket) ---
  {
    name: "Camel Wool Double-Breasted Overcoat",
    slug: "camel-wool-double-breasted-overcoat",
    subCategorySlug: "women-jacket",
    description: "Commanding tailored overcoat in pure camel virgin wool featuring exaggerated notch lapels, storm flap, and horn buttons.",
    basePrice: 890000,
    material: "100% Virgin Wool with Cupro Bemberg Lining",
    careInstructions: "Dry clean only. Store on wide wooden hanger.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-OVC-S", color: "Camel", size: "S", stockQuantity: 5 },
      { sku: "WJK-OVC-M", color: "Camel", size: "M", stockQuantity: 8 },
      { sku: "WJK-OVC-L", color: "Camel", size: "L", stockQuantity: 4 }
    ],
    tags: ["coat", "overcoat", "wool", "camel", "winter", "outerwear"]
  },
  {
    name: "Onyx Hourglass Sculpted Blazer",
    slug: "onyx-hourglass-sculpted-blazer",
    subCategorySlug: "women-jacket",
    description: "Modern power blazer featuring a cinched hourglass waist, padded shoulder architecture, and clean jet pockets.",
    basePrice: 620000,
    material: "Italian Stretch Wool Suiting",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-BLZ-XS", color: "Onyx Black", size: "XS", stockQuantity: 4 },
      { sku: "WJK-BLZ-S", color: "Onyx Black", size: "S", stockQuantity: 7 },
      { sku: "WJK-BLZ-M", color: "Onyx Black", size: "M", stockQuantity: 9 },
      { sku: "WJK-BLZ-L", color: "Onyx Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["blazer", "tailored", "hourglass", "power-blazer", "black"]
  },
  {
    name: "Classic Beige Gabardine Trench Coat",
    slug: "classic-beige-gabardine-trench-coat",
    subCategorySlug: "women-jacket",
    description: "Heritage double-breasted trench coat in weatherproof cotton gabardine with leather-buckled belt and gun flaps.",
    basePrice: 780000,
    salePrice: 690000,
    material: "100% Water-Resistant Cotton Gabardine",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-TRN-S", color: "Honey Beige", size: "S", stockQuantity: 6 },
      { sku: "WJK-TRN-M", color: "Honey Beige", size: "M", stockQuantity: 9 },
      { sku: "WJK-TRN-L", color: "Honey Beige", size: "L", stockQuantity: 5 }
    ],
    tags: ["trench-coat", "weatherproof", "classic", "heritage"]
  },
  {
    name: "Distressed Leather Biker Jacket",
    slug: "distressed-leather-biker-jacket",
    subCategorySlug: "women-jacket",
    description: "Asymmetrical moto jacket crafted from supple hand-waxed lambskin leather with silver hardware and shoulder epaulettes.",
    basePrice: 1150000,
    material: "100% Genuine Lambskin Leather",
    careInstructions: "Specialist leather dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-MOT-S", color: "Vintage Black", size: "S", stockQuantity: 4 },
      { sku: "WJK-MOT-M", color: "Vintage Black", size: "M", stockQuantity: 6 },
      { sku: "WJK-MOT-L", color: "Vintage Black", size: "L", stockQuantity: 3 }
    ],
    tags: ["leather", "biker-jacket", "moto", "black", "edgy"]
  },
  {
    name: "Heavyweight Boxy Fleece Hoodie",
    slug: "heavyweight-boxy-fleece-hoodie",
    subCategorySlug: "women-jacket",
    description: "Substantial 450 GSM cotton fleece pullover hoodie with double-layer hood, hidden phone pouch, and drop shoulders.",
    basePrice: 280000,
    material: "100% Organic French Terry Fleece (450 GSM)",
    careInstructions: "Machine wash cold inside out, tumble dry low.",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-HOD-S", color: "Oatmeal Heather", size: "S", stockQuantity: 10 },
      { sku: "WJK-HOD-M", color: "Oatmeal Heather", size: "M", stockQuantity: 15 },
      { sku: "WJK-HOD-L", color: "Oatmeal Heather", size: "L", stockQuantity: 9 }
    ],
    tags: ["hoodie", "sweatshirt", "fleece", "heavyweight", "streetwear"]
  },
  {
    name: "Olive Quilted Lightweight Liner Jacket",
    slug: "olive-quilted-lightweight-liner-jacket",
    subCategorySlug: "women-jacket",
    description: "Versatile collarless onion-quilted jacket with corduroy binding, dual patch pockets, and snap-front closures.",
    basePrice: 380000,
    material: "Recycled Ripstop Nylon with Eco-Down fill",
    careInstructions: "Machine wash cold, tumble dry with tennis balls.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-LIN-S", color: "Military Olive", size: "S", stockQuantity: 7 },
      { sku: "WJK-LIN-M", color: "Military Olive", size: "M", stockQuantity: 10 },
      { sku: "WJK-LIN-L", color: "Military Olive", size: "L", stockQuantity: 6 }
    ],
    tags: ["jacket", "quilted", "liner", "lightweight", "olive"]
  },
  {
    name: "Charcoal Cashmere-Blend Cocoon Coat",
    slug: "charcoal-cashmere-blend-cocoon-coat",
    subCategorySlug: "women-jacket",
    description: "Voluminous cocoon silhouette coat cut in a sumptuous wool-cashmere blend with concealed snap closures.",
    basePrice: 940000,
    material: "20% Cashmere, 80% Superfine Wool",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-CCN-S", color: "Charcoal Melange", size: "S", stockQuantity: 4 },
      { sku: "WJK-CCN-M", color: "Charcoal Melange", size: "M", stockQuantity: 6 }
    ],
    tags: ["coat", "cocoon", "cashmere", "charcoal", "luxury"]
  },
  {
    name: "Cream Faux-Shearling Aviator Jacket",
    slug: "cream-faux-shearling-aviator-jacket",
    subCategorySlug: "women-jacket",
    description: "Plush faux-shearling jacket styled with faux-suede trim, buckled collar strap, and warm fleece interior.",
    basePrice: 650000,
    salePrice: 550000,
    material: "Heavy Faux Shearling & Micro-Suede",
    careInstructions: "Specialist clean only.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-AVT-S", color: "Cream", size: "S", stockQuantity: 5 },
      { sku: "WJK-AVT-M", color: "Cream", size: "M", stockQuantity: 7 },
      { sku: "WJK-AVT-L", color: "Cream", size: "L", stockQuantity: 4 }
    ],
    tags: ["jacket", "aviator", "shearling", "winter", "cozy"]
  },
  {
    name: "Vintage Washed Oversized Denim Jacket",
    slug: "vintage-washed-oversized-denim-jacket",
    subCategorySlug: "women-jacket",
    description: "Authentic trucker jacket in heavy 14 oz cotton denim with dropped shoulders and shank metal buttons.",
    basePrice: 390000,
    material: "100% Rigid Cotton Denim",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-TRK-S", color: "Washed Indigo", size: "S", stockQuantity: 8 },
      { sku: "WJK-TRK-M", color: "Washed Indigo", size: "M", stockQuantity: 12 },
      { sku: "WJK-TRK-L", color: "Washed Indigo", size: "L", stockQuantity: 7 }
    ],
    tags: ["denim", "jacket", "trucker", "oversized", "casual"]
  },
  {
    name: "Black Padded Down Puffer Jacket",
    slug: "black-padded-down-puffer-jacket",
    subCategorySlug: "women-jacket",
    description: "Cropped high-collar puffer jacket filled with premium 700 fill-power duck down and finished with matte water-repellent shell.",
    basePrice: 690000,
    material: "Water-repellent Poly Shell with 90/10 Duck Down fill",
    careInstructions: "Machine wash gentle cold, tumble dry with dryer balls.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "WJK-PUF-S", color: "Matte Black", size: "S", stockQuantity: 6 },
      { sku: "WJK-PUF-M", color: "Matte Black", size: "M", stockQuantity: 9 },
      { sku: "WJK-PUF-L", color: "Matte Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["puffer", "jacket", "down", "winter", "black"]
  }
];

