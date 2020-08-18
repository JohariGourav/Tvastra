//---------Import section-----------

const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require("mongoose"),
      flash         = require("connect-flash"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      logger        = require("morgan"),
      cors          = require("cors"),
      compression   = require("compression"),
      path          = require("path"),
      createError   = require("http-errors"),
      passportLocalMongoose = require("passport-local-mongoose");

const config = require("dotenv").config();
// console.log("config: ", config);

// requiring routes
const indexRoutes = require("./backend/routes/index");
const userRoutes = require("./backend/routes/user");
const User = require("./backend/models/user-model");
// const mainRoutes    = require("./backend/routes/MainRoutes");

//-------DB CONNECT -------
// console.log("db var: ",process.env.DATABASEURL);
let dbURL = process.env.DATABASEURL || "mongodb+srv://tvastra-client:147258369client@cluster0.38yrv.mongodb.net/tvastra?retryWrites=true&w=majority";

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
  res.locals.currentUser = req.session.currentUser || null;
  console.log("local err",res.locals.error);
  console.log("local success",res.locals.success);
  console.log("local currentuser",res.locals.currentUser);
  next();
})

app.use("/", indexRoutes);
app.use("/user", userRoutes);


app.get("/abcd", (req, res) => {
  console.log("book route");
  res.send("Hi ABC");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}); 


app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), () => {
  console.log("Tvastra node running in port: " + app.get("port"));
});