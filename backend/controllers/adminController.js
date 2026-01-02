import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);
  if (!authHeader) {
    console.warn("Missing Authorization header");
    return res.status(401).json({ message: "Missing Authorization" });
  }
  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.warn("JWT verification error:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }
    console.log("JWT verified user:", user);
    req.user = user;
    next();
  });
}

export default authenticate;
