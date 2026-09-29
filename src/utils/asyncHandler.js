/**
 * Wraps an async route handler or middleware to catch errors and forward them to Express next()
 * @param {Function} fn - Asynchronous function (req, res, next)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
