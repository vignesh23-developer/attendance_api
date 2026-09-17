// Shared HTTP JSON response helpers.
// Keeps the { success, message, ...extra } envelope consistent across controllers.

export const sendError = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

export const sendSuccess = (res, status, body = {}) =>
  res.status(status).json({ success: true, ...body });

// Convenience wrapper for the common "Database Error" 500 response.
export const sendDbError = (
  res,
  message = "Database Error, Please Contact Support",
  extra = {}
) => sendError(res, 500, message, extra);
