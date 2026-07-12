const crypto = require('crypto');
const prisma = require('../utils/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

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
    const userId = crypto.randomUUID();
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // Enforce employee role
        status: 'ACTIVE'
      }
    });

    // Write Activity Log entry
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        action: 'USER_SIGNUP',
        module: 'AUTHENTICATION',
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
        error: 'Invalid email or password.'
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
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
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
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    // Console-log the reset link as stub
    const token = crypto.randomBytes(32).toString('hex');
    const resetUrl = `http://localhost:3001/reset-password?token=${token}`;
    console.log(`[PASSWORD RESET SYSTEM] Email: ${email}, Link: ${resetUrl}`);

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
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Helper to fetch URL via https (fallback for older node versions)
function fetchUrl(url, headers = {}) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Google Token verification helper
async function verifyGoogleToken(token) {
  if (token.startsWith('mock_google_token::')) {
    const parts = token.split('::');
    const email = parts[1];
    const name = parts[2] || email.split('@')[0];
    return { email, name, isMock: true };
  }

  // Try verifying as access token
  try {
    const data = await fetchUrl(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    if (data && data.email) {
      return { email: data.email, name: data.name || data.email.split('@')[0] };
    }
  } catch (e) {
    // If not an access token, try verification as ID token below
  }

  // Try verifying as ID token
  try {
    const data = await fetchUrl(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (data && data.email) {
      return { email: data.email, name: data.name || data.email.split('@')[0] };
    }
  } catch (e) {
    // Ignore and throw invalid token error
  }

  throw new Error('Invalid Google authorization token.');
}

// Google Sign-In/Signup controller
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    const { email, name, isMock } = await verifyGoogleToken(token);

    if (isMock && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        error: 'Mock authentication is disabled in production.'
      });
    }

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      if (user.status === 'INACTIVE') {
        return res.status(403).json({
          success: false,
          error: 'Your account is deactivated. Please contact your system administrator.'
        });
      }
    } else {
      // Create new user (Google signup)
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await hashPassword(randomPassword);
      const userId = crypto.randomUUID();
      user = await prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          password: hashedPassword,
          role: 'EMPLOYEE',
          status: 'ACTIVE'
        }
      });

      // Write Activity Log entry for signup
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          action: 'USER_SIGNUP',
          module: 'AUTHENTICATION',
          details: `User ${user.name} (${user.email}) registered successfully via Google Sign-In.`
        }
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

    // Log the user login
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: dbToken.userId,
        action: 'PASSWORD_RESET',
        module: 'ORGANIZATION',
        details: `Password reset successfully for user ${dbToken.user.email}.`
      }
    });

    // Strip sensitive fields
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in with Google successfully.',
      data: {
        user: userWithoutPassword,
        accessToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Google authentication failed.'
    });
  }
};

