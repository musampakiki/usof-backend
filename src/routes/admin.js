const express = require("express");
const router = express.Router();
const {
  getUsers,
  removeUser,
  getArticles,
  removeArticle,
  getCategories,
  removeCategory,
} = require("../controllers/admin");
const { admin, protect } = require("../middlewares/auth");

router.route("/users").get(protect, admin, getUsers);
router.route("/articles").get(protect, admin, getArticles);
router.route("/users/:username").delete(protect, admin, removeUser);
router.route("/articles/:id").delete(protect, admin, removeArticle);
router.route("/categories").get(protect, admin, getCategories);
router.route("/categories/:id").delete(protect, admin, removeCategory);

module.exports = router;
