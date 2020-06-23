exports.MONGO_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

exports.MONGOOSE_CONF = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
