import db from "../../config/db.js";
import { uploadFileToS3 } from "../../utils/s3Upload.js";
import { sendError, sendSuccess } from "../../utils/response.js";

export const employeeRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      number,
      image
    } = req.body;

    if (!name || !email || !password || !role || !number) {
      return sendError(res, 400, "All fields are required");
    }

    // Check Email Exists
    db.query(
      "SELECT * FROM employee_login WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return sendError(res, 500, "Database Error");
        }

        if (results.length > 0) {
          return sendError(res, 409, "Email already exists");
        }

        let imageUrl = image || null;

        if (req.file) {
          imageUrl = await uploadFileToS3(req.file, "employee/profiles");
        }

        db.query(
          `INSERT INTO employee_login
          (name,email,password,role,number,image)
          VALUES (?,?,?,?,?,?)`,
          [
            name,
            email,
            password,
            role,
            number,
            imageUrl
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.log(insertErr);

              return sendError(res, 500, "Insert Failed");
            }

            return sendSuccess(res, 201, {
              message: "Employee Registered Successfully",
              employeeId: result.insertId,
              image: imageUrl
            });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);

    return sendError(res, 500, "Server Error");
  }
};
