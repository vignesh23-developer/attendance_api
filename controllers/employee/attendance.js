import db from "../../config/db.js";
import s3 from "../../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const employeeCheckIn = async (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      checkin_location,
      checkin_lat,
      checkin_long,
    } = req.body;

    if (!employee_id || !employee_name) {
      return res.status(400).json({
        success: false,
        message: "employee_id and employee_name are required",
      });
    }

    let checkin_image = null;

    if (req.file) {
      const fileName = `attendance/checkin/${Date.now()}-${
        req.file.originalname
      }`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      checkin_image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    const sql = `
      INSERT INTO employee_attendance (
        employee_id,
        employee_name,
        checkin_time,
        checkin_image,
        checkin_location,
        checkin_lat,
        checkin_long
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        employee_id,
        employee_name,
        checkin_image,
        checkin_location,
        checkin_lat,
        checkin_long,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Check-in successful",
          attendance_id: result.insertId,
          checkin_image,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const employeeCheckOut = async (req, res) => {
  try {
    const {
      employee_id,
      checkout_location,
      checkout_lat,
      checkout_long,
    } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id is required",
      });
    }

    let checkout_image = null;

    if (req.file) {
      const fileName = `attendance/checkout/${Date.now()}-${
        req.file.originalname
      }`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      checkout_image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    const findSql = `
      SELECT attendance_id
      FROM employee_attendance
      WHERE employee_id = ?
      AND checkout_time IS NULL
      ORDER BY attendance_id DESC
      LIMIT 1
    `;

    db.query(findSql, [employee_id], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No active check-in found",
        });
      }

      const attendanceId = result[0].attendance_id;

      const updateSql = `
        UPDATE employee_attendance
        SET
          checkout_time = NOW(),
          checkout_image = ?,
          checkout_location = ?,
          checkout_lat = ?,
          checkout_long = ?
        WHERE attendance_id = ?
      `;

      db.query(
        updateSql,
        [
          checkout_image,
          checkout_location,
          checkout_lat,
          checkout_long,
          attendanceId,
        ],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              success: false,
              message: "Database error",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Check-out successful",
            checkout_image,
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};