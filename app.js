const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const corsHeaders = require('./middlewares/cors-headers');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(corsHeaders);
