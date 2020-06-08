const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const corsHeaders = require('./middlewares/cors-headers');
const HttpError = require('./utils/http-error');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const newsRoutes = require('./routes/news-routes');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(corsHeaders);

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', newsRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Page not found', 404);
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
    message: error.message || 'An unknown error occured',
  });
});

const server = app.listen(process.env.PORT || 8000, function () {
  console.log('Server is listening on:' + server.address().port);
});
