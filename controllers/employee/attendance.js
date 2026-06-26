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

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Check-in image is required",
                allowed_formats: ["jpg", "jpeg", "png"],
                max_file_size: "1 MB",
            });
        }

        const fileName = `attendance/checkin/${Date.now()}-${req.file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            })
        );

        const checkin_image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        const checkSql = `
            SELECT attendance_id
            FROM employee_attendance
            WHERE employee_id = ?
            AND DATE(checkin_time) = CURDATE()
            LIMIT 1
        `;

        db.query(checkSql, [employee_id], (checkErr, rows) => {
            if (checkErr) {
                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: checkErr.message,
                });
            }

            if (rows.length > 0) {
                const attendanceId = rows[0].attendance_id;

                const updateSql = `
                    UPDATE employee_attendance
                    SET
                        employee_name = ?,
                        checkin_time = NOW(),
                        checkin_image = ?,
                        checkin_location = ?,
                        checkin_lat = ?,
                        checkin_long = ?,

                        checkout_time = NULL,
                        checkout_image = NULL,
                        checkout_location = NULL,
                        checkout_lat = NULL,
                        checkout_long = NULL,

                        status = 'Present'
                        WHERE attendance_id = ?
                `;

                db.query(
                    updateSql,
                    [
                        employee_name,
                        checkin_image,
                        checkin_location,
                        checkin_lat,
                        checkin_long,
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
                            message:
                                "Today's attendance already exists. Record updated successfully.",
                            attendance_id: attendanceId,
                            checkin_image,
                        });
                    }
                );

                return;
            }

            const updateSql = `
                UPDATE employee_attendance
                SET
                    employee_name = ?,
                    checkin_time = NOW(),
                    checkin_image = ?,
                    checkin_location = ?,
                    checkin_lat = ?,
                    checkin_long = ?,

                    checkout_time = NULL,
                    checkout_image = NULL,
                    checkout_location = NULL,
                    checkout_lat = NULL,
                    checkout_long = NULL,

                    status = 'Present'

                WHERE attendance_id = ?
            `;

            const insertSql = `
INSERT INTO employee_attendance (
    employee_id,
    employee_name,
    checkin_time,
    checkin_image,
    checkin_location,
    checkin_lat,
    checkin_long,
    status
)
VALUES (
    ?, ?, NOW(), ?, ?, ?, ?, 'Present'
)
`;

            db.query(
                insertSql,
                [
                    employee_id,
                    employee_name,
                    checkin_image,
                    checkin_location,
                    checkin_lat,
                    checkin_long,
                ],
                (insertErr, result) => {
                    if (insertErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error",
                            error: insertErr.message,
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Check-in successful",
                        attendance_id: result.insertId,
                        checkin_image,
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

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Check-out image is required",
                allowed_formats: ["jpg", "jpeg", "png"],
                max_file_size: "1 MB",
            });
        }

        const fileName = `attendance/checkout/${Date.now()}-${req.file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            })
        );

        const checkout_image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        const findSql = `
                    SELECT
                    attendance_id,
                    checkin_time,
                    checkout_time
                FROM employee_attendance
                WHERE employee_id = ?
                AND DATE(checkin_time) = CURDATE()
                AND checkout_time IS NULL
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
                        checkout_long = ?,
                        status =
                            CASE
                                WHEN TIMESTAMPDIFF(HOUR, checkin_time, NOW()) >= 8 THEN 'Present'
                                WHEN TIMESTAMPDIFF(HOUR, checkin_time, NOW()) >= 4 THEN 'Half Day'
                                ELSE 'Permission'
                            END
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

//get attendance status of employee (CHECKED_IN or CHECKED_OUT)

export const getAttendanceStatus = (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "employee_id is required",
            });
        }

        const sql = `
           SELECT
                attendance_id,

                DATE(checkin_time) AS checkin_date,
                TIME(checkin_time) AS checkin_time,

                DATE(checkout_time) AS checkout_date,
                TIME(checkout_time) AS checkout_time,

                status

            FROM employee_attendance
            WHERE employee_id = ?
            AND DATE(checkin_time) = CURDATE()
            ORDER BY attendance_id DESC
            LIMIT 1
        `;

        db.query(sql, [employee_id], (err, result) => {
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
                    message: "No attendance record found for today",
                });
            }

            return res.status(200).json({
                success: true,
                data: result[0],
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};