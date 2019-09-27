const express = require("express"),
app           = express(),
bodyParser    = require("body-parser"),
flash         = require("connect-flash");
rp            = require("request-promise"),
fs            = require("fs"),
csv           = require("csv-parser"),
config        = require("./config")
// ================================================================================
const mongoose = require("mongoose"),
passport       = require("passport"),
LocalStrategy  = require("passport-local"),
session        = require("express-session"),
FileStore      = require("session-file-store")(session);
cookieParser   = require("cookie-parser");
User           = require("./models/user"),
middleware     = require("./middleware")
// ================================================================================
const indexRouter     = require("./routes/indexRouter"),
      userRouter      = require("./routes/userRouter"),
      watchlistRouter = require("./routes/watchlistRouter"),
      likeMovielistRouter = require("./routes/likeMovielistRouter"),
      dislikeMovielistRouter = require("./routes/dislikeMovielistRouter"),
      searchRouter    = require("./routes/searchRouter")
// ================================================================================

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser("Hello, This is my Secret Line"));

app.use(flash()); //for flash messages

// Mongoose connect ===============================================================

mongoose.connect(config.dbUrl, {useNewUrlParser: true, useFindAndModify: false})
.then(() => {
    console.log("DB Connected Successfully");
})
.catch((err) => console.log(err));

// Express Session Setup ==========================================================
app.use(session({
    secret: "Hello, This is my Secret Line",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: { maxAge: 3600000, secure: false, httpOnly: true }
}));

// Passport Setup =================================================================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables Setup =========================================================
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Routers Setup ===================================================================

app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/user', userRouter);
app.use('/user/mywatchlist', middleware.isLoggedIn, watchlistRouter);
app.use('/user/likemovielist', middleware.isLoggedIn, likeMovielistRouter);
app.use('/user/dislikemovielist', middleware.isLoggedIn, dislikeMovielistRouter);

// =================================================================================

app.get("*", (req, res) => {
    res.send("<h1>Error 404!! Sorry, Page Not Found</h1>");
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Movie App has started on port: ${port}`));