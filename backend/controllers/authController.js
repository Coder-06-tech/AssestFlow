// Auth controller placeholder
exports.login = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, message: 'Not implemented' });
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, message: 'Not implemented' });
  } catch (error) {
    next(error);
  }
};
