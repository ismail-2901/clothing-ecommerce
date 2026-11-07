import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export type SeedProductItem = {
  name: string;
  slug: string;
  subCategorySlug: string;
  description: string;
  basePrice: number; // in paisa
  salePrice?: number;
  material: string;
  careInstructions: string;
  imageUrl: string;
  variants: Array<{ sku: string; color: string; size: string; stockQuantity: number }>;
  tags: string[];
};

export const SUBCATEGORY_METADATA: Record<string, { image: string; description: string }> = {
  "women-saree": {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    description: "Timeless artisanal sarees handwoven in fine silks, jamdani, and heirloom weaves."
  },
  "women-single-ethnic": {
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    description: "Contemporary ethnic kurtis, tunics, and regal single kameez ensembles."
  },
  "women-shirts-blouses": {
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80",
    description: "Tailored silk shirts, crisp poplin button-downs, and effortless day blouses."
  },
  "women-tshirts-tanks": {
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    description: "Essential organic cotton tees, ribbed racerback tanks, and relaxed everyday tops."
  },
  "women-dresses": {
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    description: "Fluid maxi dresses, sculpted evening silhouettes, and minimal slip dresses."
  },
  "women-cord-set": {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    description: "Matching monochromatic co-ords, relaxed linen sets, and structured two-pieces."
  },
  "women-baggy-jeans": {
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    description: "Relaxed wide-leg denim, pleated tailored trousers, and effortless straight pants."
  },
  "women-jacket": {
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    description: "Architectural blazers, wool-blend overcoats, and lightweight chore jackets."
  },
  "men-panjabi": {
    image: "https://images.unsplash.com/photo-1627885278788-29ec109f3e49?auto=format&fit=crop&w=1200&q=80",
    description: "Refined festive panjabis, geometric embroidered kurtas, and luxury silk cuts."
  },
  "men-waistcoat": {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    description: "Structured Nehru jackets, formal waistcoats, and traditional textured vests."
  },
  "men-shirt": {
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
    description: "Crisp Oxford shirts, breathable linen button-downs, and spread-collar casuals."
  },
  "men-polo-shirt": {
    image: "https://images.unsplash.com/photo-1625910513413-7223366c30f4?auto=format&fit=crop&w=1200&q=80",
    description: "Refined piqué polos, tipped collar knitwear, and mercerized cotton tops."
  },
  "men-t-shirt": {
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    description: "Heavyweight boxy tees, clean minimalist crewnecks, and vintage washed jersey."
  },
  "men-pants": {
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    description: "Tailored pleated trousers, relaxed chinos, selvedge denim, and versatile bottoms."
  },
  "men-winter-wear": {
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80",
    description: "Heavyweight hoodies, bomber jackets, ribbed sweaters, and premium outerwear."
  },
  "men-blazer-suit": {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80",
    description: "Double-breasted blazers, modern peak-lapel suits, and formal tuxedos."
  },
  "accessories-bags-wallets": {
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    description: "Handcrafted leather totes, structured crossbody bags, and minimalist bifold wallets."
  },
  "accessories-belts-leather": {
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=80",
    description: "Full-grain Italian leather belts, solid brass buckle accents, and leather accessories."
  },
  "accessories-men": {
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    description: "Chronograph timepieces, silver cufflinks, knit ties, and gentleman accents."
  },
  "accessories-scarves-stoles": {
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
    description: "Fine cashmere wraps, hand-printed silk scarves, and cozy winter stoles."
  }
};

