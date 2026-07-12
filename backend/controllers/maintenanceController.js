const prisma = require('../config/db');
const crypto = require('crypto');

// Fetch all maintenance requests
exports.getMaintenanceRequests = async (req, res, next) => {
  try {
    const { assetId, status } = req.query;
    const filter = {};

    if (assetId) filter.assetId = assetId;
    if (status) filter.status = status;

    const requests = await prisma.maintenance.findMany({
      where: filter,
      include: {
        Asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
            status: true,
            location: true
          }
        },
        User_Maintenance_raisedByIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        User_Maintenance_assignedToIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response to be compatible with frontend naming conventions
    const formattedData = requests.map(r => ({
      id: r.id,
      assetId: r.assetId,
      raisedById: r.raisedById,
      assignedToId: r.assignedToId,
      priority: r.priority,
      status: r.status,
      description: r.description,
      notes: r.notes,
      createdAt: r.createdAt,
      resolvedAt: r.status === 'RESOLVED' ? r.updatedAt : null,
      asset: r.Asset,
      user: r.User_Maintenance_raisedByIdToUser,
      assignedTech: r.User_Maintenance_assignedToIdToUser,
      technicianAssigned: r.User_Maintenance_assignedToIdToUser ? r.User_Maintenance_assignedToIdToUser.name : null
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// Raise a new maintenance request
exports.raiseRequest = async (req, res, next) => {
  try {
    const { assetId, description, priority } = req.body;
    const userId = req.user.id; // String UUID

    if (!assetId || !description) {
      return res.status(400).json({
        success: false,
        message: 'assetId and description are required'
      });
    }

    // Verify asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Create maintenance record (generate UUID)
    const request = await prisma.maintenance.create({
      data: {
        id: crypto.randomUUID(),
        assetId: assetId,
        raisedById: userId,
        status: 'PENDING',
        description,
        priority: priority || 'LOW',
        updatedAt: new Date()
      },
      include: {
        Asset: true,
        User_Maintenance_raisedByIdToUser: {
          select: { name: true, email: true }
        }
      }
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        action: 'MAINTENANCE_RAISE',
        module: 'MAINTENANCE',
        details: `Raised maintenance ticket ${request.id} for asset ${asset.name}.`
      }
    });

    // Create database notification trigger
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        message: `Critical Maintenance Required: Raised request for asset ${asset.name} (Priority: ${priority || 'LOW'}).`,
        type: 'Alerts',
        createdAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance request raised successfully',
      data: {
        id: request.id,
        assetId: request.assetId,
        status: request.status,
        description: request.description,
        priority: request.priority,
        createdAt: request.createdAt,
        asset: request.Asset,
        user: request.User_Maintenance_raisedByIdToUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update request status (workflow) and asset status
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const requestId = req.params.id; // String UUID
    const { status, technicianId, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required'
      });
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check permissions
    if (!['ADMIN', 'ASSET_MANAGER'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators and Asset Managers can update maintenance request workflows'
      });
    }

    const request = await prisma.maintenance.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found'
      });
    }

    let targetAssetStatus = null;
    if (status === 'APPROVED') {
      targetAssetStatus = 'UNDER_MAINTENANCE';
    } else if (status === 'RESOLVED') {
      targetAssetStatus = 'AVAILABLE';
    }

    // Execute state transitions
    let updatedRequest;
    if (targetAssetStatus) {
      // In a transaction, update maintenance request AND asset status
      const [reqUpdate, assetUpdate] = await prisma.$transaction([
        prisma.maintenance.update({
          where: { id: requestId },
          data: {
            status,
            assignedToId: technicianId || undefined,
            notes: notes || undefined,
            updatedAt: new Date()
          },
          include: {
            Asset: true,
            User_Maintenance_raisedByIdToUser: { select: { name: true, email: true } },
            User_Maintenance_assignedToIdToUser: { select: { name: true } }
          }
        }),
        prisma.asset.update({
          where: { id: request.assetId },
          data: { status: targetAssetStatus }
        })
      ]);
      updatedRequest = reqUpdate;
    } else {
      updatedRequest = await prisma.maintenance.update({
        where: { id: requestId },
        data: {
          status,
          assignedToId: technicianId || undefined,
          notes: notes || undefined,
          updatedAt: new Date()
        },
        include: {
          Asset: true,
          User_Maintenance_raisedByIdToUser: { select: { name: true, email: true } },
          User_Maintenance_assignedToIdToUser: { select: { name: true } }
        }
      });
    }

    // Log the action
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        action: `MAINTENANCE_${status}`,
        module: 'MAINTENANCE',
        details: `Maintenance ticket ${requestId} status updated to ${status}.`
      }
    });

    // Create database notification trigger for raising user
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: request.raisedById,
        message: `Audit Schedule Confirmed: Maintenance request status updated to ${status}.`,
        type: 'Approvals',
        createdAt: new Date()
      }
    });

    // Create database notification trigger for technician if assigned
    if (technicianId) {
      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          userId: technicianId,
          message: `Critical Maintenance Required: Assigned ticket for asset (Priority: ${request.priority}).`,
          type: 'Alerts',
          createdAt: new Date()
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Request workflow updated to ${status}`,
      data: {
        id: updatedRequest.id,
        assetId: updatedRequest.assetId,
        status: updatedRequest.status,
        description: updatedRequest.description,
        priority: updatedRequest.priority,
        notes: updatedRequest.notes,
        createdAt: updatedRequest.createdAt,
        asset: updatedRequest.Asset,
        user: updatedRequest.User_Maintenance_raisedByIdToUser,
        assignedTech: updatedRequest.User_Maintenance_assignedToIdToUser,
        technicianAssigned: updatedRequest.User_Maintenance_assignedToIdToUser ? updatedRequest.User_Maintenance_assignedToIdToUser.name : null
      }
    });

  } catch (error) {
    next(error);
  }
};
