import { SeedProductItem } from "../catalog-data-definitions";

export const MEN_PRODUCTS: SeedProductItem[] = [
  // --- 1. Panjabi (men-panjabi) ---
  {
    name: "Embroidered Raw Silk Festive Panjabi",
    slug: "embroidered-raw-silk-festive-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Royal tailored festive panjabi in pure raw silk with understated tone-on-tone embroidery on the placket and mandarin collar.",
    basePrice: 580000,
    salePrice: 495000,
    material: "100% Pure Raw Silk with Soft Cotton Lining",
    careInstructions: "Dry clean only. Press inside out with medium heat.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-RS-IVR-38", color: "Ivory", size: "S", stockQuantity: 6 },
      { sku: "MPN-RS-IVR-40", color: "Ivory", size: "M", stockQuantity: 10 },
      { sku: "MPN-RS-IVR-42", color: "Ivory", size: "L", stockQuantity: 12 },
      { sku: "MPN-RS-IVR-44", color: "Ivory", size: "XL", stockQuantity: 7 },
      { sku: "MPN-RS-IVR-46", color: "Ivory", size: "XXL", stockQuantity: 4 }
    ],
    tags: ["panjabi", "silk", "festive", "eid", "traditional"]
  },
  {
    name: "Midnight Black Minimalist Cotton Panjabi",
    slug: "midnight-black-minimalist-cotton-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Crisp black combed cotton panjabi with matte metal snap closures and clean architectural lines.",
    basePrice: 340000,
    material: "100% Giza Long-Staple Cotton",
    careInstructions: "Machine wash cold, shade dry.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-MIN-BLK-38", color: "Black", size: "S", stockQuantity: 8 },
      { sku: "MPN-MIN-BLK-40", color: "Black", size: "M", stockQuantity: 15 },
      { sku: "MPN-MIN-BLK-42", color: "Black", size: "L", stockQuantity: 14 },
      { sku: "MPN-MIN-BLK-44", color: "Black", size: "XL", stockQuantity: 9 }
    ],
    tags: ["panjabi", "cotton", "black", "minimalist", "friday-wear"]
  },
  {
    name: "Classic Beige Pure Linen Panjabi",
    slug: "classic-beige-pure-linen-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Breathable European flax linen panjabi finished with natural wooden buttons and side welt pockets.",
    basePrice: 420000,
    material: "100% French Flax Linen",
    careInstructions: "Machine wash gentle cycle cold, warm steam iron.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-LIN-BGE-38", color: "Beige", size: "S", stockQuantity: 7 },
      { sku: "MPN-LIN-BGE-40", color: "Beige", size: "M", stockQuantity: 12 },
      { sku: "MPN-LIN-BGE-42", color: "Beige", size: "L", stockQuantity: 11 },
      { sku: "MPN-LIN-BGE-44", color: "Beige", size: "XL", stockQuantity: 6 }
    ],
    tags: ["panjabi", "linen", "summer", "breathable", "casual"]
  },
  {
    name: "Heritage Jamdani Weave White Panjabi",
    slug: "heritage-jamdani-weave-white-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Handwoven white muslin panjabi showcasing heritage geometric Jamdani motifs on a featherlight base.",
    basePrice: 650000,
    material: "Handloom Muslin Cotton with Handcrafted Jamdani Weave",
    careInstructions: "Gentle hand wash in cold water or dry clean.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-JAM-WHT-38", color: "Pure White", size: "S", stockQuantity: 5 },
      { sku: "MPN-JAM-WHT-40", color: "Pure White", size: "M", stockQuantity: 9 },
      { sku: "MPN-JAM-WHT-42", color: "Pure White", size: "L", stockQuantity: 8 },
      { sku: "MPN-JAM-WHT-44", color: "Pure White", size: "XL", stockQuantity: 4 }
    ],
    tags: ["panjabi", "jamdani", "handwoven", "heritage", "luxury"]
  },
  {
    name: "Royal Navy Jacquard Silk Panjabi",
    slug: "royal-navy-jacquard-silk-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Deep navy panjabi featuring woven self-jacquard damask textures and subtle antique brass button details.",
    basePrice: 480000,
    material: "Silk-Cotton Blend Jacquard",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-JAC-NAV-38", color: "Royal Navy", size: "S", stockQuantity: 6 },
      { sku: "MPN-JAC-NAV-40", color: "Royal Navy", size: "M", stockQuantity: 10 },
      { sku: "MPN-JAC-NAV-42", color: "Royal Navy", size: "L", stockQuantity: 9 },
      { sku: "MPN-JAC-NAV-44", color: "Royal Navy", size: "XL", stockQuantity: 5 }
    ],
    tags: ["panjabi", "jacquard", "navy", "wedding", "evening"]
  },
  {
    name: "Sage Green Khadi Textured Panjabi",
    slug: "sage-green-khadi-textured-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Earthy sage green handloom khadi panjabi with natural slub variations and refined bone buttons.",
    basePrice: 295000,
    material: "100% Hand-spun Khadi Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-KHD-SGE-38", color: "Sage Green", size: "S", stockQuantity: 8 },
      { sku: "MPN-KHD-SGE-40", color: "Sage Green", size: "M", stockQuantity: 14 },
      { sku: "MPN-KHD-SGE-42", color: "Sage Green", size: "L", stockQuantity: 12 }
    ],
    tags: ["panjabi", "khadi", "organic", "earthy", "casual"]
  },
  {
    name: "Crimson Maroon Zari Trim Wedding Panjabi",
    slug: "crimson-maroon-zari-trim-wedding-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Opulent crimson wedding panjabi adorned with delicate gold cord piping and handcrafted potli buttons.",
    basePrice: 720000,
    material: "Semi-Matte Dupion Silk with Zari Accents",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-WED-MAR-40", color: "Crimson Maroon", size: "M", stockQuantity: 7 },
      { sku: "MPN-WED-MAR-42", color: "Crimson Maroon", size: "L", stockQuantity: 8 },
      { sku: "MPN-WED-MAR-44", color: "Crimson Maroon", size: "XL", stockQuantity: 5 }
    ],
    tags: ["panjabi", "wedding", "groom", "maroon", "festive"]
  },
  {
    name: "Charcoal Melange Modern Cut Panjabi",
    slug: "charcoal-melange-modern-cut-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Slim-tailored contemporary panjabi in two-tone charcoal melange cotton with side-zip pocket.",
    basePrice: 360000,
    salePrice: 310000,
    material: "Melange Cotton Twill",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-MOD-CHR-38", color: "Charcoal", size: "S", stockQuantity: 7 },
      { sku: "MPN-MOD-CHR-40", color: "Charcoal", size: "M", stockQuantity: 11 },
      { sku: "MPN-MOD-CHR-42", color: "Charcoal", size: "L", stockQuantity: 10 },
      { sku: "MPN-MOD-CHR-44", color: "Charcoal", size: "XL", stockQuantity: 6 }
    ],
    tags: ["panjabi", "modern", "charcoal", "slim-fit"]
  },
  {
    name: "Mustard Gold Dobby Cotton Panjabi",
    slug: "mustard-gold-dobby-cotton-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Vibrant festive panjabi in textured dobby cotton with geometric micro-weaving and engraved metal buttons.",
    basePrice: 330000,
    material: "100% Combed Dobby Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-DOB-MST-38", color: "Mustard", size: "S", stockQuantity: 8 },
      { sku: "MPN-DOB-MST-40", color: "Mustard", size: "M", stockQuantity: 13 },
      { sku: "MPN-DOB-MST-42", color: "Mustard", size: "L", stockQuantity: 10 }
    ],
    tags: ["panjabi", "mustard", "haldi", "festive", "dobby"]
  },
  {
    name: "Olive Green Pintuck Detail Kurta Panjabi",
    slug: "olive-green-pintuck-detail-kurta-panjabi",
    subCategorySlug: "men-panjabi",
    description: "Refined olive cotton panjabi accented with vertical micro-pintuck panels across the chest and cuffs.",
    basePrice: 375000,
    material: "100% Supima Cotton",
    careInstructions: "Machine wash cold, steam iron.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPN-PIN-OLV-38", color: "Olive Green", size: "S", stockQuantity: 6 },
      { sku: "MPN-PIN-OLV-40", color: "Olive Green", size: "M", stockQuantity: 10 },
      { sku: "MPN-PIN-OLV-42", color: "Olive Green", size: "L", stockQuantity: 9 }
    ],
    tags: ["panjabi", "pintuck", "olive", "smartcasual"]
  },

  // --- 2. Ethnic Wear / Waistcoat (men-waistcoat) ---
  {
    name: "Midnight Silk Jacquard Nehru Waistcoat",
    slug: "midnight-silk-jacquard-nehru-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Structured formal waistcoat in midnight blue self-jacquard with mandarin collar, welt chest pocket, and antique metal crest buttons.",
    basePrice: 420000,
    salePrice: 360000,
    material: "Silk-Viscose Jacquard with Satin Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-NEH-MID-38", color: "Midnight Blue", size: "S", stockQuantity: 6 },
      { sku: "MWC-NEH-MID-40", color: "Midnight Blue", size: "M", stockQuantity: 9 },
      { sku: "MWC-NEH-MID-42", color: "Midnight Blue", size: "L", stockQuantity: 8 },
      { sku: "MWC-NEH-MID-44", color: "Midnight Blue", size: "XL", stockQuantity: 4 }
    ],
    tags: ["waistcoat", "nehru-jacket", "ethnic", "festive", "formal"]
  },
  {
    name: "Classic Beige Raw Silk Modi Vest",
    slug: "classic-beige-raw-silk-modi-vest",
    subCategorySlug: "men-waistcoat",
    description: "Timeless sleeveless ethnic jacket tailored from textured tussar silk, designed to pair over solid panjabis.",
    basePrice: 380000,
    material: "Pure Raw Silk with Bemberg Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-RAW-BGE-38", color: "Beige", size: "S", stockQuantity: 5 },
      { sku: "MWC-RAW-BGE-40", color: "Beige", size: "M", stockQuantity: 8 },
      { sku: "MWC-RAW-BGE-42", color: "Beige", size: "L", stockQuantity: 7 }
    ],
    tags: ["waistcoat", "raw-silk", "beige", "ethnic", "wedding"]
  },
  {
    name: "Black Velvet Embroidered Bandhgala Waistcoat",
    slug: "black-velvet-embroidered-bandhgala-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Luxurious deep black micro-velvet waistcoat with subtle tone-on-tone thread embroidery and satin piping.",
    basePrice: 520000,
    material: "Plush Silk Velvet with Acetate Lining",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-VLV-BLK-38", color: "Black", size: "S", stockQuantity: 4 },
      { sku: "MWC-VLV-BLK-40", color: "Black", size: "M", stockQuantity: 7 },
      { sku: "MWC-VLV-BLK-42", color: "Black", size: "L", stockQuantity: 6 }
    ],
    tags: ["waistcoat", "velvet", "bandhgala", "luxury", "evening"]
  },
  {
    name: "Earthy Sage Handloom Khadi Waistcoat",
    slug: "earthy-sage-handloom-khadi-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Casual summer ethnic vest in slub khadi cotton with contrast horn buttons and adjustable back cinch.",
    basePrice: 280000,
    material: "100% Handloom Khadi Cotton",
    careInstructions: "Dry clean or gentle hand wash.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-KHD-SGE-38", color: "Sage", size: "S", stockQuantity: 7 },
      { sku: "MWC-KHD-SGE-40", color: "Sage", size: "M", stockQuantity: 11 },
      { sku: "MWC-KHD-SGE-42", color: "Sage", size: "L", stockQuantity: 9 }
    ],
    tags: ["waistcoat", "khadi", "cotton", "casual", "summer"]
  },
  {
    name: "Royal Emerald Brocade Festive Vest",
    slug: "royal-emerald-brocade-festive-vest",
    subCategorySlug: "men-waistcoat",
    description: "Traditional Banarasi brocade waistcoat featuring intricate floral gold zari jaal across an emerald green base.",
    basePrice: 490000,
    material: "Banarasi Silk Brocade",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-BRO-EMR-38", color: "Emerald Gold", size: "S", stockQuantity: 5 },
      { sku: "MWC-BRO-EMR-40", color: "Emerald Gold", size: "M", stockQuantity: 8 },
      { sku: "MWC-BRO-EMR-42", color: "Emerald Gold", size: "L", stockQuantity: 6 }
    ],
    tags: ["waistcoat", "brocade", "festive", "wedding", "emerald"]
  },
  {
    name: "Charcoal Wool-Blend Tailored Waistcoat",
    slug: "charcoal-wool-blend-tailored-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Sleek tailored vest crafted from superfine wool blend with five-button stance and smooth satin back panel.",
    basePrice: 340000,
    material: "Wool-Poly Tailoring Fabric",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-WOL-CHR-38", color: "Charcoal", size: "S", stockQuantity: 6 },
      { sku: "MWC-WOL-CHR-40", color: "Charcoal", size: "M", stockQuantity: 10 },
      { sku: "MWC-WOL-CHR-42", color: "Charcoal", size: "L", stockQuantity: 8 }
    ],
    tags: ["waistcoat", "wool", "tailored", "charcoal", "formal"]
  },
  {
    name: "Ivory Dobby Cotton Minimalist Vest",
    slug: "ivory-dobby-cotton-minimalist-vest",
    subCategorySlug: "men-waistcoat",
    description: "Pristine ivory waistcoat in woven micro-dobby cotton with concealed snap closures and minimal profile.",
    basePrice: 295000,
    material: "100% Cotton Dobby",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-DOB-IVR-38", color: "Ivory", size: "S", stockQuantity: 7 },
      { sku: "MWC-DOB-IVR-40", color: "Ivory", size: "M", stockQuantity: 11 },
      { sku: "MWC-DOB-IVR-42", color: "Ivory", size: "L", stockQuantity: 9 }
    ],
    tags: ["waistcoat", "ivory", "cotton", "minimal", "eid"]
  },
  {
    name: "Burgundy Velvet Asymmetric Cut Waistcoat",
    slug: "burgundy-velvet-asymmetric-cut-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Modern asymmetric overlap front vest in rich wine burgundy velvet with geometric loop fastenings.",
    basePrice: 540000,
    salePrice: 470000,
    material: "Silk Velvet with Satin Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-ASY-BUR-40", color: "Burgundy", size: "M", stockQuantity: 6 },
      { sku: "MWC-ASY-BUR-42", color: "Burgundy", size: "L", stockQuantity: 7 },
      { sku: "MWC-ASY-BUR-44", color: "Burgundy", size: "XL", stockQuantity: 4 }
    ],
    tags: ["waistcoat", "asymmetric", "burgundy", "velvet", "designer"]
  },
  {
    name: "Mustard Silk Blend Festive Waistcoat",
    slug: "mustard-silk-blend-festive-waistcoat",
    subCategorySlug: "men-waistcoat",
    description: "Vibrant yellow festive vest tailored with mandarin collar and matching covered buttons for ceremonial occasions.",
    basePrice: 360000,
    material: "Dupion Silk-Polyester Blend",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-SLK-MST-38", color: "Mustard", size: "S", stockQuantity: 6 },
      { sku: "MWC-SLK-MST-40", color: "Mustard", size: "M", stockQuantity: 10 },
      { sku: "MWC-SLK-MST-42", color: "Mustard", size: "L", stockQuantity: 8 }
    ],
    tags: ["waistcoat", "mustard", "haldi", "festive", "silk"]
  },
  {
    name: "Steel Grey Linen Blend Summer Vest",
    slug: "steel-grey-linen-blend-summer-vest",
    subCategorySlug: "men-waistcoat",
    description: "Breathable lightweight linen vest with tailored darts, horn button closures, and soft chambray lining.",
    basePrice: 310000,
    material: "55% Linen, 45% Cotton",
    careInstructions: "Gentle wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MWC-LIN-GRY-38", color: "Steel Grey", size: "S", stockQuantity: 8 },
      { sku: "MWC-LIN-GRY-40", color: "Steel Grey", size: "M", stockQuantity: 12 },
      { sku: "MWC-LIN-GRY-42", color: "Steel Grey", size: "L", stockQuantity: 9 }
    ],
    tags: ["waistcoat", "linen", "grey", "summer", "smartcasual"]
  },

  // --- 3. Shirts (men-shirt) ---
  {
    name: "Crisp White Italian Poplin Dress Shirt",
    slug: "crisp-white-italian-poplin-dress-shirt",
    subCategorySlug: "men-shirt",
    description: "Formal tailored dress shirt crafted in 120-thread-count Italian poplin with semi-spread collar and mother-of-pearl buttons.",
    basePrice: 320000,
    material: "100% Extra-Long Staple Cotton Poplin",
    careInstructions: "Machine wash warm, hang dry, hot steam iron.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-POP-WHT-S", color: "Pure White", size: "S", stockQuantity: 10 },
      { sku: "MSH-POP-WHT-M", color: "Pure White", size: "M", stockQuantity: 16 },
      { sku: "MSH-POP-WHT-L", color: "Pure White", size: "L", stockQuantity: 14 },
      { sku: "MSH-POP-WHT-XL", color: "Pure White", size: "XL", stockQuantity: 8 },
      { sku: "MSH-POP-WHT-XXL", color: "Pure White", size: "XXL", stockQuantity: 5 }
    ],
    tags: ["shirt", "dress-shirt", "white", "formal", "office", "business"]
  },
  {
    name: "Onyx Washed French Linen Casual Shirt",
    slug: "onyx-washed-french-linen-casual-shirt",
    subCategorySlug: "men-shirt",
    description: "Relaxed button-down shirt made from breathable Normandy linen, pre-washed for effortless drape and texture.",
    basePrice: 360000,
    material: "100% French Flax Linen",
    careInstructions: "Machine wash cold, line dry in shade.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-LIN-BLK-S", color: "Onyx Black", size: "S", stockQuantity: 8 },
      { sku: "MSH-LIN-BLK-M", color: "Onyx Black", size: "M", stockQuantity: 14 },
      { sku: "MSH-LIN-BLK-L", color: "Onyx Black", size: "L", stockQuantity: 12 },
      { sku: "MSH-LIN-BLK-XL", color: "Onyx Black", size: "XL", stockQuantity: 7 }
    ],
    tags: ["shirt", "linen", "black", "summer", "casual"]
  },
  {
    name: "Classic Sky Blue Oxford Cloth Button-Down",
    slug: "classic-sky-blue-oxford-cloth-button-down",
    subCategorySlug: "men-shirt",
    description: "Heritage OCBD shirt featuring heavy basketweave Oxford cloth, soft button-down collar roll, and box pleat.",
    basePrice: 285000,
    material: "100% Combed Heavy Oxford Cotton",
    careInstructions: "Machine wash warm, tumble dry medium.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-OXF-BLU-S", color: "Sky Blue", size: "S", stockQuantity: 12 },
      { sku: "MSH-OXF-BLU-M", color: "Sky Blue", size: "M", stockQuantity: 18 },
      { sku: "MSH-OXF-BLU-L", color: "Sky Blue", size: "L", stockQuantity: 15 },
      { sku: "MSH-OXF-BLU-XL", color: "Sky Blue", size: "XL", stockQuantity: 9 }
    ],
    tags: ["shirt", "ocbd", "oxford", "blue", "preppy", "smartcasual"]
  },
  {
    name: "Navy Bengal Stripe Tailored Shirt",
    slug: "navy-bengal-stripe-tailored-shirt",
    subCategorySlug: "men-shirt",
    description: "Sharp navy-and-white Bengal stripe shirt with cutaway collar, double-barrel cuffs, and tailored slim fit.",
    basePrice: 310000,
    salePrice: 265000,
    material: "100% Compact Spun Cotton",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-STR-NAV-S", color: "Navy Stripe", size: "S", stockQuantity: 9 },
      { sku: "MSH-STR-NAV-M", color: "Navy Stripe", size: "M", stockQuantity: 14 },
      { sku: "MSH-STR-NAV-L", color: "Navy Stripe", size: "L", stockQuantity: 11 }
    ],
    tags: ["shirt", "striped", "bengal-stripe", "business", "formal"]
  },
  {
    name: "Military Olive Cotton Utility Overshirt",
    slug: "military-olive-cotton-utility-overshirt",
    subCategorySlug: "men-shirt",
    description: "Rugged shacket crafted from heavy 9 oz cotton twill with dual button-flap chest pockets and reinforced elbows.",
    basePrice: 390000,
    material: "100% Heavy Cotton Twill",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-UTL-OLV-S", color: "Military Olive", size: "S", stockQuantity: 7 },
      { sku: "MSH-UTL-OLV-M", color: "Military Olive", size: "M", stockQuantity: 12 },
      { sku: "MSH-UTL-OLV-L", color: "Military Olive", size: "L", stockQuantity: 10 },
      { sku: "MSH-UTL-OLV-XL", color: "Military Olive", size: "XL", stockQuantity: 6 }
    ],
    tags: ["overshirt", "utility", "shacket", "olive", "layering"]
  },
  {
    name: "Cuban Collar Camp Resort Shirt",
    slug: "cuban-collar-camp-resort-shirt",
    subCategorySlug: "men-shirt",
    description: "Retro open-collar summer shirt in smooth modal-tencel blend with straight hem and subtle side splits.",
    basePrice: 275000,
    material: "70% Tencel, 30% Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-CUB-SGE-S", color: "Sage", size: "S", stockQuantity: 8 },
      { sku: "MSH-CUB-SGE-M", color: "Sage", size: "M", stockQuantity: 13 },
      { sku: "MSH-CUB-SGE-L", color: "Sage", size: "L", stockQuantity: 11 }
    ],
    tags: ["shirt", "camp-collar", "cuban", "resort", "summer"]
  },
  {
    name: "Washed Indigo Denim Western Shirt",
    slug: "washed-indigo-denim-western-shirt",
    subCategorySlug: "men-shirt",
    description: "Authentic western denim shirt featuring pointed yokes, pearl snap closures, and subtle hand-sanded fades.",
    basePrice: 340000,
    material: "100% Lightweight Cotton Denim",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-WST-IND-S", color: "Washed Indigo", size: "S", stockQuantity: 8 },
      { sku: "MSH-WST-IND-M", color: "Washed Indigo", size: "M", stockQuantity: 14 },
      { sku: "MSH-WST-IND-L", color: "Washed Indigo", size: "L", stockQuantity: 12 }
    ],
    tags: ["shirt", "denim", "western", "casual", "snap-button"]
  },
  {
    name: "Sandstone Corduroy Long-Sleeve Shirt",
    slug: "sandstone-corduroy-long-sleeve-shirt",
    subCategorySlug: "men-shirt",
    description: "Soft fine-wale 21-wale corduroy shirt offering tactile warmth, chest pocket, and horn buttons.",
    basePrice: 350000,
    material: "100% Cotton Micro-Corduroy",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-CRD-SND-S", color: "Sandstone", size: "S", stockQuantity: 7 },
      { sku: "MSH-CRD-SND-M", color: "Sandstone", size: "M", stockQuantity: 11 },
      { sku: "MSH-CRD-SND-L", color: "Sandstone", size: "L", stockQuantity: 9 }
    ],
    tags: ["shirt", "corduroy", "sandstone", "autumn", "casual"]
  },
  {
    name: "Graphite Micro-Houndstooth Business Shirt",
    slug: "graphite-micro-houndstooth-business-shirt",
    subCategorySlug: "men-shirt",
    description: "Understated micro-patterned dress shirt in fine two-ply cotton with removable collar stays.",
    basePrice: 330000,
    material: "100% Two-Ply Cotton",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-HND-GRP-S", color: "Graphite", size: "S", stockQuantity: 9 },
      { sku: "MSH-HND-GRP-M", color: "Graphite", size: "M", stockQuantity: 15 },
      { sku: "MSH-HND-GRP-L", color: "Graphite", size: "L", stockQuantity: 12 }
    ],
    tags: ["shirt", "houndstooth", "formal", "office", "executive"]
  },
  {
    name: "Natural Raw Silk Mandarin Collar Shirt",
    slug: "natural-raw-silk-mandarin-collar-shirt",
    subCategorySlug: "men-shirt",
    description: "Contemporary band-collar button-up shirt in breathable raw tussar silk with clean French placket.",
    basePrice: 450000,
    salePrice: 390000,
    material: "Pure Tussar Raw Silk",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSH-MND-NAT-S", color: "Natural", size: "S", stockQuantity: 5 },
      { sku: "MSH-MND-NAT-M", color: "Natural", size: "M", stockQuantity: 8 },
      { sku: "MSH-MND-NAT-L", color: "Natural", size: "L", stockQuantity: 7 }
    ],
    tags: ["shirt", "mandarin-collar", "silk", "minimalist", "luxury"]
  },

  // --- 4. Polo Shirts (men-polo-shirt) ---
  {
    name: "Mercerized Cotton Knit Polo Shirt",
    slug: "mercerized-cotton-knit-polo-shirt",
    subCategorySlug: "men-polo-shirt",
    description: "Luxurious fine-gauge sweater knit polo in double-mercerized Egyptian cotton with smooth silk-like finish.",
    basePrice: 280000,
    material: "100% Double-Mercerized Giza Cotton",
    careInstructions: "Hand wash cold or gentle machine cycle in mesh bag.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-MRC-BLK-S", color: "Black", size: "S", stockQuantity: 8 },
      { sku: "MPL-MRC-BLK-M", color: "Black", size: "M", stockQuantity: 14 },
      { sku: "MPL-MRC-BLK-L", color: "Black", size: "L", stockQuantity: 12 },
      { sku: "MPL-MRC-BLK-XL", color: "Black", size: "XL", stockQuantity: 6 }
    ],
    tags: ["polo", "knit-polo", "mercerized", "luxury", "smartcasual"]
  },
  {
    name: "Classic Heavyweight Piqué Polo",
    slug: "classic-heavyweight-pique-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Substantial 230 GSM honeycomb piqué cotton polo with ribbed collar, two-button placket, and tennis tail hem.",
    basePrice: 195000,
    material: "100% Combed Cotton Piqué (230 GSM)",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-PIQ-NAV-S", color: "Navy", size: "S", stockQuantity: 10 },
      { sku: "MPL-PIQ-NAV-M", color: "Navy", size: "M", stockQuantity: 18 },
      { sku: "MPL-PIQ-NAV-L", color: "Navy", size: "L", stockQuantity: 16 },
      { sku: "MPL-PIQ-NAV-XL", color: "Navy", size: "XL", stockQuantity: 9 }
    ],
    tags: ["polo", "pique", "navy", "classic", "essential"]
  },
  {
    name: "Johnny Collar Ribbed Sweater Polo",
    slug: "johnny-collar-ribbed-sweater-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Buttonless open Johnny collar knit polo with ribbed texture and fitted waist band in olive drab.",
    basePrice: 295000,
    salePrice: 249000,
    material: "85% Cotton, 15% Silk Knit",
    careInstructions: "Hand wash cold, dry flat.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-JHN-OLV-S", color: "Olive", size: "S", stockQuantity: 6 },
      { sku: "MPL-JHN-OLV-M", color: "Olive", size: "M", stockQuantity: 11 },
      { sku: "MPL-JHN-OLV-L", color: "Olive", size: "L", stockQuantity: 9 }
    ],
    tags: ["polo", "johnny-collar", "retro", "knit", "olive"]
  },
  {
    name: "Piped Edge Contrast Collar Polo",
    slug: "piped-edge-contrast-collar-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Refined white piqué polo accented with navy micro-tipping along the ribbed collar and sleeve cuffs.",
    basePrice: 210000,
    material: "100% Pima Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-PIP-WHT-S", color: "White/Navy", size: "S", stockQuantity: 9 },
      { sku: "MPL-PIP-WHT-M", color: "White/Navy", size: "M", stockQuantity: 15 },
      { sku: "MPL-PIP-WHT-L", color: "White/Navy", size: "L", stockQuantity: 12 }
    ],
    tags: ["polo", "tipped", "contrast", "white", "tennis"]
  },
  {
    name: "Burgundy Waffle-Knit Long-Sleeve Polo",
    slug: "burgundy-waffle-knit-long-sleeve-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Long-sleeve thermal waffle polo with horn buttons and ribbed cuffs for cool autumn evenings.",
    basePrice: 260000,
    material: "100% Thermal Waffle Cotton",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-WFL-BUR-S", color: "Burgundy", size: "S", stockQuantity: 7 },
      { sku: "MPL-WFL-BUR-M", color: "Burgundy", size: "M", stockQuantity: 12 },
      { sku: "MPL-WFL-BUR-L", color: "Burgundy", size: "L", stockQuantity: 10 }
    ],
    tags: ["polo", "long-sleeve", "waffle", "burgundy", "autumn"]
  },
  {
    name: "Charcoal Heather Melange Piqué Polo",
    slug: "charcoal-heather-melange-pique-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Two-tone charcoal heather piqué polo with concealed button placket and reinforced split hem.",
    basePrice: 220000,
    material: "95% Cotton, 5% Elastane",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-MEL-CHR-S", color: "Charcoal Heather", size: "S", stockQuantity: 8 },
      { sku: "MPL-MEL-CHR-M", color: "Charcoal Heather", size: "M", stockQuantity: 14 },
      { sku: "MPL-MEL-CHR-L", color: "Charcoal Heather", size: "L", stockQuantity: 11 }
    ],
    tags: ["polo", "melange", "charcoal", "stretch"]
  },
  {
    name: "Sand Beige Linen-Cotton Blend Polo",
    slug: "sand-beige-linen-cotton-blend-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Featherweight slub texture polo blending cooling linen with soft cotton for humid weather comfort.",
    basePrice: 245000,
    material: "55% Linen, 45% Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-LIN-SND-S", color: "Sand Beige", size: "S", stockQuantity: 8 },
      { sku: "MPL-LIN-SND-M", color: "Sand Beige", size: "M", stockQuantity: 13 },
      { sku: "MPL-LIN-SND-L", color: "Sand Beige", size: "L", stockQuantity: 10 }
    ],
    tags: ["polo", "linen", "beige", "breathable", "summer"]
  },
  {
    name: "Vintage Stripe Chest Band Polo",
    slug: "vintage-stripe-chest-band-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Retro 70s sport-inspired polo featuring an engineered horizontal chest stripe in mustard and navy.",
    basePrice: 230000,
    salePrice: 195000,
    material: "100% Combed Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-STR-NAV-S", color: "Navy/Mustard", size: "S", stockQuantity: 7 },
      { sku: "MPL-STR-NAV-M", color: "Navy/Mustard", size: "M", stockQuantity: 11 },
      { sku: "MPL-STR-NAV-L", color: "Navy/Mustard", size: "L", stockQuantity: 8 }
    ],
    tags: ["polo", "striped", "retro", "vintage"]
  },
  {
    name: "Sage Green Textured Cable-Knit Polo",
    slug: "sage-green-textured-cable-knit-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Sartorial short-sleeve polo knit in delicate miniature cable stitches with three genuine horn buttons.",
    basePrice: 310000,
    material: "100% Fine Combed Cotton",
    careInstructions: "Hand wash cold, dry flat.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-CBL-SGE-S", color: "Sage Green", size: "S", stockQuantity: 6 },
      { sku: "MPL-CBL-SGE-M", color: "Sage Green", size: "M", stockQuantity: 9 },
      { sku: "MPL-CBL-SGE-L", color: "Sage Green", size: "L", stockQuantity: 7 }
    ],
    tags: ["polo", "cable-knit", "knitwear", "sage"]
  },
  {
    name: "Deep Forest Green Zipper Polo",
    slug: "deep-forest-green-zipper-polo",
    subCategorySlug: "men-polo-shirt",
    description: "Contemporary polo updated with an antique silver metal quarter-zip closure and stand collar.",
    basePrice: 250000,
    material: "95% Cotton Piqué, 5% Spandex",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPL-ZIP-FOR-S", color: "Forest Green", size: "S", stockQuantity: 7 },
      { sku: "MPL-ZIP-FOR-M", color: "Forest Green", size: "M", stockQuantity: 12 },
      { sku: "MPL-ZIP-FOR-L", color: "Forest Green", size: "L", stockQuantity: 9 }
    ],
    tags: ["polo", "quarter-zip", "modern", "forest-green"]
  },

  // --- 5. T-Shirts (men-t-shirt) ---
  {
    name: "Architectural Heavyweight 280 GSM Boxy Tee",
    slug: "architectural-heavyweight-280-gsm-boxy-tee",
    subCategorySlug: "men-t-shirt",
    description: "Signature streetwear heavyweight boxy t-shirt with dense 280 GSM cotton jersey, high ribbed collar, and drop shoulders.",
    basePrice: 175000,
    material: "100% Combed Heavy Cotton (280 GSM)",
    careInstructions: "Machine wash cold inside out, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-BXY-BLK-S", color: "Pitch Black", size: "S", stockQuantity: 12 },
      { sku: "MTS-BXY-BLK-M", color: "Pitch Black", size: "M", stockQuantity: 20 },
      { sku: "MTS-BXY-BLK-L", color: "Pitch Black", size: "L", stockQuantity: 18 },
      { sku: "MTS-BXY-BLK-XL", color: "Pitch Black", size: "XL", stockQuantity: 10 },
      { sku: "MTS-BXY-WHT-M", color: "Chalk White", size: "M", stockQuantity: 16 },
      { sku: "MTS-BXY-WHT-L", color: "Chalk White", size: "L", stockQuantity: 14 }
    ],
    tags: ["t-shirt", "heavyweight", "boxy", "streetwear", "black"]
  },
  {
    name: "Minimalist Raw-Edge Vintage Washed Tee",
    slug: "minimalist-raw-edge-vintage-washed-tee",
    subCategorySlug: "men-t-shirt",
    description: "Mineral-washed relaxed t-shirt featuring subtle distressed grindings along the collar and blind-stitched hems.",
    basePrice: 160000,
    material: "100% Enzyme Washed Cotton",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-RAW-CHR-S", color: "Washed Charcoal", size: "S", stockQuantity: 9 },
      { sku: "MTS-RAW-CHR-M", color: "Washed Charcoal", size: "M", stockQuantity: 15 },
      { sku: "MTS-RAW-CHR-L", color: "Washed Charcoal", size: "L", stockQuantity: 12 }
    ],
    tags: ["t-shirt", "vintage", "washed", "charcoal", "grunge"]
  },
  {
    name: "Essential Relaxed Fit Crewneck T-Shirt",
    slug: "essential-relaxed-fit-crewneck-t-shirt",
    subCategorySlug: "men-t-shirt",
    description: "Everyday luxury tee in smooth 200 GSM organic cotton with anti-shrink silicon wash.",
    basePrice: 145000,
    material: "100% Organic Combed Cotton",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-CRW-WHT-S", color: "Pure White", size: "S", stockQuantity: 15 },
      { sku: "MTS-CRW-WHT-M", color: "Pure White", size: "M", stockQuantity: 22 },
      { sku: "MTS-CRW-WHT-L", color: "Pure White", size: "L", stockQuantity: 18 }
    ],
    tags: ["t-shirt", "crewneck", "white", "basics", "essential"]
  },
  {
    name: "Archival Typographic Studio Graphic Tee",
    slug: "archival-typographic-studio-graphic-tee",
    subCategorySlug: "men-t-shirt",
    description: "Subtle back graphic print featuring modernist editorial typography and coordinates in soft puff ink.",
    basePrice: 170000,
    salePrice: 145000,
    material: "100% Combed Cotton (220 GSM)",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-TYP-SND-S", color: "Sandstone", size: "S", stockQuantity: 8 },
      { sku: "MTS-TYP-SND-M", color: "Sandstone", size: "M", stockQuantity: 14 },
      { sku: "MTS-TYP-SND-L", color: "Sandstone", size: "L", stockQuantity: 11 }
    ],
    tags: ["t-shirt", "graphic", "typography", "streetwear"]
  },
  {
    name: "Military Olive Slub Cotton Pocket Tee",
    slug: "military-olive-slub-cotton-pocket-tee",
    subCategorySlug: "men-t-shirt",
    description: "Tactile slub textured cotton tee detailed with a clean chest patch pocket and reinforced stitching.",
    basePrice: 155000,
    material: "100% Cotton Slub Knit",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-PKT-OLV-S", color: "Military Olive", size: "S", stockQuantity: 9 },
      { sku: "MTS-PKT-OLV-M", color: "Military Olive", size: "M", stockQuantity: 13 },
      { sku: "MTS-PKT-OLV-L", color: "Military Olive", size: "L", stockQuantity: 10 }
    ],
    tags: ["t-shirt", "pocket-tee", "slub", "olive"]
  },
  {
    name: "French Terry Mock-Neck Oversized Tee",
    slug: "french-terry-mock-neck-oversized-tee",
    subCategorySlug: "men-t-shirt",
    description: "Midweight loopback French terry short-sleeve top styled with a tight mock neck collar.",
    basePrice: 190000,
    material: "100% French Terry Cotton (300 GSM)",
    careInstructions: "Machine wash cold, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-MCK-BLK-S", color: "Black", size: "S", stockQuantity: 7 },
      { sku: "MTS-MCK-BLK-M", color: "Black", size: "M", stockQuantity: 12 },
      { sku: "MTS-MCK-BLK-L", color: "Black", size: "L", stockQuantity: 9 }
    ],
    tags: ["t-shirt", "mock-neck", "terry", "minimalist"]
  },
  {
    name: "Breton Stripe Maritime Heavy Tee",
    slug: "breton-stripe-maritime-heavy-tee",
    subCategorySlug: "men-t-shirt",
    description: "Navy and off-white yarn-dyed horizontal stripe crewneck in durable carded cotton jersey.",
    basePrice: 180000,
    material: "100% Yarn-Dyed Cotton (240 GSM)",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-STR-NAV-S", color: "Navy/Ecru", size: "S", stockQuantity: 8 },
      { sku: "MTS-STR-NAV-M", color: "Navy/Ecru", size: "M", stockQuantity: 14 },
      { sku: "MTS-STR-NAV-L", color: "Navy/Ecru", size: "L", stockQuantity: 11 }
    ],
    tags: ["t-shirt", "striped", "breton", "maritime"]
  },
  {
    name: "Earth Tone Brown Garment-Dyed Tee",
    slug: "earth-tone-brown-garment-dyed-tee",
    subCategorySlug: "men-t-shirt",
    description: "Garment-dyed tee in warm roasted umber brown with lived-in softness and pre-shrunk fit.",
    basePrice: 155000,
    material: "100% Ring-Spun Cotton",
    careInstructions: "Machine wash cold with darks.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-GAR-BRN-S", color: "Umber Brown", size: "S", stockQuantity: 8 },
      { sku: "MTS-GAR-BRN-M", color: "Umber Brown", size: "M", stockQuantity: 13 },
      { sku: "MTS-GAR-BRN-L", color: "Umber Brown", size: "L", stockQuantity: 10 }
    ],
    tags: ["t-shirt", "garment-dyed", "brown", "earthy"]
  },
  {
    name: "Waffle-Knit Raglan Sleeve Tee",
    slug: "waffle-knit-raglan-sleeve-tee",
    subCategorySlug: "men-t-shirt",
    description: "Textured mini-waffle short sleeve t-shirt with raglan shoulder construction for unrestricted mobility.",
    basePrice: 165000,
    material: "100% Cotton Waffle",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-WFL-OAT-S", color: "Oatmeal", size: "S", stockQuantity: 9 },
      { sku: "MTS-WFL-OAT-M", color: "Oatmeal", size: "M", stockQuantity: 14 },
      { sku: "MTS-WFL-OAT-L", color: "Oatmeal", size: "L", stockQuantity: 11 }
    ],
    tags: ["t-shirt", "waffle", "raglan", "textured"]
  },
  {
    name: "Charcoal Heather Performance Pima Tee",
    slug: "charcoal-heather-performance-pima-tee",
    subCategorySlug: "men-t-shirt",
    description: "Silky pima cotton infused with micro-spandex for shape retention and breathability during daily commuting.",
    basePrice: 175000,
    salePrice: 149000,
    material: "95% Pima Cotton, 5% Spandex",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MTS-PMA-CHR-S", color: "Charcoal Heather", size: "S", stockQuantity: 10 },
      { sku: "MTS-PMA-CHR-M", color: "Charcoal Heather", size: "M", stockQuantity: 16 },
      { sku: "MTS-PMA-CHR-L", color: "Charcoal Heather", size: "L", stockQuantity: 12 }
    ],
    tags: ["t-shirt", "pima", "performance", "comfort"]
  },

  // --- 6. Bottoms (men-pants) ---
  {
    name: "Architectural Double-Pleated Tailored Trousers",
    slug: "architectural-double-pleated-tailored-trousers",
    subCategorySlug: "men-pants",
    description: "Sharp high-rise tailored trousers with double forward pleats, side waist adjusters, and full straight leg silhouette.",
    basePrice: 380000,
    material: "Wool-Poly Tropical Suiting",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-PLT-BLK-30", color: "Black", size: "S", stockQuantity: 7 },
      { sku: "MPT-PLT-BLK-32", color: "Black", size: "M", stockQuantity: 14 },
      { sku: "MPT-PLT-BLK-34", color: "Black", size: "L", stockQuantity: 12 },
      { sku: "MPT-PLT-BLK-36", color: "Black", size: "XL", stockQuantity: 6 }
    ],
    tags: ["trousers", "pleated", "tailored", "black", "formal"]
  },
  {
    name: "Selvedge Raw Indigo 14 oz Straight Jeans",
    slug: "selvedge-raw-indigo-14-oz-straight-jeans",
    subCategorySlug: "men-pants",
    description: "Heavyweight authentic red-line selvedge denim crafted from rope-dyed indigo cotton with custom brass donut buttons.",
    basePrice: 480000,
    salePrice: 410000,
    material: "100% Japanese Selvedge Cotton Denim (14 oz)",
    careInstructions: "Wash inside out sparingly in cold water, hang dry.",
    imageUrl: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-SLV-30", color: "Raw Indigo", size: "S", stockQuantity: 6 },
      { sku: "MPT-SLV-32", color: "Raw Indigo", size: "M", stockQuantity: 11 },
      { sku: "MPT-SLV-34", color: "Raw Indigo", size: "L", stockQuantity: 9 }
    ],
    tags: ["jeans", "selvedge", "raw-denim", "indigo", "heritage"]
  },
  {
    name: "Modern Slim-Fit Stretch Chino Trousers",
    slug: "modern-slim-fit-stretch-chino-trousers",
    subCategorySlug: "men-pants",
    description: "Versatile smart-casual chinos woven in cotton twill with 2% elastane for unrestricted all-day movement.",
    basePrice: 295000,
    material: "98% Cotton Twill, 2% Elastane",
    careInstructions: "Machine wash warm.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-CHN-KHK-30", color: "British Khaki", size: "S", stockQuantity: 10 },
      { sku: "MPT-CHN-KHK-32", color: "British Khaki", size: "M", stockQuantity: 16 },
      { sku: "MPT-CHN-KHK-34", color: "British Khaki", size: "L", stockQuantity: 14 },
      { sku: "MPT-CHN-KHK-36", color: "British Khaki", size: "XL", stockQuantity: 8 }
    ],
    tags: ["chinos", "trousers", "khaki", "smartcasual", "office"]
  },
  {
    name: "Tactical Bellows Pocket Cargo Pants",
    slug: "tactical-bellows-pocket-cargo-pants",
    subCategorySlug: "men-pants",
    description: "Rugged ripstop utility cargo pants featuring six reinforced pockets, knee articulation, and adjustable ankle tabs.",
    basePrice: 340000,
    material: "100% Cotton Ripstop (260 GSM)",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-CRG-OLV-30", color: "Olive Drab", size: "S", stockQuantity: 8 },
      { sku: "MPT-CRG-OLV-32", color: "Olive Drab", size: "M", stockQuantity: 14 },
      { sku: "MPT-CRG-OLV-34", color: "Olive Drab", size: "L", stockQuantity: 12 }
    ],
    tags: ["cargo", "tactical", "utility", "olive", "streetwear"]
  },
  {
    name: "Tailored Linen Drawstring Summer Pants",
    slug: "tailored-linen-drawstring-summer-pants",
    subCategorySlug: "men-pants",
    description: "Relaxed resort trousers in pure woven linen with an internal drawstring and elasticated back waist.",
    basePrice: 340000,
    material: "100% European Flax Linen",
    careInstructions: "Machine wash cold on gentle cycle.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-LIN-NAT-30", color: "Natural Sand", size: "S", stockQuantity: 7 },
      { sku: "MPT-LIN-NAT-32", color: "Natural Sand", size: "M", stockQuantity: 12 },
      { sku: "MPT-LIN-NAT-34", color: "Natural Sand", size: "L", stockQuantity: 10 }
    ],
    tags: ["linen", "pants", "drawstring", "summer", "resort"]
  },
  {
    name: "Charcoal Wool Flannel Dress Trousers",
    slug: "charcoal-wool-flannel-dress-trousers",
    subCategorySlug: "men-pants",
    description: "Luxurious brushed wool flannel trousers featuring flat front styling, belt loops, and half-lined interior.",
    basePrice: 440000,
    material: "100% Super 110s Wool Flannel",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-FLN-CHR-30", color: "Charcoal", size: "S", stockQuantity: 6 },
      { sku: "MPT-FLN-CHR-32", color: "Charcoal", size: "M", stockQuantity: 11 },
      { sku: "MPT-FLN-CHR-34", color: "Charcoal", size: "L", stockQuantity: 8 }
    ],
    tags: ["trousers", "wool", "flannel", "charcoal", "winter"]
  },
  {
    name: "Washed Black Relaxed Straight Jeans",
    slug: "washed-black-relaxed-straight-jeans",
    subCategorySlug: "men-pants",
    description: "Easy relaxed-fit 13 oz denim in vintage faded black with subtle whisker details and copper rivets.",
    basePrice: 320000,
    material: "100% Cotton Denim",
    careInstructions: "Machine wash cold inside out.",
    imageUrl: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-DNM-BLK-30", color: "Washed Black", size: "S", stockQuantity: 8 },
      { sku: "MPT-DNM-BLK-32", color: "Washed Black", size: "M", stockQuantity: 15 },
      { sku: "MPT-DNM-BLK-34", color: "Washed Black", size: "L", stockQuantity: 12 }
    ],
    tags: ["jeans", "denim", "washed-black", "straight-fit"]
  },
  {
    name: "Heavyweight French Terry Sweatpants",
    slug: "heavyweight-french-terry-sweatpants",
    subCategorySlug: "men-pants",
    description: "Ultra-comfortable 450 GSM organic loopback cotton sweatpants with deep pockets and elasticated cuffs.",
    basePrice: 260000,
    salePrice: 215000,
    material: "100% Organic Cotton Terry (450 GSM)",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-SWT-GRY-S", color: "Heather Grey", size: "S", stockQuantity: 10 },
      { sku: "MPT-SWT-GRY-M", color: "Heather Grey", size: "M", stockQuantity: 16 },
      { sku: "MPT-SWT-GRY-L", color: "Heather Grey", size: "L", stockQuantity: 12 }
    ],
    tags: ["sweatpants", "joggers", "loungewear", "terry"]
  },
  {
    name: "Navy Blue Pin-Stripe Formal Trousers",
    slug: "navy-blue-pin-stripe-formal-trousers",
    subCategorySlug: "men-pants",
    description: "Corporate dress trousers in fine midnight navy wool with subtle light grey chalk stripes.",
    basePrice: 390000,
    material: "Wool-Poly Blend",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-PIN-NAV-30", color: "Navy Pinstripe", size: "S", stockQuantity: 7 },
      { sku: "MPT-PIN-NAV-32", color: "Navy Pinstripe", size: "M", stockQuantity: 11 },
      { sku: "MPT-PIN-NAV-34", color: "Navy Pinstripe", size: "L", stockQuantity: 8 }
    ],
    tags: ["trousers", "pinstripe", "navy", "formal", "business"]
  },
  {
    name: "Caramel Corduroy Relaxed Fit Trousers",
    slug: "caramel-corduroy-relaxed-fit-trousers",
    subCategorySlug: "men-pants",
    description: "Wide 8-wale chunky corduroy trousers in warm caramel brown with vintage workwear cut.",
    basePrice: 350000,
    material: "100% Cotton 8-Wale Corduroy",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MPT-CRD-CAR-30", color: "Caramel", size: "S", stockQuantity: 7 },
      { sku: "MPT-CRD-CAR-32", color: "Caramel", size: "M", stockQuantity: 12 },
      { sku: "MPT-CRD-CAR-34", color: "Caramel", size: "L", stockQuantity: 9 }
    ],
    tags: ["corduroy", "trousers", "caramel", "vintage", "autumn"]
  },

  // --- 7. Outerwear (men-winter-wear) ---
  {
    name: "Classic Charcoal Wool Melange Overcoat",
    slug: "classic-charcoal-wool-melange-overcoat",
    subCategorySlug: "men-winter-wear",
    description: "Architectural single-breasted topcoat tailored in heavyweight virgin wool with notch lapels and back walking vent.",
    basePrice: 980000,
    material: "100% Virgin Wool with Cupro Lining",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-OVC-CHR-38", color: "Charcoal", size: "S", stockQuantity: 5 },
      { sku: "MOW-OVC-CHR-40", color: "Charcoal", size: "M", stockQuantity: 8 },
      { sku: "MOW-OVC-CHR-42", color: "Charcoal", size: "L", stockQuantity: 7 },
      { sku: "MOW-OVC-CHR-44", color: "Charcoal", size: "XL", stockQuantity: 4 }
    ],
    tags: ["coat", "overcoat", "wool", "charcoal", "winter", "tailored"]
  },
  {
    name: "Aviator Leather Bomber with Shearling Collar",
    slug: "aviator-leather-bomber-with-shearling-collar",
    subCategorySlug: "men-winter-wear",
    description: "Heritage flight jacket crafted from supple full-grain cowhide leather with a detachable genuine shearling fur collar.",
    basePrice: 1450000,
    material: "100% Full-Grain Cowhide Leather & Real Shearling",
    careInstructions: "Professional leather clean only.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-BMB-BLK-S", color: "Antiqued Black", size: "S", stockQuantity: 4 },
      { sku: "MOW-BMB-BLK-M", color: "Antiqued Black", size: "M", stockQuantity: 6 },
      { sku: "MOW-BMB-BLK-L", color: "Antiqued Black", size: "L", stockQuantity: 5 }
    ],
    tags: ["bomber", "leather", "shearling", "jacket", "luxury"]
  },
  {
    name: "Matte Black Down Puffer Jacket",
    slug: "matte-black-down-puffer-jacket",
    subCategorySlug: "men-winter-wear",
    description: "High-performance hooded down jacket insulated with 750 fill-power responsibly sourced down and water-repellent shell.",
    basePrice: 780000,
    salePrice: 680000,
    material: "Matte Japanese Ripstop with 90/10 Duck Down",
    careInstructions: "Machine wash cold, tumble dry with tennis balls.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-PUF-BLK-S", color: "Matte Black", size: "S", stockQuantity: 7 },
      { sku: "MOW-PUF-BLK-M", color: "Matte Black", size: "M", stockQuantity: 12 },
      { sku: "MOW-PUF-BLK-L", color: "Matte Black", size: "L", stockQuantity: 10 },
      { sku: "MOW-PUF-BLK-XL", color: "Matte Black", size: "XL", stockQuantity: 6 }
    ],
    tags: ["puffer", "jacket", "down", "winter", "warm"]
  },
  {
    name: "Heavyweight 500 GSM Boxy Zip Hoodie",
    slug: "heavyweight-500-gsm-boxy-zip-hoodie",
    subCategorySlug: "men-winter-wear",
    description: "Custom-milled ultra-heavyweight cotton fleece zip-up hoodie with two-way YKK silver zipper and thermal waffle hood lining.",
    basePrice: 320000,
    material: "100% Combed Cotton Fleece (500 GSM)",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-HOD-GRY-S", color: "Heather Grey", size: "S", stockQuantity: 9 },
      { sku: "MOW-HOD-GRY-M", color: "Heather Grey", size: "M", stockQuantity: 15 },
      { sku: "MOW-HOD-GRY-L", color: "Heather Grey", size: "L", stockQuantity: 13 }
    ],
    tags: ["hoodie", "heavyweight", "fleece", "zip-up", "streetwear"]
  },
  {
    name: "Classic Beige Trench Coat with Storm Shield",
    slug: "classic-beige-trench-coat-with-storm-shield",
    subCategorySlug: "men-winter-wear",
    description: "Double-breasted trench coat in tightly woven weatherproof cotton gabardine with raglan sleeves and buffalo horn buttons.",
    basePrice: 850000,
    material: "100% Water-Resistant Cotton Gabardine",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-TRN-BGE-38", color: "Honey Beige", size: "S", stockQuantity: 5 },
      { sku: "MOW-TRN-BGE-40", color: "Honey Beige", size: "M", stockQuantity: 8 },
      { sku: "MOW-TRN-BGE-42", color: "Honey Beige", size: "L", stockQuantity: 6 }
    ],
    tags: ["trench-coat", "weatherproof", "classic", "outerwear"]
  },
  {
    name: "Navy Fisherman Cable-Knit Wool Sweater",
    slug: "navy-fisherman-cable-knit-wool-sweater",
    subCategorySlug: "men-winter-wear",
    description: "Heavyweight chunky cable-knit crewneck sweater knitted from 100% pure Irish wool yarn for authentic thermal warmth.",
    basePrice: 420000,
    material: "100% Pure Virgin Wool",
    careInstructions: "Hand wash cold with wool detergent, reshape and dry flat.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-SWT-NAV-S", color: "Navy Blue", size: "S", stockQuantity: 6 },
      { sku: "MOW-SWT-NAV-M", color: "Navy Blue", size: "M", stockQuantity: 10 },
      { sku: "MOW-SWT-NAV-L", color: "Navy Blue", size: "L", stockQuantity: 8 }
    ],
    tags: ["sweater", "cable-knit", "wool", "fisherman", "navy"]
  },
  {
    name: "Olive Quilted Thermal Utility Vest",
    slug: "olive-quilted-thermal-utility-vest",
    subCategorySlug: "men-winter-wear",
    description: "Layering vest in matte ripstop nylon insulated with Primaloft thermal fill, detailed with fleece-lined handwarmer pockets.",
    basePrice: 320000,
    material: "Recycled Nylon with Primaloft Fill",
    careInstructions: "Machine wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-VST-OLV-S", color: "Olive", size: "S", stockQuantity: 8 },
      { sku: "MOW-VST-OLV-M", color: "Olive", size: "M", stockQuantity: 13 },
      { sku: "MOW-VST-OLV-L", color: "Olive", size: "L", stockQuantity: 9 }
    ],
    tags: ["vest", "gilet", "quilted", "olive", "layering"]
  },
  {
    name: "Waxed Cotton Chore Coat with Corduroy Collar",
    slug: "waxed-cotton-chore-coat-with-corduroy-collar",
    subCategorySlug: "men-winter-wear",
    description: "Weather-resistant waxed canvas chore jacket with rich dark brown corduroy collar and blanket flannel lining.",
    basePrice: 620000,
    salePrice: 530000,
    material: "10 oz Waxed Cotton Canvas with Plaid Flannel Lining",
    careInstructions: "Sponge clean with cold water only. Re-wax annually.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-CHR-TAN-S", color: "Tan Canvas", size: "S", stockQuantity: 6 },
      { sku: "MOW-CHR-TAN-M", color: "Tan Canvas", size: "M", stockQuantity: 9 },
      { sku: "MOW-CHR-TAN-L", color: "Tan Canvas", size: "L", stockQuantity: 7 }
    ],
    tags: ["chore-coat", "waxed-canvas", "workwear", "heritage"]
  },
  {
    name: "Charcoal Double-Breasted Peacoat",
    slug: "charcoal-double-breasted-peacoat",
    subCategorySlug: "men-winter-wear",
    description: "Maritime naval peacoat cut from heavy 32 oz Melton wool with wide convertible lapels and anchor crest buttons.",
    basePrice: 790000,
    material: "100% Melton Wool (32 oz)",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-PEA-CHR-38", color: "Charcoal", size: "S", stockQuantity: 5 },
      { sku: "MOW-PEA-CHR-40", color: "Charcoal", size: "M", stockQuantity: 8 },
      { sku: "MOW-PEA-CHR-42", color: "Charcoal", size: "L", stockQuantity: 7 }
    ],
    tags: ["peacoat", "wool", "melton", "charcoal", "winter"]
  },
  {
    name: "Technical Windproof Mountain Shell",
    slug: "technical-windproof-mountain-shell",
    subCategorySlug: "men-winter-wear",
    description: "Three-layer Gore-Tex style waterproof taped-seam technical shell jacket designed for harsh weather commuting.",
    basePrice: 580000,
    material: "3-Layer Waterproof Breathable Nylon Shell",
    careInstructions: "Machine wash cold with technical wash detergent.",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MOW-SHL-BLK-S", color: "Stealth Black", size: "S", stockQuantity: 7 },
      { sku: "MOW-SHL-BLK-M", color: "Stealth Black", size: "M", stockQuantity: 11 },
      { sku: "MOW-SHL-BLK-L", color: "Stealth Black", size: "L", stockQuantity: 8 }
    ],
    tags: ["technical", "jacket", "waterproof", "rainwear", "gorpcore"]
  },

  // --- 8. Blazers & Suits (men-blazer-suit) ---
  {
    name: "Midnight Navy Double-Breasted Suiting Blazer",
    slug: "midnight-navy-double-breasted-suiting-blazer",
    subCategorySlug: "men-blazer-suit",
    description: "Sartorial double-breasted blazer cut in Super 130s Italian wool with sharp peak lapels and horn buttons.",
    basePrice: 780000,
    salePrice: 690000,
    material: "Super 130s Pure Italian Wool with Cupro Lining",
    careInstructions: "Dry clean only. Hang on tailored contoured hanger.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-DB-NAV-38", color: "Midnight Navy", size: "S", stockQuantity: 5 },
      { sku: "MSU-DB-NAV-40", color: "Midnight Navy", size: "M", stockQuantity: 9 },
      { sku: "MSU-DB-NAV-42", color: "Midnight Navy", size: "L", stockQuantity: 8 },
      { sku: "MSU-DB-NAV-44", color: "Midnight Navy", size: "XL", stockQuantity: 4 }
    ],
    tags: ["blazer", "double-breasted", "suit", "navy", "sartorial", "luxury"]
  },
  {
    name: "Classic Charcoal Peak Lapel Two-Piece Suit",
    slug: "classic-charcoal-peak-lapel-two-piece-suit",
    subCategorySlug: "men-blazer-suit",
    description: "Full two-piece executive suit featuring single-breasted jacket and flat-front trousers tailored from crease-resistant wool.",
    basePrice: 1350000,
    material: "100% Superfine Australian Merino Wool",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-2PC-CHR-38", color: "Charcoal", size: "S", stockQuantity: 4 },
      { sku: "MSU-2PC-CHR-40", color: "Charcoal", size: "M", stockQuantity: 8 },
      { sku: "MSU-2PC-CHR-42", color: "Charcoal", size: "L", stockQuantity: 7 },
      { sku: "MSU-2PC-CHR-44", color: "Charcoal", size: "XL", stockQuantity: 3 }
    ],
    tags: ["suit", "two-piece", "charcoal", "formal", "executive", "wedding"]
  },
  {
    name: "Onyx Black Silk-Satin Lapel Tuxedo Jacket",
    slug: "onyx-black-silk-satin-lapel-tuxedo-jacket",
    subCategorySlug: "men-blazer-suit",
    description: "Formal black-tie dinner jacket with sweeping silk-satin shawl lapels, single covered button closure, and jet pockets.",
    basePrice: 920000,
    material: "100% Wool Barathea with Pure Silk Satin Facings",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-TUX-BLK-38", color: "Black", size: "S", stockQuantity: 4 },
      { sku: "MSU-TUX-BLK-40", color: "Black", size: "M", stockQuantity: 7 },
      { sku: "MSU-TUX-BLK-42", color: "Black", size: "L", stockQuantity: 6 }
    ],
    tags: ["tuxedo", "dinner-jacket", "black-tie", "formal", "silk-lapel"]
  },
  {
    name: "Sandstone Linen Unstructured Summer Blazer",
    slug: "sandstone-linen-unstructured-summer-blazer",
    subCategorySlug: "men-blazer-suit",
    description: "Deconstructed lightweight sport coat with soft natural shoulders, patch pockets, and half-canvas chest.",
    basePrice: 580000,
    material: "100% Breathable Irish Linen",
    careInstructions: "Dry clean recommended.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-LIN-SND-38", color: "Sandstone", size: "S", stockQuantity: 6 },
      { sku: "MSU-LIN-SND-40", color: "Sandstone", size: "M", stockQuantity: 10 },
      { sku: "MSU-LIN-SND-42", color: "Sandstone", size: "L", stockQuantity: 8 }
    ],
    tags: ["blazer", "linen", "unstructured", "summer", "sportcoat"]
  },
  {
    name: "Olive Green British Tweed Sport Coat",
    slug: "olive-green-british-tweed-sport-coat",
    subCategorySlug: "men-blazer-suit",
    description: "Heritage country blazer in herringbone Harris-style tweed with suede elbow patches and leather football buttons.",
    basePrice: 720000,
    material: "100% British Wool Tweed",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-TWD-OLV-38", color: "Olive Herringbone", size: "S", stockQuantity: 5 },
      { sku: "MSU-TWD-OLV-40", color: "Olive Herringbone", size: "M", stockQuantity: 8 },
      { sku: "MSU-TWD-OLV-42", color: "Olive Herringbone", size: "L", stockQuantity: 6 }
    ],
    tags: ["tweed", "blazer", "sportcoat", "olive", "heritage"]
  },
  {
    name: "Classic Navy Gold-Button Hopsack Blazer",
    slug: "classic-navy-gold-button-hopsack-blazer",
    subCategorySlug: "men-blazer-suit",
    description: "The quintessential club blazer crafted in breathable open-weave wool hopsack with embossed antique brass buttons.",
    basePrice: 650000,
    material: "100% Wool Hopsack",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-BLZ-NAV-38", color: "Navy Blue", size: "S", stockQuantity: 6 },
      { sku: "MSU-BLZ-NAV-40", color: "Navy Blue", size: "M", stockQuantity: 11 },
      { sku: "MSU-BLZ-NAV-42", color: "Navy Blue", size: "L", stockQuantity: 9 }
    ],
    tags: ["blazer", "club-blazer", "navy", "classic", "gold-buttons"]
  },
  {
    name: "Caramel Prince of Wales Check Blazer",
    slug: "caramel-prince-of-wales-check-blazer",
    subCategorySlug: "men-blazer-suit",
    description: "Dapper tailored jacket featuring classic Glen plaid check with subtle sky blue overcheck accent.",
    basePrice: 690000,
    material: "Super 120s Wool Suiting",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-CHK-CAR-38", color: "Glen Check", size: "S", stockQuantity: 5 },
      { sku: "MSU-CHK-CAR-40", color: "Glen Check", size: "M", stockQuantity: 8 },
      { sku: "MSU-CHK-CAR-42", color: "Glen Check", size: "L", stockQuantity: 7 }
    ],
    tags: ["blazer", "plaid", "check", "sartorial", "prince-of-wales"]
  },
  {
    name: "Burgundy Velvet Evening Cocktail Jacket",
    slug: "burgundy-velvet-evening-cocktail-jacket",
    subCategorySlug: "men-blazer-suit",
    description: "Sumptuous cotton velvet smoking jacket with black satin peak lapels and tailored silhouette.",
    basePrice: 750000,
    salePrice: 640000,
    material: "Rich Cotton Velvet with Satin Trim",
    careInstructions: "Specialist dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-VLV-BUR-40", color: "Burgundy Velvet", size: "M", stockQuantity: 6 },
      { sku: "MSU-VLV-BUR-42", color: "Burgundy Velvet", size: "L", stockQuantity: 7 },
      { sku: "MSU-VLV-BUR-44", color: "Burgundy Velvet", size: "XL", stockQuantity: 4 }
    ],
    tags: ["blazer", "velvet", "smoking-jacket", "evening", "cocktail"]
  },
  {
    name: "Steel Grey Stretch Wool Travel Blazer",
    slug: "steel-grey-stretch-wool-travel-blazer",
    subCategorySlug: "men-blazer-suit",
    description: "Wrinkle-resistant travel blazer designed with hidden passport zip pocket and water-repellent nanotech finish.",
    basePrice: 620000,
    material: "97% Wool, 3% Elastane",
    careInstructions: "Dry clean or steam refresh.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-TRV-GRY-38", color: "Steel Grey", size: "S", stockQuantity: 6 },
      { sku: "MSU-TRV-GRY-40", color: "Steel Grey", size: "M", stockQuantity: 10 },
      { sku: "MSU-TRV-GRY-42", color: "Steel Grey", size: "L", stockQuantity: 8 }
    ],
    tags: ["blazer", "travel", "wrinkle-free", "grey", "functional"]
  },
  {
    name: "Off-White Linen Summer Tuxedo Dinner Jacket",
    slug: "off-white-linen-summer-tuxedo-dinner-jacket",
    subCategorySlug: "men-blazer-suit",
    description: "Distinguished warm-climate formal dinner jacket with self-shawl lapels and vented cuffs.",
    basePrice: 820000,
    material: "100% Pure Italian Linen",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "MSU-WHT-TUX-38", color: "Off-White", size: "S", stockQuantity: 4 },
      { sku: "MSU-WHT-TUX-40", color: "Off-White", size: "M", stockQuantity: 7 },
      { sku: "MSU-WHT-TUX-42", color: "Off-White", size: "L", stockQuantity: 5 }
    ],
    tags: ["tuxedo", "white-jacket", "linen", "summer-formal", "black-tie"]
  }
];

