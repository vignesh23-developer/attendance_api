import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { sendError, sendSuccess, sendDbError } from "../../utils/response.js";

export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "Email and Password are required");
  }

  db.query(
    "SELECT * FROM admin_login WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        return sendDbError(res);
      }

      if (results.length === 0) {
        return sendError(res, 404, "Admin Not Found");
      }

      const user = results[0];

      if (password !== user.password) {
        return sendError(res, 401, "Invalid Password");
      }

      const token = jwt.sign(
        {
          email: user.email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return sendSuccess(res, 200, {
        message: "Admin Login Successful",
        data: {
          "email": user.email,
          "name": user.name,
          "role": "admin",
          "image": user.image,
          token,
        },
      });
    }
  );
};
