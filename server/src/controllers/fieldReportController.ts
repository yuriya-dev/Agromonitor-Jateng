import { Request, Response } from 'express';
import { PrismaClient, FieldReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

function formatFieldReport(report: any) {
  return {
    id: report.id,
    petugasCode: report.petugasCode,
    petugasName: report.petugasName,
    petugasEmail: report.petugasEmail,
    commoditySlug: report.commoditySlug,
    commodityName: report.commodityName,
    market: report.market,
    price: report.price,
    reportDate: report.reportDate.toISOString().replace('T', ' ').substring(0, 16),
    latitude: report.latitude,
    longitude: report.longitude,
    accuracy: report.accuracy,
    locationLabel: report.locationLabel,
    notes: report.notes,
    photoUrl: report.photoUrl,
    status: report.status,
    reporter: report.reporter ? {
      id: report.reporter.id,
      name: report.reporter.name,
      email: report.reporter.email,
      role: report.reporter.role,
    } : null,
    reviewedBy: report.reviewedByUser ? {
      id: report.reviewedByUser.id,
      name: report.reviewedByUser.name,
      email: report.reviewedByUser.email,
    } : null,
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString().replace('T', ' ').substring(0, 16) : null,
    createdAt: report.createdAt.toISOString().replace('T', ' ').substring(0, 16),
  };
}

export const createFieldReport = async (req: Request, res: Response) => {
  try {
    const {
      petugasCode,
      petugasName,
      petugasEmail,
      commoditySlug,
      commodityName,
      market,
      price,
      reportDate,
      latitude,
      longitude,
      accuracy,
      locationLabel,
      notes,
      photoUrl,
    } = req.body;

    if (!petugasCode || !petugasName || !commoditySlug || !commodityName || !market || price === undefined || !reportDate || latitude === undefined || longitude === undefined || !locationLabel) {
      return res.status(400).json({ success: false, message: 'Data laporan petugas belum lengkap' });
    }

    const linkedUser = petugasEmail
      ? await prisma.user.findUnique({ where: { email: petugasEmail } })
      : null;

    const report = await prisma.fieldReport.create({
      data: {
        petugasCode,
        petugasName,
        petugasEmail: petugasEmail || linkedUser?.email || null,
        reporterId: linkedUser?.id,
        commoditySlug,
        commodityName,
        market,
        price: Number(price),
        reportDate: new Date(reportDate),
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy !== undefined && accuracy !== null && accuracy !== '' ? Number(accuracy) : null,
        locationLabel,
        notes: notes || null,
        photoUrl: photoUrl || null,
      },
      include: {
        reporter: true,
        reviewedByUser: true,
      },
    });

    return res.status(201).json({ success: true, data: formatFieldReport(report) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFieldReports = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string || '').trim();
    const status = (req.query.status as string || '').trim();
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { petugasName: { contains: search, mode: 'insensitive' } },
        { petugasCode: { contains: search, mode: 'insensitive' } },
        { commodityName: { contains: search, mode: 'insensitive' } },
        { market: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'SEMUA') {
      whereClause.status = status as FieldReportStatus;
    }

    const reports = await prisma.fieldReport.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        reporter: true,
        reviewedByUser: true,
      },
    });

    return res.json({
      success: true,
      data: reports.map(formatFieldReport),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateFieldReportStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, reviewedById } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status wajib diisi' });
    }

    const report = await prisma.fieldReport.update({
      where: { id },
      data: {
        status: status as FieldReportStatus,
        reviewedById: reviewedById || null,
        reviewedAt: new Date(),
      },
      include: {
        reporter: true,
        reviewedByUser: true,
      },
    });

    // If the report was approved, integrate it into Price time-series for the next day
    if (status === FieldReportStatus.APPROVED) {
      try {
        // Find or create commodity by slug from the report
        let commodity = await prisma.commodity.findUnique({ where: { slug: report.commoditySlug } });

        if (!commodity) {
          commodity = await prisma.commodity.create({
            data: {
              slug: report.commoditySlug,
              name: report.commodityName || report.commoditySlug,
              unit: 'KG',
              description: `Auto-created from field report ${report.id}`,
            },
          });
        }

        // Determine the next day's date (normalized to start of day)
        const nextDate = new Date(report.reportDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const startOfNextDay = new Date(nextDate);
        startOfNextDay.setHours(0, 0, 0, 0);
        const endOfNextDay = new Date(startOfNextDay);
        endOfNextDay.setDate(endOfNextDay.getDate() + 1);

        // Avoid creating duplicate price for same commodity and date
        const existing = await prisma.price.findFirst({
          where: {
            commodityId: commodity.id,
            date: {
              gte: startOfNextDay,
              lt: endOfNextDay,
            },
          },
        });

        if (!existing) {
          await prisma.price.create({
            data: {
              commodityId: commodity.id,
              price: Number(report.price),
              date: startOfNextDay,
              market: report.market || 'Rata-rata Jawa Tengah',
              status: 'VALID',
              source: 'FieldReport',
            },
          });
        }
      } catch (innerErr) {
        console.error('Failed to create Price from approved FieldReport', innerErr);
        // Do not fail the whole request because of price creation error; log and continue
      }
    }

    return res.json({ success: true, data: formatFieldReport(report) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Aggregate APPROVED FieldReports into averaged Price entries per commodity/market for the next day
export const aggregateApprovedFieldReports = async (req?: Request | any, res?: Response) => {
  try {
    const reports = await prisma.fieldReport.findMany({ where: { status: 'APPROVED' } });

    const groups: Record<string, { commoditySlug: string; commodityName: string; market: string; date: Date; prices: number[]; reportIds: string[] }> = {};

    for (const r of reports) {
      const next = new Date(r.reportDate);
      next.setDate(next.getDate() + 1);
      const start = new Date(next);
      start.setHours(0, 0, 0, 0);

      const key = `${r.commoditySlug}||${r.market || 'Rata-rata Jawa Tengah'}||${start.toISOString()}`;

      if (!groups[key]) {
        groups[key] = { commoditySlug: r.commoditySlug, commodityName: r.commodityName, market: r.market || 'Rata-rata Jawa Tengah', date: start, prices: [], reportIds: [] };
      }

      groups[key].prices.push(Number(r.price));
      groups[key].reportIds.push(r.id);
    }

    let created = 0;
    let skipped = 0;
    const details: Array<{ key: string; created: boolean; count: number }> = [];

    for (const [key, g] of Object.entries(groups)) {
      try {
        // ensure commodity exists
        let commodity = await prisma.commodity.findUnique({ where: { slug: g.commoditySlug } });
        if (!commodity) {
          commodity = await prisma.commodity.create({ data: { slug: g.commoditySlug, name: g.commodityName || g.commoditySlug, unit: 'KG', description: `Auto-created from aggregation` } });
        }

        // check if price exists for that commodity and date
        const start = g.date;
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const exists = await prisma.price.findFirst({ where: { commodityId: commodity.id, date: { gte: start, lt: end }, market: g.market } });
        if (exists) {
          skipped++;
          details.push({ key, created: false, count: g.prices.length });
          continue;
        }

        const sum = g.prices.reduce((a, b) => a + b, 0);
        let avg = Math.round((sum / g.prices.length));
        // round to nearest 100 to match seeding behaviour
        avg = Math.round(avg / 100) * 100;

        await prisma.price.create({ data: { commodityId: commodity.id, price: avg, date: start, market: g.market, status: 'VALID', source: 'FieldReportsAggregate' } });
        created++;
        details.push({ key, created: true, count: g.prices.length });
      } catch (e) {
        console.error('Aggregation error for group', key, e);
      }
    }

    const result = { scanned: reports.length, groups: Object.keys(groups).length, created, skipped, details };

    if (res) return res.json({ success: true, data: result });
    return result;
  } catch (error) {
    console.error(error);
    if (res) return res.status(500).json({ success: false, message: 'Server Error' });
    throw error;
  }
};