<<<<<<< HEAD
import db from "../../config/db.js";
import s3 from "../../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check Email Exists
    db.query(
      "SELECT * FROM employee_login WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database Error"
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already exists"
          });
        }

        let imageUrl = image || null;

        if (req.file) {
          const fileName =
            `employee/profiles/${Date.now()}-${req.file.originalname}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileName,
              Body: req.file.buffer,
              ContentType: req.file.mimetype
            })
          );

          imageUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
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

              return res.status(500).json({
                success: false,
                message: "Insert Failed"
              });
            }

            return res.status(201).json({
              success: true,
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

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
=======
import db from "../../config/db.js";
import s3 from "../../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check Email Exists
    db.query(
      "SELECT * FROM employee_login WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database Error"
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already exists"
          });
        }

        let imageUrl = image || null;

        if (req.file) {
          const fileName =
            `employee/profiles/${Date.now()}-${req.file.originalname}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileName,
              Body: req.file.buffer,
              ContentType: req.file.mimetype
            })
          );

          imageUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
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

              return res.status(500).json({
                success: false,
                message: "Insert Failed"
              });
            }

            return res.status(201).json({
              success: true,
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

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
>>>>>>> 5bee294a9f9e1f4c4f0bda1a4771bd78dcf6113a
};