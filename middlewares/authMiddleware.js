import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log(req.cookies.token, 'req.user!!!')
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({ message: "Unauthorized - No token found" });
  }

  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded); // 🛠️ Debug log to check the token contents

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }
};

export default authMiddleware;
