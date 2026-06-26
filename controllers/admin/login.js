import jwt from "jsonwebtoken";
import db from "../../config/db.js";

export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  db.query(
    "SELECT * FROM admin_login WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database Error, Please Contact Support",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin Not Found",
        });
      }

      const user = results[0];

      if (password !== user.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid Password",
        });
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

      return res.status(200).json({
        success: true,
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