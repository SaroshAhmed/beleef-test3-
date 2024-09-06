const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const databaseConnect = require("./config/database");
const routes = require("./routes/v1");
const { MONGO_URI, SECRET_KEY, REACT_APP_FRONTEND_URL } = require("./config");

const app = express();
require("./config/passport");

app.use(
  cors({
    origin: REACT_APP_FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({limit: '50mb'}));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions', // Ensure the collection name is correctly defined
      autoRemove: 'native', // Automatically remove expired sessions
      stringify: false, // Avoids issues with saving undefined or null values as strings
    }),
    cookie: {
      secure: false, // Use secure: true if using HTTPS
      maxAge: 30 * 60 * 1000, // Set the session to expire after 30 minutes (in milliseconds)
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  const html = `
      <html>
          <head>
              <title>Welcome</title>
          </head>
          <body>
              <h1>Welcome to Beleef Backend APIs</h1>
              <p>This is backend page</p>
          </body>
      </html>
  `;
  res.send(html);
});

databaseConnect();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));