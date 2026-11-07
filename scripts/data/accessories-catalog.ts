import { SeedProductItem } from "../catalog-data-definitions";

export const ACCESSORIES_PRODUCTS: SeedProductItem[] = [
  // --- 1. Bags & Wallets (accessories-bags-wallets) ---
  {
    name: "Aura Full-Grain Leather Minimalist Tote",
    slug: "aura-full-grain-leather-minimalist-tote",
    subCategorySlug: "accessories-bags-wallets",
    description: "Architectural structured tote handcrafted from vegetable-tanned Italian leather with interior laptop sleeve and magnetic closure.",
    basePrice: 580000,
    salePrice: 490000,
    material: "100% Full-Grain Vegetable-Tanned Italian Leather",
    careInstructions: "Condition with natural beeswax leather cream. Store in provided dust bag.",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-TOT-TAN-FREE", color: "Cognac Tan", size: "One Size", stockQuantity: 8 },
      { sku: "ACC-TOT-BLK-FREE", color: "Noir Black", size: "One Size", stockQuantity: 12 }
    ],
    tags: ["bag", "tote", "leather", "workbag", "minimalist"]
  },
  {
    name: "Saddle Flap Structured Crossbody Bag",
    slug: "saddle-flap-structured-crossbody-bag",
    subCategorySlug: "accessories-bags-wallets",
    description: "Compact equestrian-inspired curved saddle bag featuring brushed gold hardware and an adjustable shoulder strap.",
    basePrice: 420000,
    material: "Top-Grain Smooth Calfskin Leather with Suede Lining",
    careInstructions: "Wipe with damp cloth.",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-SDL-CAR-FREE", color: "Caramel", size: "One Size", stockQuantity: 9 },
      { sku: "ACC-SDL-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 11 }
    ],
    tags: ["bag", "crossbody", "saddle-bag", "leather", "everyday"]
  },
  {
    name: "Classic Bifold Leather Wallet with Coin Pocket",
    slug: "classic-bifold-leather-wallet-with-coin-pocket",
    subCategorySlug: "accessories-bags-wallets",
    description: "Slimline 8-card bifold wallet with RFID-blocking lining, bill compartment, and snap-button coin pouch.",
    basePrice: 185000,
    material: "100% Full-Grain Cowhide Leather",
    careInstructions: "Avoid direct water contact.",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-WAL-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 15 },
      { sku: "ACC-WAL-BRN-FREE", color: "Dark Brown", size: "One Size", stockQuantity: 18 }
    ],
    tags: ["wallet", "bifold", "leather", "rfid", "accessories"]
  },
  {
    name: "Heritage Waxed Canvas & Leather Weekender Duffle",
    slug: "heritage-waxed-canvas-and-leather-weekender-duffle",
    subCategorySlug: "accessories-bags-wallets",
    description: "Heavy-duty 45L travel duffle crafted from 18 oz waterproof waxed canvas with bridle leather handles and brass YKK zip.",
    basePrice: 750000,
    material: "18 oz Waxed Cotton Canvas & Bridle Leather Trim",
    careInstructions: "Spot clean with cold water.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-DUF-OLV-FREE", color: "Field Olive", size: "One Size", stockQuantity: 6 }
    ],
    tags: ["duffle", "bag", "travel", "waxed-canvas", "weekender"]
  },
  {
    name: "Minimalist Leather Cardholder with Cash Clip",
    slug: "minimalist-leather-cardholder-with-cash-clip",
    subCategorySlug: "accessories-bags-wallets",
    description: "Ultra-compact 6-slot card sleeve in polished Italian leather equipped with spring-steel money clip.",
    basePrice: 135000,
    salePrice: 110000,
    material: "Smooth Italian Calf Leather",
    careInstructions: "Condition occasionally with leather balm.",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-CRD-TAN-FREE", color: "Cognac Tan", size: "One Size", stockQuantity: 20 },
      { sku: "ACC-CRD-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 25 }
    ],
    tags: ["cardholder", "wallet", "minimalist", "edc", "leather"]
  },
  {
    name: "Structured Leather Top-Handle Handbag",
    slug: "structured-leather-top-handle-handbag",
    subCategorySlug: "accessories-bags-wallets",
    description: "Refined geometric handbag with rigid top handle, detachable crossbody strap, and gold twist-lock closure.",
    basePrice: 520000,
    material: "Saffiano Scratch-Resistant Leather",
    careInstructions: "Wipe with damp soft cloth.",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-HND-IVR-FREE", color: "Ivory White", size: "One Size", stockQuantity: 7 },
      { sku: "ACC-HND-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 10 }
    ],
    tags: ["handbag", "top-handle", "leather", "saffiano", "formal"]
  },
  {
    name: "Nylon Commuter Roll-Top Laptop Backpack",
    slug: "nylon-commuter-roll-top-laptop-backpack",
    subCategorySlug: "accessories-bags-wallets",
    description: "Weatherproof 22L urban backpack featuring padded 16-inch laptop compartment, ergonomic back panel, and Fidlock magnetic buckle.",
    basePrice: 480000,
    material: "1000D Cordura Ballistic Nylon",
    careInstructions: "Hand wash with mild soap.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-BPK-BLK-FREE", color: "Stealth Black", size: "One Size", stockQuantity: 8 }
    ],
    tags: ["backpack", "laptop-bag", "waterproof", "commuter", "nylon"]
  },
  {
    name: "Pebbled Leather Envelope Clutch",
    slug: "pebbled-leather-envelope-clutch",
    subCategorySlug: "accessories-bags-wallets",
    description: "Sleek evening clutch in supple pebbled leather featuring magnetic envelope flap and internal card slots.",
    basePrice: 280000,
    material: "Pebbled Cowhide Leather",
    careInstructions: "Store in cool, dry place.",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-CLT-GLD-FREE", color: "Champagne Gold", size: "One Size", stockQuantity: 9 },
      { sku: "ACC-CLT-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 12 }
    ],
    tags: ["clutch", "evening-bag", "pebbled-leather", "party"]
  },
  {
    name: "Zip-Around Continental Travel Wallet",
    slug: "zip-around-continental-travel-wallet",
    subCategorySlug: "accessories-bags-wallets",
    description: "Long passport organizer wallet with 12 card slots, zip coin pouch, boarding pass slip, and pen holder.",
    basePrice: 240000,
    salePrice: 199000,
    material: "Full-Grain Leather with Brushed Brass Zip",
    careInstructions: "Condition annually.",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-TRV-BRN-FREE", color: "Vintage Brown", size: "One Size", stockQuantity: 10 }
    ],
    tags: ["wallet", "travel-wallet", "passport-holder", "continental"]
  },
  {
    name: "Woven Raffia Summer Market Basket Tote",
    slug: "woven-raffia-summer-market-basket-tote",
    subCategorySlug: "accessories-bags-wallets",
    description: "Artisanal handwoven natural raffia straw basket tote detailed with cognac leather shoulder straps.",
    basePrice: 340000,
    material: "100% Natural Madagascar Raffia Straw with Leather Trim",
    careInstructions: "Keep dry.",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ACC-RAF-NAT-FREE", color: "Natural Straw", size: "One Size", stockQuantity: 8 }
    ],
    tags: ["tote", "raffia", "straw-bag", "summer", "vacation"]
  },

  // --- 2. Belts & Leather (accessories-belts-leather) ---
  {
    name: "Classic Full-Grain Leather Dress Belt",
    slug: "classic-full-grain-leather-dress-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "32mm tailored dress belt cut from a single strap of full-grain bridle leather with hand-polished nickel buckle.",
    basePrice: 175000,
    salePrice: 149000,
    material: "100% Full-Grain English Bridle Leather",
    careInstructions: "Wipe with soft cloth. Avoid direct soaking.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-DRS-BLK-32", color: "Black", size: "S (30-32)", stockQuantity: 12 },
      { sku: "ABL-DRS-BLK-34", color: "Black", size: "M (32-34)", stockQuantity: 18 },
      { sku: "ABL-DRS-BLK-36", color: "Black", size: "L (34-36)", stockQuantity: 15 },
      { sku: "ABL-DRS-BRN-34", color: "Dark Brown", size: "M (32-34)", stockQuantity: 14 }
    ],
    tags: ["belt", "leather", "dress-belt", "formal", "office"]
  },
  {
    name: "Hand-Braided Cognac Leather Belt",
    slug: "hand-braided-cognac-leather-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "35mm woven plait leather belt offering custom prong placement anywhere along the braided strap with solid brass buckle.",
    basePrice: 195000,
    material: "Hand-Interwoven Supple Calfskin Leather",
    careInstructions: "Condition every 6 months.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-BRD-COG-32", color: "Cognac", size: "S (30-32)", stockQuantity: 10 },
      { sku: "ABL-BRD-COG-34", color: "Cognac", size: "M (32-34)", stockQuantity: 16 },
      { sku: "ABL-BRD-COG-36", color: "Cognac", size: "L (34-36)", stockQuantity: 12 }
    ],
    tags: ["belt", "braided", "woven-belt", "casual", "summer"]
  },
  {
    name: "Reversible Black & Brown Saffiano Belt",
    slug: "reversible-black-and-brown-saffiano-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "Dual-sided swivel buckle belt featuring scratch-resistant Saffiano black on one side and smooth mocha brown on the other.",
    basePrice: 220000,
    material: "Saffiano Textured & Smooth Leather",
    careInstructions: "Wipe with damp cloth.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-REV-32", color: "Black/Brown", size: "S (30-32)", stockQuantity: 11 },
      { sku: "ABL-REV-34", color: "Black/Brown", size: "M (32-34)", stockQuantity: 17 },
      { sku: "ABL-REV-36", color: "Black/Brown", size: "L (34-36)", stockQuantity: 13 }
    ],
    tags: ["belt", "reversible", "saffiano", "versatile", "formal"]
  },
  {
    name: "Solid Brass Harness Buckle Workwear Belt",
    slug: "solid-brass-harness-buckle-workwear-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "Rugged 40mm wide belt cut from 4mm thick saddle leather designed for selvedge denim and work chinos.",
    basePrice: 240000,
    material: "Heavy 10 oz Saddle Leather & Cast Brass",
    careInstructions: "Age naturally with wear.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-WRK-TAN-32", color: "Natural Tan", size: "S (30-32)", stockQuantity: 8 },
      { sku: "ABL-WRK-TAN-34", color: "Natural Tan", size: "M (32-34)", stockQuantity: 14 },
      { sku: "ABL-WRK-TAN-36", color: "Natural Tan", size: "L (34-36)", stockQuantity: 10 }
    ],
    tags: ["belt", "workwear", "brass", "heavy-duty", "denim"]
  },
  {
    name: "Women's Skinny Waist Belt with Sculpted Buckle",
    slug: "womens-skinny-waist-belt-with-sculpted-buckle",
    subCategorySlug: "accessories-belts-leather",
    description: "20mm narrow cinch belt tailored to accent blazers and dresses with an organic gold pebble buckle.",
    basePrice: 165000,
    material: "Soft Calfskin Leather",
    careInstructions: "Keep in dust pouch.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-SKN-BLK-S", color: "Black/Gold", size: "S", stockQuantity: 10 },
      { sku: "ABL-SKN-BLK-M", color: "Black/Gold", size: "M", stockQuantity: 15 },
      { sku: "ABL-SKN-BLK-L", color: "Black/Gold", size: "L", stockQuantity: 10 }
    ],
    tags: ["belt", "skinny-belt", "waist-belt", "gold-buckle"]
  },
  {
    name: "Handcrafted Leather Keychain Clasp Fob",
    slug: "handcrafted-leather-keychain-clasp-fob",
    subCategorySlug: "accessories-belts-leather",
    description: "Premium leather key strap with heavy solid brass snap hook and split ring for pocket or belt loop carry.",
    basePrice: 65000,
    material: "Vegetable-Tanned Leather & Solid Brass Hardware",
    careInstructions: "No maintenance required.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-KEY-BRN-FREE", color: "Tan", size: "One Size", stockQuantity: 25 },
      { sku: "ABL-KEY-BLK-FREE", color: "Black", size: "One Size", stockQuantity: 30 }
    ],
    tags: ["keychain", "key-fob", "leather", "brass", "edc"]
  },
  {
    name: "Suede Leather Western Stitch Belt",
    slug: "suede-leather-western-stitch-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "Textured taupe calf suede belt featuring antique silver western buckle and engraved tip.",
    basePrice: 210000,
    salePrice: 179000,
    material: "100% Genuine Calf Suede",
    careInstructions: "Use suede brush only.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-SUE-TAU-32", color: "Taupe Suede", size: "S (30-32)", stockQuantity: 8 },
      { sku: "ABL-SUE-TAU-34", color: "Taupe Suede", size: "M (32-34)", stockQuantity: 12 },
      { sku: "ABL-SUE-TAU-36", color: "Taupe Suede", size: "L (34-36)", stockQuantity: 9 }
    ],
    tags: ["belt", "suede", "western", "taupe"]
  },
  {
    name: "Luxury Leather Valet Catchall Tray",
    slug: "luxury-leather-valet-catchall-tray",
    subCategorySlug: "accessories-belts-leather",
    description: "Collapsible nightstand organizer tray crafted with corner brass snaps in rich pull-up saddle leather.",
    basePrice: 145000,
    material: "Full-Grain Pull-Up Leather",
    careInstructions: "Wipe with clean dry microfiber.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-TRY-BRN-FREE", color: "Saddle Brown", size: "One Size", stockQuantity: 14 }
    ],
    tags: ["valet-tray", "catchall", "leather-goods", "desk", "home"]
  },
  {
    name: "Burnished Edge Bridle Leather Card Case",
    slug: "burnished-edge-bridle-leather-card-case",
    subCategorySlug: "accessories-belts-leather",
    description: "Hand-stitched pocket card wallet with beeswax-burnished edges and thumb-slide access notch.",
    basePrice: 120000,
    material: "English Bridle Leather",
    careInstructions: "Buff gently with dry cloth.",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-CAS-BUR-FREE", color: "Burgundy", size: "One Size", stockQuantity: 16 }
    ],
    tags: ["card-case", "wallet", "bridle-leather", "handcrafted"]
  },
  {
    name: "Matte Black Automatic Ratchet Belt",
    slug: "matte-black-automatic-ratchet-belt",
    subCategorySlug: "accessories-belts-leather",
    description: "Micro-adjustable track belt with no holes, providing precise 1/4-inch sizing clicks with a sleek sliding buckle.",
    basePrice: 225000,
    material: "Full-Grain Leather with Zinc Alloy Ratchet Buckle",
    careInstructions: "Wipe clean.",
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ABL-RAT-BLK-FREE", color: "Matte Black", size: "Adjustable (28-44)", stockQuantity: 20 }
    ],
    tags: ["belt", "ratchet-belt", "automatic", "black", "comfort"]
  },

  // --- 3. Men's Accessories (accessories-men) ---
  {
    name: "Chronograph Automatic Sapphire Watch",
    slug: "chronograph-automatic-sapphire-watch",
    subCategorySlug: "accessories-men",
    description: "41mm stainless steel timepiece featuring a Japanese automatic movement, sapphire crystal face, and Italian leather strap.",
    basePrice: 1850000,
    salePrice: 1650000,
    material: "316L Surgical Stainless Steel & Sapphire Glass with Genuine Leather Strap",
    careInstructions: "Water resistant to 5 ATM. Service mechanically every 3 years.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-WTC-SLV-FREE", color: "Silver/Black", size: "41mm", stockQuantity: 6 }
    ],
    tags: ["watch", "timepiece", "chronograph", "automatic", "luxury"]
  },
  {
    name: "Handmade Sterling Silver Cufflinks",
    slug: "handmade-sterling-silver-cufflinks",
    subCategorySlug: "accessories-men",
    description: "Minimalist geometric bar cufflinks forged in solid 925 sterling silver with a brushed matte finish and whale-tail clasp.",
    basePrice: 380000,
    material: "Solid 925 Sterling Silver",
    careInstructions: "Clean with silver polishing cloth.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-CUF-SLV-FREE", color: "Silver", size: "One Size", stockQuantity: 12 }
    ],
    tags: ["cufflinks", "sterling-silver", "formal", "black-tie", "wedding"]
  },
  {
    name: "Italian Mulberry Silk Jacquard Tie",
    slug: "italian-mulberry-silk-jacquard-tie",
    subCategorySlug: "accessories-men",
    description: "8cm classic blade necktie woven from 100% heavy mulberry silk in a refined micro-geometric pindot pattern.",
    basePrice: 185000,
    material: "100% Woven Mulberry Silk with Wool Interlining",
    careInstructions: "Dry clean only. Steam wrinkles gently.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-TIE-NAV-FREE", color: "Midnight Navy", size: "One Size", stockQuantity: 15 },
      { sku: "AMC-TIE-BUR-FREE", color: "Burgundy Wine", size: "One Size", stockQuantity: 12 }
    ],
    tags: ["tie", "necktie", "silk", "business", "formal"]
  },
  {
    name: "Hand-Rolled Silk Pocket Square",
    slug: "hand-rolled-silk-pocket-square",
    subCategorySlug: "accessories-men",
    description: "33cm pure silk twill handkerchief finished with artisanal hand-rolled contrasting edges in paisley print.",
    basePrice: 95000,
    material: "100% Pure Silk Twill",
    careInstructions: "Dry clean or gentle hand wash in cold water.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-PCK-PSL-FREE", color: "Navy/Gold", size: "33x33 cm", stockQuantity: 18 }
    ],
    tags: ["pocket-square", "handkerchief", "silk", "sartorial"]
  },
  {
    name: "Tortoise Shell Polarized Sunglasses",
    slug: "tortoise-shell-polarized-sunglasses",
    subCategorySlug: "accessories-men",
    description: "Handcrafted Italian acetate square sunglasses fitted with category 3 polarized lenses offering 100% UVA/UVB protection.",
    basePrice: 380000,
    material: "Mazzucchelli Bio-Acetate & Polarized CR-39 Lenses",
    careInstructions: "Clean with microfiber cloth and lens spray.",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-SNG-TOR-FREE", color: "Havana Tortoise", size: "One Size", stockQuantity: 10 }
    ],
    tags: ["sunglasses", "eyewear", "acetate", "polarized", "summer"]
  },
  {
    name: "Classic Silk Bow Tie Self-Tie",
    slug: "classic-silk-bow-tie-self-tie",
    subCategorySlug: "accessories-men",
    description: "Traditional butterfly self-tie bow tie in pure black silk grosgrain with collar sizing adjustment slider.",
    basePrice: 160000,
    material: "100% Silk Grosgrain",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-BOW-BLK-FREE", color: "Black", size: "Adjustable", stockQuantity: 14 }
    ],
    tags: ["bow-tie", "tuxedo", "black-tie", "formal", "silk"]
  },
  {
    name: "Solid Brass Collar Stays Set with Leather Case",
    slug: "solid-brass-collar-stays-set-with-leather-case",
    subCategorySlug: "accessories-men",
    description: "Set of 6 heavy solid brass shirt collar stiffeners in 2.5 and 2.75 inch lengths, presented in a calfskin travel pouch.",
    basePrice: 75000,
    salePrice: 59000,
    material: "Polished Solid Brass in Leather Case",
    careInstructions: "Wipe with dry cloth.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-COL-BRS-FREE", color: "Brass", size: "Set of 6", stockQuantity: 20 }
    ],
    tags: ["collar-stays", "brass", "shirto-accessories", "grooming"]
  },
  {
    name: "Matte Black Engraved Tie Bar Clip",
    slug: "matte-black-engraved-tie-bar-clip",
    subCategorySlug: "accessories-men",
    description: "5cm spring-clamp tie clasp in ion-plated matte black stainless steel featuring subtle diamond-knurled grip.",
    basePrice: 85000,
    material: "Ion-Plated Stainless Steel",
    careInstructions: "Wipe clean.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-TCL-BLK-FREE", color: "Matte Black", size: "5 cm", stockQuantity: 18 }
    ],
    tags: ["tie-bar", "tie-clip", "accessories", "black"]
  },
  {
    name: "Braided Leather Double-Wrap Men's Bracelet",
    slug: "braided-leather-double-wrap-mens-bracelet",
    subCategorySlug: "accessories-men",
    description: "Understated dual-wrap bracelet made of braided Italian leather cord with brushed magnetic titanium lock.",
    basePrice: 125000,
    material: "Italian Leather Cord with Magnetic Titanium Clasp",
    careInstructions: "Avoid wearing in water.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-BRC-BLK-M", color: "Black", size: "M (19cm)", stockQuantity: 15 },
      { sku: "AMC-BRC-BLK-L", color: "Black", size: "L (21cm)", stockQuantity: 12 }
    ],
    tags: ["bracelet", "leather-bracelet", "jewelry", "menswear"]
  },
  {
    name: "Knit Wool-Silk Casual Necktie",
    slug: "knit-wool-silk-casual-necktie",
    subCategorySlug: "accessories-men",
    description: "Textured squared-end knit tie blending wool and silk, ideal for dressing down tailored suits and Oxford shirts.",
    basePrice: 175000,
    material: "60% Silk, 40% Wool Knit",
    careInstructions: "Dry clean only. Roll to store.",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "AMC-KNT-FOR-FREE", color: "Forest Green", size: "6.5 cm", stockQuantity: 11 }
    ],
    tags: ["knit-tie", "casual-tie", "wool-silk", "smartcasual"]
  },

  // --- 4. Scarves & Stoles (accessories-scarves-stoles) ---
  {
    name: "Pure Himalayan Cashmere Travel Wrap",
    slug: "pure-himalayan-cashmere-travel-wrap",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Generous 200x70cm wrap woven from grade-A Himalayan cashmere with gossamer hand-fringed eyelash borders.",
    basePrice: 780000,
    salePrice: 650000,
    material: "100% Grade-A Mongolian Cashmere",
    careInstructions: "Hand wash in cold water with cashmere wool wash or dry clean. Store folded.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-CSH-OAT-FREE", color: "Oatmeal Melange", size: "200x70 cm", stockQuantity: 8 },
      { sku: "ASC-CSH-CHR-FREE", color: "Charcoal Grey", size: "200x70 cm", stockQuantity: 10 }
    ],
    tags: ["scarf", "cashmere", "pashmina", "wrap", "luxury", "winter"]
  },
  {
    name: "Artisanal Silk Jamdani Motif Stole",
    slug: "artisanal-silk-jamdani-motif-stole",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Handloom tussar silk stole featuring heritage Jamdani floral inlay weaving in gold zari and ebony.",
    basePrice: 420000,
    material: "Handloom Tussar Silk & Fine Zari",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-JAM-GLD-FREE", color: "Gold/Black", size: "180x60 cm", stockQuantity: 7 }
    ],
    tags: ["stole", "jamdani", "silk", "handloom", "festive"]
  },
  {
    name: "Classic Tartan Merino Wool Scarf",
    slug: "classic-tartan-merino-wool-scarf",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Supersoft brushed 100% merino wool winter scarf in classic Scottish Black Watch tartan plaid with twisted fringe.",
    basePrice: 280000,
    material: "100% Extra-Fine Merino Wool",
    careInstructions: "Dry clean or hand wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-TRT-NAV-FREE", color: "Black Watch Tartan", size: "180x30 cm", stockQuantity: 14 }
    ],
    tags: ["scarf", "merino-wool", "tartan", "plaid", "winter"]
  },
  {
    name: "Hand-Block Printed Mulberry Silk Scarf",
    slug: "hand-block-printed-mulberry-silk-scarf",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Square 90x90cm neck scarf stamped with wooden block botanical designs on lustrous silk twill.",
    basePrice: 240000,
    material: "100% Pure Mulberry Silk Twill",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-BLK-BOT-FREE", color: "Olive Botanical", size: "90x90 cm", stockQuantity: 12 }
    ],
    tags: ["silk-scarf", "block-print", "handkerchief", "square-scarf"]
  },
  {
    name: "Chunky Ribbed Alpaca Blend Winter Scarf",
    slug: "chunky-ribbed-alpaca-blend-winter-scarf",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Oversized chunky rib knit scarf crafted with fluffy Peruvian baby alpaca yarn for warmth against cold winds.",
    basePrice: 360000,
    salePrice: 299000,
    material: "50% Baby Alpaca, 50% Fine Highland Wool",
    careInstructions: "Hand wash cold, dry flat.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-ALP-CRM-FREE", color: "Cream", size: "210x35 cm", stockQuantity: 9 },
      { sku: "ASC-ALP-CHR-FREE", color: "Charcoal", size: "210x35 cm", stockQuantity: 11 }
    ],
    tags: ["scarf", "alpaca", "chunky-knit", "winter", "cozy"]
  },
  {
    name: "Crimson Velvet & Silk Embroidered Stole",
    slug: "crimson-velvet-and-silk-embroidered-stole",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Regal winter evening stole pairing plush crimson micro-velvet with fine zari embroidery and raw silk backing.",
    basePrice: 520000,
    material: "Silk Velvet with Zari Needlework & Raw Silk Lining",
    careInstructions: "Dry clean only.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-VLV-CRM-FREE", color: "Crimson Maroon", size: "200x55 cm", stockQuantity: 6 }
    ],
    tags: ["stole", "velvet", "zari", "wedding", "shawl"]
  },
  {
    name: "Airy Modal Linen Summer Scarf",
    slug: "airy-modal-linen-summer-scarf",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Featherlight breathable scarf with eyelash fringing, designed to protect from sun and air-conditioned breezes.",
    basePrice: 165000,
    material: "60% Modal, 40% Linen",
    careInstructions: "Hand wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-LIN-SGE-FREE", color: "Sage Green", size: "190x70 cm", stockQuantity: 15 }
    ],
    tags: ["scarf", "linen", "modal", "summer", "lightweight"]
  },
  {
    name: "Ombré Dip-Dyed Chiffon Dupatta Stole",
    slug: "ombre-dip-dyed-chiffon-dupatta-stole",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Artisan gradient dyed chiffon stole shifting from dusty rose to deep terracotta, edged with gold lurex lace.",
    basePrice: 195000,
    material: "Pure Bemberg Chiffon with Lurex Trim",
    careInstructions: "Gentle wash cold.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-OMB-ROS-FREE", color: "Dusty Rose/Terracotta", size: "220x80 cm", stockQuantity: 10 }
    ],
    tags: ["stole", "dupatta", "ombre", "chiffon", "festive"]
  },
  {
    name: "Herringbone Tweed Winter Muffler",
    slug: "herringbone-tweed-winter-muffler",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Classic gentleman's winter muffler woven in two-tone grey and black herringbone wool with fringe edges.",
    basePrice: 220000,
    salePrice: 185000,
    material: "100% Lambswool",
    careInstructions: "Dry clean.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-HND-GRY-FREE", color: "Grey Herringbone", size: "175x28 cm", stockQuantity: 12 }
    ],
    tags: ["muffler", "scarf", "herringbone", "lambswool", "classic"]
  },
  {
    name: "Ivory Pashmina Needlework Shawl",
    slug: "ivory-pashmina-needlework-shawl",
    subCategorySlug: "accessories-scarves-stoles",
    description: "Masterpiece heirloom shawl featuring needle-stitched Sozni border work on an un-dyed pure pashmina wool base.",
    basePrice: 1450000,
    material: "100% Authentic Hand-Spun Pashmina Wool with Sozni Embroidery",
    careInstructions: "Specialist heirloom dry clean only. Store with cedar balls.",
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    variants: [
      { sku: "ASC-PAS-IVR-FREE", color: "Natural Ivory", size: "200x100 cm", stockQuantity: 4 }
    ],
    tags: ["shawl", "pashmina", "sozni", "heirloom", "luxury"]
  }
];

