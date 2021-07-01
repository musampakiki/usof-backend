require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const category = require("./routes/category");
const article = require("./routes/article");
const user = require("./routes/user");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", auth);
app.use("/api/v1/admin", admin);
app.use("/api/v1/categories", category);
app.use("/api/v1/users", user);
app.use("/api/v1/articles", article);

app.use(errorHandler);

const HOST = process.env.db_host || localhost;
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port http://${HOST}:${PORT}, GO!`));
