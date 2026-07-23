import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { verifyPassword } from "../../utils/password.js";

export const employeeLogin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required",
        });
    }

    db.query(
        "SELECT * FROM employee_login WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error, Please Contact Admin",
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Employee Not Found",
                });
            }

            const user = results[0];

            // role is VARCHAR, this is fine
            // if (user.role !== "employee") {
            //     return res.status(403).json({
            //         success: false,
            //         message: "Employee Access Only",
            //     });
            // }

            const passwordMatches = await verifyPassword(password, user.password);

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Password",
                });
            }

            const token = jwt.sign(
                {
                    id: user.employee_id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                }
            );

            return res.status(200).json({
                success: true,
                message: "Employee Login Successful",
                data: {
                    loginId: user.employee_id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    number: user.number,
                    image: user.image,
                },
                token,
            });
        }
    );
};