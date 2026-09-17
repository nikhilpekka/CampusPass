// Wraps an async route handler so thrown errors reach errorMiddleware
// instead of crashing the process. Keeps controllers free of try/catch.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
