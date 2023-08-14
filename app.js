const path = require("path");
const fs = require("fs");
const https = require("https");

const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const csrf = require("csurf");
// const upload = require("./middleware/upload");
// const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./uploads"); // uploads is the folder name
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // use the original file name
//     },
// });
// const upload = multer({ storage: storage }).single("file"); // file is the field name
// const upload = multer({ dest: "uploads/" }); // specify the destination folder for uploaded files

const User = require("./models/userModel");
const errorController = require("./controllers/errorController");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.yq5iral.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new MongoDBStore({
    uri: uri,
    collection: "sessions",
});

// Catch errors
store.on("error", function (error) {
    console.log("store: " + error);
});

/*
Cookie-parser là một middleware để mã hóa cookie trong expressjs. 
Express-session sử dụng cookie để lưu trữ id phiên. 
*/
// ------------------------------------------------------------------------------

// create express app
const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.text({ type: "/" }));
// app.use(upload);

// When you use express - session, the only cookie sent to frontend is connect.sid.
// By default, it is httpOnly, this way you cannot access it in React.
// To achieve it, you need to change httpOnly config to false.
app.use(
    session({
        secret: "subscribe",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(flash());

// required for {
// setup route middlewares
const csrfProtection = csrf();
app.use(csrfProtection);
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsOptions));

// }

// --------------------------------------------------------------------------

// res.locals là một đối tượng của đối tượng Response trong Nodejs, nó chứa các biến cục bộ trong phạm vi của một Request.
// Bạn có thể sử dụng res.locals để lưu trữ các dữ liệu mà bạn muốn truyền đến công cụ kết xuất(như ejs)
// hoặc các middleware khác trong chu kỳ Request / Response.res.locals sẽ tồn tại cho đến khi kết thúc Response.

// app.use((req, res, next) => {
//     console.log(
//         "----------------------------------------------------------------"
//     );
//     console.log(req.session);
//     console.log(
//         "----------------------------------------------------------------"
//     );
//     // res.locals.isAuthenticated = req.session.isLoggedIn;
//     // res.locals.csrfToken = req.csrfToken();
//     next();
// });

app.use((req, res, next) => {
    // Tăng số lần xem
    if (req.session.views) {
        req.session.views++;
    } else {
        req.session.views = 1;
    }

    if (!req.session.user) return next();

    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) return next();
            req.user = user;
            next();
        })

        .catch((err) => {
            next(new Error(err));
        });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/error", errorController.get404);

app.use("/getCSRFToken", csrfProtection, function (req, res) {
    // pass the csrfToken to the view
    // res.render('send', { csrfToken: req.csrfToken() })
    res.status(200).send({ csrfToken: req.csrfToken() });
});

// app.use("/upload", (req, res) => {
//     upload(req, res, (err, data) => {
//         if (err) {
//             console.log("err" + err.message);
//             res.status(500).send(err.message);
//         } else {
//             console.log("file" + req.file);
//             res.status(200).send(req.file);
//         }
//     });
// });

// app.post("/upload", upload.single("file"), (req, res) => {
//     // req.file contains the file information
//     // req.body contains the other variables
//     console.log(req.files);
//     console.log(req.body);
//     res.send("File uploaded successfully");
// });

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send("Error: " + error);
});

// openssl req -nodes -new -x509 - keyout server.key -out server.cert
mongoose
    .connect(uri)
    .then(() => {
        // https
        //   .createServer({ key: privateKey, cert: certificate }, app)
        //   .listen(process.env.PORT || 5000);
        app.listen(process.env.PORT || 5000);
    })
    .catch((err) => console.log(err));
