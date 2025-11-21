import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Admin User
  const admin = await prisma.admin.upsert({
    where: { email: "admin@nabucco.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nabucco.com",
      password: await bcrypt.hash("admin123", 10),
      role: "superadmin",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // 2. Create Menu Categories
  const menuCategories = await Promise.all([
    prisma.menuCategory.create({ data: { name: "Apéritifs", order: 1 } }),
    prisma.menuCategory.create({ data: { name: "Softs", order: 2 } }),
    prisma.menuCategory.create({ data: { name: "Jus", order: 3 } }),
    prisma.menuCategory.create({ data: { name: "Eaux Minérales", order: 4 } }),
    prisma.menuCategory.create({ data: { name: "Bières", order: 5 } }),
    prisma.menuCategory.create({ data: { name: "Potages", order: 6 } }),
    prisma.menuCategory.create({ data: { name: "Salades", order: 7 } }),
    prisma.menuCategory.create({ data: { name: "Entrées froides", order: 8 } }),
    prisma.menuCategory.create({ data: { name: "Entrées chaudes", order: 9 } }),
    prisma.menuCategory.create({ data: { name: "Poissons", order: 10 } }),
    prisma.menuCategory.create({
      data: { name: "Viandes", order: 11, note: "Sauces au choix: Poivre, Champignons, Roquefort - 3 €" },
    }),
    prisma.menuCategory.create({
      data: { name: "Pâtes", order: 12, note: "Sauce au choix: Bolognaise, Carbonara, Napolitaine" },
    }),
    prisma.menuCategory.create({ data: { name: "Pizzas", order: 13 } }),
    prisma.menuCategory.create({
      data: {
        name: "Plats Indiens",
        order: 14,
        note: "Sauce au choix: Korma, Masala, Madras, Vindaloo, Curry",
      },
    }),
    prisma.menuCategory.create({ data: { name: "Desserts", order: 15 } }),
    prisma.menuCategory.create({ data: { name: "Boissons chaudes", order: 16 } }),
    prisma.menuCategory.create({ data: { name: "Digestif – Alcools", order: 17 } }),
  ]);
  console.log(`✅ Created ${menuCategories.length} menu categories`);

  // 3. Create Sample Menu Items
  await prisma.menuItem.createMany({
    data: [
      { categoryId: menuCategories[5].id, name: "Soupe du jour", price: 4.5 },
      { categoryId: menuCategories[5].id, name: "Velouté de légumes", price: 5.0 },
      { categoryId: menuCategories[12].id, name: "Pizza Margherita", price: 9.5 },
      { categoryId: menuCategories[12].id, name: "Pizza Quattro Stagioni", price: 12.0 },
      { categoryId: menuCategories[12].id, name: "Pizza Napoli", price: 11.5 },
      { categoryId: menuCategories[11].id, name: "Spaghetti Bolognaise", price: 11.0 },
      { categoryId: menuCategories[11].id, name: "Penne Carbonara", price: 11.5 },
      { categoryId: menuCategories[10].id, name: "Entrecôte (250g)", price: 18.5 },
      { categoryId: menuCategories[10].id, name: "Filet de bœuf (200g)", price: 22.0 },
      { categoryId: menuCategories[9].id, name: "Saumon grillé", price: 16.5 },
      { categoryId: menuCategories[14].id, name: "Tiramisu", price: 5.5 },
      { categoryId: menuCategories[14].id, name: "Dame Blanche", price: 6.0 },
    ],
  });
  console.log("✅ Created sample menu items");

  // 4. Create Wine Categories
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


  // 5. Create Sample Wines
  await prisma.wine.createMany({
    data: [
        // House Wine
        {
        categoryId: wineCategories[0].id,
        name: "Cuvée Selectionnée «Il Nabucco» en blanc, rouge et rosé",
        country: null,
        glassPrice: 4.00,
        pitcher25cl: 7.00,
        pitcher50cl: 12.00,
        pitcher1l: 22.00,
        halfBottle: null,
        fullBottle: null,
        },

        // White Wines - Italy
        {
        categoryId: wineCategories[1].id,
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

        // White Wines - France
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

        // Rosé Wines
        {
        categoryId: wineCategories[2].id,
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
    ],
  });
  console.log("✅ Created sample wines");

  // 6. Create Sample Specials
  await prisma.specialCombo.createMany({
    data: [
      { name: "Carpaccio + Entrecôte", entreePrice: 8.5, fullPrice: 24.5 },
      { name: "Salade César + Saumon", entreePrice: 7.5, fullPrice: 22.0 },
    ],
  });

  await prisma.specialMain.createMany({
    data: [
      { name: "Osso Buco milanaise", price: 18.5 },
      { name: "Côtelettes d'agneau", price: 19.0 },
    ],
  });

  await prisma.specialCustom.createMany({
    data: [
      { name: "Apéro Spritz", description: "Cocktail de la maison", price: 8.0 },
      { name: "Café gourmand", description: "Café + 3 mini desserts", price: 7.5 },
    ],
  });
  console.log("✅ Created specials");

  // 7. Create Sample Reservation
  await prisma.reservation.create({
    data: {
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      reservationDate: new Date("2025-12-15"),
      reservationTime: new Date("1970-01-01T19:30:00"),
      adults: 4,
      children: 1,
      specialRemarks: "Anniversaire - prévoir bougie",
      status: "confirmed",
    },
  });
  console.log("✅ Created sample reservation");

  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });