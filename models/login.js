const jwt = require('jsonwebtoken');
const db = require("../db/database.js");
const bcrypt = require('bcryptjs');
const envVars = require('../routes/variables');
let secret = envVars.secret;


const Login = {
    checkLogin: function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        db.get("SELECT * FROM users WHERE email = ?",
            email,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (rows === undefined) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/login",
                            title: "User not found",
                            detail: "User with provided email not found."
                        }
                    });
                }

                const user = rows;

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/login",
                                title: "bcrypt error",
                                detail: "bcrypt error"
                            }
                        });
                    }

                    if (result) {
                        let payload = { email: user.email, id: user.id };
                        let jwtToken = jwt.sign(payload, secret, { expiresIn: '1h' });

                        return res.json({
                            data: {
                                type: "success",
                                message: "User logged in",
                                user: payload,
                                token: jwtToken
                            }
                        });
                    }

                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/login",
                            title: "Wrong password",
                            detail: "Password is incorrect."
                        }
                    });
                });
            });
    },
    getUserName: function (res, id) {
        let sql = `SELECT email FROM users WHERE id= ?`;

        db.all(
            sql, id,
            function (err, rows) {
                if (err) {
                    res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "No name found",
                            detail: err.message
                        }
                    });
                }
                res.json({ data: rows });
            });
    }
};

module.exports = Login;
