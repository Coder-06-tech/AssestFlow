const prisma = require('../config/db');
const crypto = require('crypto');

// GET all allocations
exports.getAllocations = async (req, res, next) => {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        asset: {
          include: {
            category: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        User_Allocation_allocatedByIdToUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        allocatedAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: allocations
    });
  } catch (error) {
    next(error);
  }
};

// POST create new allocation
exports.createAllocation = async (req, res, next) => {
  try {
    const { assetId, userId, dueDate, notes } = req.body;
    const allocatedById = req.user.id; // From authMiddleware

    if (!assetId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID and User ID are required.'
      });
    }

    // Verify asset and user exist
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return res.status(450).status(404).json({
        success: false,
        message: 'Asset not found.'
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if the asset is already allocated (active allocation)
    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        status: 'ACTIVE'
      }
    });

    // If it's already allocated, it will be marked as a Double Allocation conflict
    // but we can still register it if the organization permits (which generates a conflict)
    
    // Create the allocation record
    const allocation = await prisma.allocation.create({
      data: {
        id: crypto.randomUUID(),
        assetId,
        userId,
        allocatedById,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      include: {
        asset: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Update asset status to ALLOCATED and set owner
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: 'ALLOCATED',
        assignedToId: userId
      }
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: allocatedById,
        action: 'ALLOCATION_CREATE',
        module: 'ALLOCATION',
        details: `Asset "${asset.name}" [${asset.assetTag}] allocated to ${targetUser.name}.`
      }
    });

    // Trigger Notification for the assigned user
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        message: `New Asset Allocated: The unit "${asset.name}" [${asset.assetTag}] has been allocated to you.`,
        type: 'Alerts',
        createdAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Asset allocated successfully.',
      data: allocation
    });
  } catch (error) {
    next(error);
  }
};

// POST return allocated asset
exports.returnAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { conditionOnReturn, notes } = req.body;
    const userId = req.user.id;

    const allocation = await prisma.allocation.findUnique({
      where: { id },
      include: { asset: true, user: true }
    });

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation record not found.'
      });
    }

    if (allocation.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'This allocation has already been marked as returned.'
      });
    }

    // Update allocation to RETURNED
    const updatedAllocation = await prisma.allocation.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
        conditionOnReturn: conditionOnReturn || 'Good',
        notes: notes ? `${allocation.notes || ''} | Return note: ${notes}` : allocation.notes
      }
    });

    // Check if there are other active allocations for this asset (resolving double allocation)
    const otherActive = await prisma.allocation.findFirst({
      where: {
        assetId: allocation.assetId,
        status: 'ACTIVE',
        id: { not: id }
      }
    });

    // Update the Asset: if another active allocation exists, assign to that user.
    // Otherwise set status to AVAILABLE and assignedToId to null
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: otherActive ? 'ALLOCATED' : 'AVAILABLE',
        assignedToId: otherActive ? otherActive.userId : null
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        action: 'ALLOCATION_RETURN',
        module: 'ALLOCATION',
        details: `Asset "${allocation.asset.name}" [${allocation.asset.assetTag}] returned by ${allocation.user.name}.`
      }
    });

    // Trigger Notification for the returning user
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: allocation.userId,
        message: `Asset Returned: The unit "${allocation.asset.name}" [${allocation.asset.assetTag}] has been returned and marked as AVAILABLE.`,
        type: 'Alerts',
        createdAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Asset marked as returned successfully.',
      data: updatedAllocation
    });
  } catch (error) {
    next(error);
  }
};

// GET allocations activity logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        module: 'ALLOCATION'
      },
      take: 10,
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
