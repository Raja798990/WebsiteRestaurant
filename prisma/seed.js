import { PrismaClient } from "@prisma/client";

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
      password: Buffer.from("admin123").toString("base64"), // Change in production!
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
    prisma.wineCategory.create({ data: { name: "Vins Rouges", order: 1 } }),
    prisma.wineCategory.create({ data: { name: "Vins Blancs", order: 2 } }),
    prisma.wineCategory.create({ data: { name: "Vins Rosés", order: 3 } }),
    prisma.wineCategory.create({ data: { name: "Vins de la Maison", order: 4 } }),
  ]);
  console.log(`✅ Created ${wineCategories.length} wine categories`);

  // 5. Create Sample Wines
  await prisma.wine.createMany({
    data: [
      { categoryId: wineCategories[0].id, name: "Château Bordeaux", glassPrice: 5.5, bottlePrice: 28.0 },
      { categoryId: wineCategories[0].id, name: "Côtes du Rhône", glassPrice: 4.5, bottlePrice: 22.0 },
      { categoryId: wineCategories[1].id, name: "Chardonnay", glassPrice: 5.0, bottlePrice: 25.0 },
      { categoryId: wineCategories[1].id, name: "Pinot Grigio", glassPrice: 4.8, bottlePrice: 23.0 },
      { categoryId: wineCategories[2].id, name: "Provence Rosé", glassPrice: 5.2, bottlePrice: 26.0 },
      { categoryId: wineCategories[3].id, name: "Maison Rouge", glassPrice: 3.5, bottlePrice: 15.0 },
      { categoryId: wineCategories[3].id, name: "Maison Blanc", glassPrice: 3.5, bottlePrice: 15.0 },
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