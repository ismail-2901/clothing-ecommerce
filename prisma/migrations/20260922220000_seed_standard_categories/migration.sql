-- Seed standard categories for both admin and customer storefront
INSERT INTO "Category" ("id", "name", "slug", "description", "position", "updatedAt")
VALUES
  (concat('cat_', md5('women')), 'Women', 'women', 'Women''s collection & fashion', 1, NOW()),
  (concat('cat_', md5('men')), 'Men', 'men', 'Men''s collection & essentials', 2, NOW()),
  (concat('cat_', md5('tops')), 'Tops', 'tops', 'Shirts, t-shirts, and tops', 3, NOW()),
  (concat('cat_', md5('dresses')), 'Dresses', 'dresses', 'Dresses and jumpsuits', 4, NOW()),
  (concat('cat_', md5('outerwear')), 'Outerwear', 'outerwear', 'Jackets, coats, and blazers', 5, NOW()),
  (concat('cat_', md5('bottoms')), 'Bottoms', 'bottoms', 'Pants, trousers, and skirts', 6, NOW()),
  (concat('cat_', md5('activewear')), 'Activewear', 'activewear', 'Workout and athleisure', 7, NOW()),
  (concat('cat_', md5('accessories')), 'Accessories', 'accessories', 'Bags, scarves, and jewelry', 8, NOW()),
  (concat('cat_', md5('essentials')), 'Essentials', 'essentials', 'Everyday wardrobe staples', 9, NOW())
ON CONFLICT ("slug") DO UPDATE
SET "position" = EXCLUDED."position",
    "updatedAt" = NOW();
