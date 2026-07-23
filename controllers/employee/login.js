import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { sendError, sendSuccess } from "../../utils/response.js";

export const employeeLogin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, 400, "Email and Password are required");
    }

    db.query(
        "SELECT * FROM employee_login WHERE email = ?",
        [email],
        (err, results) => {
            if (err) {
                console.error(err);

                return sendError(res, 500, "Database Error, Please Contact Admin");
            }

            if (results.length === 0) {
                return sendError(res, 404, "Employee Not Found");
            }

            const user = results[0];

            // role is VARCHAR, this is fine
            // if (user.role !== "employee") {
            //     return res.status(403).json({
            //         success: false,
            //         message: "Employee Access Only",
            //     });
            // }

            // plain text password comparison
            if (user.password !== password) {
                return sendError(res, 401, "Invalid Password");
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

            return sendSuccess(res, 200, {
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
