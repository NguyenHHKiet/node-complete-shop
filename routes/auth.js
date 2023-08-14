const express = require("express");
const { body, check, matchedData } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/userModel");

const router = express.Router();

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email address.")
            .normalizeEmail(),
        body("password", "Password has to be valid.")
            .isLength({ min: 8 })
            .isAlphanumeric()
            .trim(),
    ],
    authController.postLogin
);

router.post(
    "/signup",
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email.")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject(
                            "E-Mail exists already, please pick a different one."
                        );
                    }
                });
            })
            .normalizeEmail(),
        body(
            "password",
            "Please enter a password with only numbers and text and at least 8 characters."
        )
            .isLength({ min: 8 })
            .isAlphanumeric()
            .trim(),
        body("confirmPassword")
            .trim()
            .custom((value, { req }) => {
                const { password } = matchedData(req);
                if (value !== password) {
                    throw new Error("Passwords have to match!");
                }
                return true;
            }),
    ],

    authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
