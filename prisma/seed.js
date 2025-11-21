// Updated Wine Seeding for prisma/seed.js

// Create Wine Categories
const wineCategories = await Promise.all([
  prisma.wineCategory.create({ 
    data: { name: "La sélection maison", nameEn: "house", order: 1 } 
  }),
  prisma.wineCategory.create({ 
    data: { name: "Les vins blancs", nameEn: "white", order: 2 } 
  }),
  prisma.wineCategory.create({ 
    data: { name: "Les vins rosés", nameEn: "rose", order: 3 } 
  }),
  prisma.wineCategory.create({ 
    data: { name: "Les vins rouges", nameEn: "red", order: 4 } 
  }),
]);
console.log(`✅ Created ${wineCategories.length} wine categories`);

// Create Wines
await prisma.wine.createMany({
  data: [
    // ========== HOUSE WINES ==========
    {
      categoryId: wineCategories[0].id, // House
      name: "Cuvée Selectionnée «Il Nabucco» en blanc, rouge et rosé",
      country: null,
      glassPrice: 4.00,
      pitcher25cl: 7.00,
      pitcher50cl: 12.00,
      pitcher1l: 22.00,
      halfBottle: null,
      fullBottle: null,
    },

    // ========== WHITE WINES ==========
    // Italy
    {
      categoryId: wineCategories[1].id, // White
      name: "Vermentino della Puglia - Vecchia Torre - 2020",
      country: "Italie",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: null,
      fullBottle: 21.00,
    },
    {
      categoryId: wineCategories[1].id,
      name: "Remole IGT - Frescobaldi - Toscana - 2019",
      country: "Italie",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: null,
      fullBottle: 24.00,
    },
    {
      categoryId: wineCategories[1].id,
      name: "Albizzia IGT - Chardonnay - Frescobaldi - 2020",
      country: "Italie",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: null,
      fullBottle: 24.00,
    },
    // France
    {
      categoryId: wineCategories[1].id,
      name: "Pinot Gris des chasseurs de Lune - Alsace - 2019",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: 15.00,
      fullBottle: 25.00,
    },
    {
      categoryId: wineCategories[1].id,
      name: "Sancerre «Le Chant du Merle» - Loire - 2020",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: 18.00,
      fullBottle: 35.00,
    },
    {
      categoryId: wineCategories[1].id,
      name: "Chablis - 2020",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: null,
      fullBottle: 33.00,
    },

    // ========== ROSÉ WINES ==========
    {
      categoryId: wineCategories[2].id, // Rosé
      name: "Pinot noir - Alsace rosé - Domaine Fernand Engel - 2020",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: 16.50,
      fullBottle: 26.00,
    },
    {
      categoryId: wineCategories[2].id,
      name: "L'estandon - Rosé de provence - 2020",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: null,
      fullBottle: 24.00,
    },
    {
      categoryId: wineCategories[2].id,
      name: "Sancerre « Le Chant du Merle» - 2020",
      country: "France",
      glassPrice: null,
      pitcher25cl: null,
      pitcher50cl: null,
      pitcher1l: null,
      halfBottle: 18.00,
      fullBottle: 35.00,
    },

    // ========== RED WINES (add similar structure) ==========
    // You can add red wines here following the same pattern
  ],
});
console.log("✅ Created sample wines from real menu");