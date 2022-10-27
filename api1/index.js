const express = require("express");
require("dotenv").config();
const minimist = require("minimist");
const app = express();
const User = require("./models/User.model");
const session = require("express-session");
const { create } = require("express-handlebars");
//para mongo-atlas:
const mongo = require("connect-mongo");
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const mongoStore = mongo.create({
  mongoUrl: process.env.MONGO_URI,
  mongoOptions: advancedOptions,
  ttl: 600,
});
//CONFIGURACIÓN MINIMIST:
let options = { alias: { p: "puerto" } };
let args = minimist(process.argv.slice(2), options);
const PORT = args.p || 8080;
//PASSPORT:
const passport = require("passport");
const { Strategy } = require("passport-local");
const LocalStrategy = Strategy;
const { verified } = require("./utils/bcryptHandler");

/*----------- Session -----------*/
app.use(
  session({
    store: mongoStore,
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(async function (username, password, cb) {
    //Chequear usuario:
    const checkUser = await User.findOne({ email: username });
    const checkPass = await verified(password, checkUser.password);
    if (!checkUser) {
      return cb(null, false, { errorLogin: "usuario no existe." });
    } else if (!checkPass) {
      return cb(null, false, { errorLogin: "contraseña incorrecta" });
    }
    return cb(null, checkUser);
  })
);

passport.serializeUser((user, done) => {
  done(null, { _id: user._id, username: user.email });
});

passport.deserializeUser(async (user, done) => {
  const checkUser = await User.findOne({ email: user.username });

  return done(null, { _id: checkUser._id, username: checkUser.email });
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//MONGO DATABASE:
require("./config/mongo");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Motor de plantillas:
const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/routes"));

app.listen(PORT, () => {
  console.log("App en http://localhost:" + PORT);
});
