import { Router } from "express";
import prisma from "../prismaClient.js";

const router = Router();

// GET /api/dashboard - Get dashboard overview data
router.get("/", async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get 7 days ago for recent activity
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all data in parallel for better performance
    const [
      todayReservations,
      pendingReservations,
      totalMenuItems,
      recentRequests,
      totalReservations,
      confirmedToday,
    ] = await Promise.all([
      // Today's reservations with guest count
      prisma.reservation.findMany({
        where: {
          reservationDate: { gte: today, lt: tomorrow },
        },
        orderBy: { reservationTime: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          reservationTime: true,
          adults: true,
          children: true,
          specialRemarks: true,
          status: true,
        },
      }),

      // Pending reservations (all dates)
      prisma.reservation.count({
        where: { status: "pending" },
      }),

      // Total active menu items
      prisma.menuItem.count({
        where: { available: true },
      }),

      // Recent contact requests (last 7 days)
      prisma.request.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          message: true,
          createdAt: true,
        },
      }),

      // Total reservations (all time)
      prisma.reservation.count(),

      // Confirmed reservations for today
      prisma.reservation.count({
        where: {
          reservationDate: { gte: today, lt: tomorrow },
          status: "confirmed",
        },
      }),
    ]);

    // Calculate today's guest count
    const todayGuestCount = todayReservations.reduce(
      (sum, r) => sum + r.adults + r.children,
      0
    );

    // Format today's reservations
    const todaySchedule = todayReservations.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      time: r.reservationTime.toISOString().substring(11, 16),
      adults: r.adults,
      children: r.children,
      totalGuests: r.adults + r.children,
      specialRemarks: r.specialRemarks,
      status: r.status,
    }));

    // Response structure
    const dashboardData = {
      // Key metrics
      metrics: {
        todayReservationsCount: todayReservations.length,
        todayGuestCount,
        pendingReservationsCount: pendingReservations,
        confirmedTodayCount: confirmedToday,
        totalMenuItems,
        totalReservationsAllTime: totalReservations,
        recentRequestsCount: recentRequests.length,
      },

      // Today's schedule
      todaySchedule,

      // Recent activity
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        message: r.message.substring(0, 100) + (r.message.length > 100 ? "..." : ""),
        createdAt: r.createdAt,
      })),
    };

    res.json(dashboardData);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// GET /api/dashboard/stats - Get detailed statistics
router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      reservationsByStatus,
      reservationsLast30Days,
      topCustomers,
      avgGuestsPerReservation,
    ] = await Promise.all([
      // Reservations by status
      prisma.reservation.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Reservations in the last 30 days
      prisma.reservation.count({
        where: {
          reservationDate: { gte: thirtyDaysAgo },
        },
      }),

      // Top 5 customers (most reservations)
      prisma.reservation.groupBy({
        by: ["email", "name"],
        _count: { email: true },
        orderBy: { _count: { email: "desc" } },
        take: 5,
      }),

      // Average guests per reservation
      prisma.reservation.aggregate({
        _avg: {
          adults: true,
          children: true,
        },
      }),
    ]);

    const stats = {
      reservationsByStatus: reservationsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      reservationsLast30Days,
      topCustomers: topCustomers.map((c) => ({
        name: c.name,
        email: c.email,
        reservationCount: c._count.email,
      })),
      avgGuestsPerReservation: {
        adults: avgGuestsPerReservation._avg.adults || 0,
        children: avgGuestsPerReservation._avg.children || 0,
        total:
          (avgGuestsPerReservation._avg.adults || 0) +
          (avgGuestsPerReservation._avg.children || 0),
      },
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

// GET /api/dashboard/weekly-reservations - Get reservations for the upcoming week
router.get("/weekly-reservations", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: today,
          lt: nextWeek,
        },
      },
      orderBy: [{ reservationDate: "asc" }, { reservationTime: "asc" }],
      select: {
        id: true,
        name: true,
        reservationDate: true,
        reservationTime: true,
        adults: true,
        children: true,
        status: true,
      },
    });

    // Group by date
    const groupedByDate = reservations.reduce((acc, r) => {
      const dateKey = r.reservationDate.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        id: r.id,
        name: r.name,
        time: r.reservationTime.toISOString().substring(11, 16),
        adults: r.adults,
        children: r.children,
        totalGuests: r.adults + r.children,
        status: r.status,
      });
      return acc;
    }, {});

    res.json(groupedByDate);
  } catch (err) {
    console.error("Error fetching weekly reservations:", err);
    res.status(500).json({ error: "Failed to load weekly reservations" });
  }
});

export default router;