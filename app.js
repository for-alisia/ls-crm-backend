const path = require("path");
const fs = require("fs");
const http = require("http");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const socketio = require("socket.io");

const HttpError = require("./utils/http-error");
const {
  MONGO_URL,
  MONGOOSE_CONF,
  ERR_DATA,
  DEFAULT_PORT,
} = require("./config");

const corsHeaders = require("./middlewares/cors-headers");
const userRoutes = require("./api/v1.0/user-routes");
const newsRoutes = require("./api/v1.0/news-routes");
const socketRun = require("./chat");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middlewares (common)
app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(corsHeaders);

// Routes
app.use("/api", userRoutes);
app.use("/api", newsRoutes);

// 404
app.use((req, res, _) => {
  const error = new HttpError(
    ERR_DATA.not_found.message,
    ERR_DATA.not_found.status
  );
  throw error;
});

// Error handling
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || ERR_DATA.unknown.status).json({
    message: error.message || ERR_DATA.unknown.message,
  });
});

socketRun(io);

mongoose
  .connect(MONGO_URL, MONGOOSE_CONF)
  .then(() => {
    console.log("Successfull connection");
    server.listen(process.env.PORT || DEFAULT_PORT, function () {
      console.log(
        `Server is listening on: ${process.env.PORT || DEFAULT_PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
