const jwt = require("jsonwebtoken");

function authGuard(context) {
  const authHeader = context.req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Unauthorized: Missing token");

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("Unauthorized: Invalid/Expired token");
  }
}

module.exports = authGuard;