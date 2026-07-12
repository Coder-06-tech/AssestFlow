const prisma = require('../config/db');
const crypto = require('crypto');

// GET active audit cycle
exports.getActiveAudit = async (req, res, next) => {
  try {
    // Find active audit
    let activeAudit = await prisma.audit.findFirst({
      where: { status: 'PENDING' },
      include: {
        AuditAsset: {
          include: {
            Asset: true
          }
        }
      }
    });

    // If no active audit cycle exists, auto-create one using existing assets in the DB
    if (!activeAudit) {
      const allAssets = await prisma.asset.findMany();
      if (allAssets.length > 0) {
        const auditId = `audit-${crypto.randomUUID().slice(0, 8)}`;
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        const adminId = adminUser ? adminUser.id : 'admin-user-id';

        activeAudit = await prisma.audit.create({
          data: {
            id: auditId,
            title: 'Q3 Physical Asset Audit',
            status: 'PENDING',
            createdById: adminId,
            updatedAt: new Date()
          }
        });

        // Add assets to the audit cycle
        for (const asset of allAssets) {
          await prisma.auditAsset.create({
            data: {
              id: `auditasset-${crypto.randomUUID().slice(0, 8)}`,
              auditId: activeAudit.id,
              assetId: asset.id,
              status: 'PENDING'
            }
          });
        }

        // Re-query with includes
        activeAudit = await prisma.audit.findUnique({
          where: { id: auditId },
          include: {
            AuditAsset: {
              include: {
                Asset: true
              }
            }
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: activeAudit
    });
  } catch (error) {
    next(error);
  }
};

// POST verify specific asset in audit cycle
exports.verifyAsset = async (req, res, next) => {
  try {
    const { auditAssetId, status, notes } = req.body;
    const verifiedById = req.user.id;

    if (!auditAssetId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Audit Asset ID and status are required.'
      });
    }

    const updated = await prisma.auditAsset.update({
      where: { id: auditAssetId },
      data: {
        status,
        notes: notes || null,
        verifiedAt: new Date(),
        verifiedById
      },
      include: {
        Asset: true
      }
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: verifiedById,
        action: 'AUDIT_VERIFY',
        module: 'AUDIT',
        details: `Asset "${updated.Asset.name}" [${updated.Asset.assetTag}] verified as ${status} in audit.`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Asset verification status updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// POST close audit cycle
exports.closeAudit = async (req, res, next) => {
  try {
    const { auditId } = req.body;
    const userId = req.user.id;

    const updated = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        action: 'AUDIT_CLOSE',
        module: 'AUDIT',
        details: `Audit cycle "${updated.title}" closed successfully.`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Audit cycle closed successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
