import crypto from "crypto";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!ADMIN_JWT_SECRET) {
  console.warn(
    "ADMIN_JWT_SECRET is not set. Admin authentication will fail until it is configured."
  );
}

const buildUnauthorized = (message) => ({
  success: false,
  error: message,
});

const base64UrlDecode = (str) =>
  Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8"
  );

const verifyJwt = (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const header = JSON.parse(base64UrlDecode(encodedHeader));

    // Optional exp validation if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return { header, payload };
  } catch (err) {
    return null;
  }
};

const authenticateAdmin = (req, res, next) => {
  try {
    if (!ADMIN_JWT_SECRET) {
      return res
        .status(500)
        .json(buildUnauthorized("Admin authentication is not configured"));
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return res
        .status(401)
        .json(buildUnauthorized("Missing Bearer authorization token"));
    }

    const verified = verifyJwt(token, ADMIN_JWT_SECRET);

    if (!verified) {
      return res
        .status(401)
        .json(buildUnauthorized("Invalid or expired authorization token"));
    }

    const payload = verified.payload;

    if (!payload || payload.role !== "admin") {
      return res
        .status(403)
        .json(buildUnauthorized("Insufficient permissions for admin route"));
    }

    req.admin = {
      id: payload.sub || payload.id || null,
      email: payload.email || null,
      role: payload.role,
    };

    return next();
  } catch (err) {
    const status = err.name === "TokenExpiredError" ? 401 : 401;
    return res
      .status(status)
      .json(buildUnauthorized("Invalid or expired authorization token"));
  }
};

export default authenticateAdmin;
