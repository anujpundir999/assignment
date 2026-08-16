import jwt from 'jsonwebtoken';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        email: adminEmail,
        role: 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};
