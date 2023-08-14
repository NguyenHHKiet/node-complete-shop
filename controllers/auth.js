const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.postLogin = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: errors.array()[0].msg,
                validationErrors: errors.array(),
            });
        }

        const user = await User.findOne({ email: email }).lean();

        if (!user) {
            // req.flash("error", "Invalid email or password.");
            // let [message] = req.flash("error");
            // 401 Unauthorized
            // return res.status(401).json({ message });
            return res.status(422).json({
                message: "Invalid email or password.",
                validationErrors: [],
            });
        }

        bcrypt
            .compare(password, user.password)
            .then((doMatch) => {
                if (doMatch) {
                    req.session["isLoggedIn"] = true;
                    req.session["user"] = { ...user };
                    req.session.save();
                    // OK The request succeeded.
                    res.status(200).json({
                        message: "OK The request succeeded.",
                    });
                } else {
                    res.status(422).json({
                        message: "Invalid email or password.",
                        validationErrors: [],
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                // 500 Internal Server Error
                res.status(500).json({
                    message: "500 Internal Server Error",
                });
            });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postSignup = (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log({ email, password, confirmPassword });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            message: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] },
            });
            return user.save();
        })
        .then((result) => {
            // OK The request succeeded.
            return res.status(200).json({
                message: "OK The request succeeded.",
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    return req.session.destroy((err) => {
        console.log(err);
        // 203 Non-Authoritative Information
        res.status(203).json({ message: "203 Non-Authoritative Information" });
    });
};
