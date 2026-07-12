const crypto = require('crypto');
const prisma = require('../utils/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// Helper to hash token
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Signup controller
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email is already registered.'
      });
    }

    // Hash password and save user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Uses password field
        role: 'EMPLOYEE', // Enforce employee role
        status: 'ACTIVE'
      }
    });

    // Write audit log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_SIGNUP',
        module: 'ORGANIZATION',
        details: `User ${user.name} (${user.email}) registered successfully.`
      }
    });

    // Strip sensitive fields
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Login controller
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.' // Generic message as required
      });
    }

    // Verify status
    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated. Please contact your system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password); // Uses password field
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.' // Generic message as required
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send refresh token as HTTP-Only Cookie
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    // Strip sensitive fields
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: userWithoutPassword,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token controller
exports.refresh = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    const refreshToken = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is missing.'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user in DB to verify status and current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account is invalid or inactive.'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token.'
    });
  }
};

// Logout controller
exports.logout = async (req, res, next) => {
  try {
    // Clear cookie
    res.setHeader(
      'Set-Cookie',
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user controller
exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user || user.status === 'INACTIVE') {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive.'
      });
    }

    // Strip password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password request controller
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Silently return success even if user not found to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been generated.'
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save token hash in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // Console-log the reset link as stub
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log('\n=========================================');
    console.log(`[PASSWORD RESET SYSTEM] Email: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('=========================================\n');

    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been generated.'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password action controller
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    // Find the token
    const dbToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!dbToken || dbToken.used || dbToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token.'
      });
    }

    // Hash and update the user's password
    const newPasswordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: dbToken.userId },
      data: { password: newPasswordHash } // Uses password field
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: dbToken.id },
      data: { used: true }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: dbToken.userId,
        action: 'PASSWORD_RESET',
        module: 'ORGANIZATION',
        details: `Password reset successfully for user ${dbToken.user.email}.`
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    next(error);
  }
};
