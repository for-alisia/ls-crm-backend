const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./utils/http-error");
const { MONGO_URL, MONGOOSE_CONF } = require("./config");

const corsHeaders = require("./middlewares/cors-headers");
const userRoutes = require("./api/v1.0/user-routes");
const newsRoutes = require("./api/v1.0/news-routes");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(corsHeaders);

app.use("/api", userRoutes);
app.use("/api", newsRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Page not found", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({
    message: error.message || "An unknown error occured",
  });
});

mongoose
  .connect(MONGO_URL, MONGOOSE_CONF)
  .then(() => {
    console.log("Successfull connection");
    app.listen(process.env.PORT || 8000, function () {
      console.log(`Server is listening on: ${process.env.PORT || "8000"}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
