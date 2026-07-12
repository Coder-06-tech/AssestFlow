const prisma = require('../utils/db');
const { randomUUID } = require('crypto');

// 1. Utilization by department
exports.getUtilizationByDept = async (req, res, next) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const where = {};
    if (categoryId) {
      where.asset = { categoryId };
    }
    if (startDate || endDate) {
      where.allocatedAt = {};
      if (startDate) where.allocatedAt.gte = new Date(startDate);
      if (endDate) where.allocatedAt.lte = new Date(endDate);
    }

    const allocations = await prisma.allocation.findMany({
      where,
      include: {
        asset: {
          include: {
            department: true
          }
        }
      }
    });

    const deptUsage = {};
    allocations.forEach(alloc => {
      const deptName = alloc.asset?.department?.name || 'Unassigned';
      deptUsage[deptName] = (deptUsage[deptName] || 0) + 1;
    });

    const departments = await prisma.department.findMany({
      where: { status: 'ACTIVE' }
    });

    const data = departments.map(d => ({
      name: d.name,
      value: deptUsage[d.name] || 0
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 2. Maintenance Frequency
exports.getMaintenanceFrequency = async (req, res, next) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const where = {};
    if (categoryId) {
      where.Asset = { categoryId };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const requests = await prisma.maintenance.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const frequency = {};
    requests.forEach(req => {
      const month = req.createdAt.toLocaleDateString(undefined, { month: 'short' });
      frequency[month] = (frequency[month] || 0) + 1;
    });

    const data = Object.keys(frequency).map(label => ({
      label,
      count: frequency[label]
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 3. Most Used Assets
exports.getMostUsedAssets = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const assets = await prisma.asset.findMany({
      include: {
        allocations: { select: { id: true } },
        bookings: { select: { id: true } }
      }
    });

    const ranked = assets.map(asset => {
      const uses = asset.allocations.length + asset.bookings.length;
      return {
        label: `${asset.name} (${asset.assetTag})`,
        metric: `${uses} uses`
      };
    }).sort((a, b) => {
      const aVal = parseInt(a.metric);
      const bVal = parseInt(b.metric);
      return bVal - aVal;
    }).slice(0, parseInt(limit, 10));

    return res.status(200).json({ success: true, data: ranked });
  } catch (error) {
    next(error);
  }
};

// 4. Idle Assets
exports.getIdleAssets = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const thresholdDate = new Date(Date.now() - parseInt(days, 10) * 24 * 60 * 60 * 1000);

    const assets = await prisma.asset.findMany({
      include: {
        allocations: {
          orderBy: { allocatedAt: 'desc' },
          take: 1
        },
        bookings: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    const idle = [];
    assets.forEach(asset => {
      const lastAlloc = asset.allocations[0]?.allocatedAt;
      const lastBook = asset.bookings[0]?.date;
      
      const lastUsed = [lastAlloc, lastBook].filter(Boolean).sort((a, b) => b - a)[0];
      
      if (!lastUsed || lastUsed < thresholdDate) {
        const diffTime = Math.abs(new Date() - (lastUsed || asset.createdAt));
        const idleDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        idle.push({
          label: `${asset.name} (${asset.assetTag})`,
          metric: `unused ${idleDays} days`
        });
      }
    });

    const data = idle.sort((a, b) => {
      const aVal = parseInt(a.metric.replace('unused ', ''));
      const bVal = parseInt(b.metric.replace('unused ', ''));
      return bVal - aVal;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 5. Maintenance Due or Retiring
exports.getMaintenanceDueOrRetiring = async (req, res, next) => {
  try {
    const retirementThresholdYears = 3;
    const retirementDate = new Date(Date.now() - retirementThresholdYears * 365 * 24 * 60 * 60 * 1000);

    // Nearing retirement assets
    const assets = await prisma.asset.findMany({
      where: {
        purchaseDate: { lte: retirementDate },
        status: { notIn: ['LOST', 'DISPOSED', 'RETIRED'] }
      }
    });

    // Due for maintenance assets (have non-resolved maintenance requests)
    const activeMaintenance = await prisma.maintenance.findMany({
      where: {
        status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
      },
      include: {
        Asset: true
      }
    });

    const list = [];
    assets.forEach(asset => {
      const ageYears = Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (365 * 24 * 60 * 60 * 1000));
      list.push({
        label: `${asset.name} (${asset.assetTag})`,
        metric: `${ageYears} yrs old, nearing retirement`
      });
    });

    activeMaintenance.forEach(req => {
      if (req.Asset) {
        list.push({
          label: `${req.Asset.name} (${req.Asset.assetTag})`,
          metric: `${req.priority} Priority Service Due`
        });
      }
    });

    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// 6. Allocation Summary
exports.getAllocationSummary = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      where: { status: 'ACTIVE' },
      include: {
        assets: {
          where: { status: 'ALLOCATED' }
        }
      }
    });

    const data = departments.map(d => ({
      department: d.name,
      allocatedCount: d.assets.length
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 7. Booking Heatmap
exports.getBookingHeatmap = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: 'COMPLETED' }
    });

    const grid = Array.from({ length: 7 }, () => 
      Array.from({ length: 12 }, () => 0)
    );

    bookings.forEach(booking => {
      const day = new Date(booking.date).getDay();
      const mappedDay = day === 0 ? 6 : day - 1;
      
      const hour = parseInt(booking.startTime.split(':')[0], 10);
      const slot = Math.floor(hour / 2);

      if (mappedDay >= 0 && mappedDay < 7 && slot >= 0 && slot < 12) {
        grid[mappedDay][slot] += 1;
      }
    });

    return res.status(200).json({ success: true, data: grid });
  } catch (error) {
    next(error);
  }
};
