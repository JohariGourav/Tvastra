//---------Import section-----------

const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require("mongoose"),
      flash         = require("flash"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      logger        = require("morgan"),
      cors          = require("cors"),
      compression   = require("compression"),
      path          = require("path"),
      passportLocalMongoose = require("passport-local-mongoose");

// requiring routes
const indexRoutes = require("./backend/routes/index");
const User = require("./backend/models/user-model");
// const mainRoutes    = require("./backend/routes/MainRoutes");

//-------DB CONNECT -------
let dbURL = process.env.DATABASEURL || "mongodb+srv://tvastra-user:741852963@cluster0.38yrv.mongodb.net/tvastra?retryWrites=true&w=majority";

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then( _ => {
  console.log("DB connected");
}).catch( err => {
  console.log("ERROR DB con: ", err.message);
});
      
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/client/views");
app.engine("html", require("ejs").renderFile);

app.use(express.static(__dirname + "/client"));

app.use(logger("dev"));

app.use(require("express-session")({
  secret: "TvastraSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: "/",
    secure: !true,
    maxAge: null,
    httpOnly: true
  }
}));
app.use(flash());

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( (req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.currentUser = req.session.currentUser;
  // console.log("local err",res.locals.error);
  // console.log("local success",res.locals.success);
  console.log("local currentuser",res.locals.currentUser);
  next();
})

app.use("/", indexRoutes);
app.get("/abcd", (req, res) => {
  console.log("book route");
  res.send("Hi ABC");
});


app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), () => {
  console.log("Tvastra node running in port: " + app.get("port"));
});