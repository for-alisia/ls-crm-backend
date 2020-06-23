const path = require('path');
const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socketio = require('socket.io');

const HttpError = require('./utils/http-error');
const { MONGO_URL, MONGOOSE_CONF, ERR_DATA, DEFAULT_PORT, IMG_PATH } = require('./config');

const corsHeaders = require('./middlewares/cors-headers');
const errorHandler = require('./middlewares/error-handling');
const prodMiddlewares = require('./middlewares/prod');
const userRoutes = require('./api/v1.0/user-routes');
const newsRoutes = require('./api/v1.0/news-routes');
const socketRun = require('./chat');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

if (process.env.MODE === 'PROD') {
  prodMiddlewares(app);
}

// Middlewares (common)
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join(__dirname, IMG_PATH)));

app.use(corsHeaders);

// Routes
app.use('/api', userRoutes);
app.use('/api', newsRoutes);

// 404
app.use((req, res, next) => {
  return next(new HttpError(ERR_DATA.not_found.message, ERR_DATA.not_found.status));
});

// Error Handling
app.use(errorHandler);

// Chat
socketRun(io);

// DB connection
mongoose.connect(MONGO_URL, MONGOOSE_CONF).then(() => console.log(`Successfull connection to: ${process.env.DB_NAME}`));

// Start server
server.listen(process.env.PORT || DEFAULT_PORT, function () {
  console.log(`Server is listening on: ${process.env.PORT || DEFAULT_PORT}`);
});

module.exports = server;
