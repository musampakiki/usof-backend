const express = require("express");
const router = express.Router();
const { recommendedArticles } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

const {
  newArticle,
  getArticle,
  likeArticle,
  dislikeArticle,
  addComment,
  newView,
  searchArticle,
} = require("../controllers/article");

router.route("/").post(protect, newArticle);
router.route("/").get(recommendedArticles);
router.route("/search").get(protect, searchArticle);
router.route("/:id").get(protect, getArticle);
router.route("/:id/like").get(protect, likeArticle);
router.route("/:id/dislike").get(protect, dislikeArticle);
router.route("/:id/comment").post(protect, addComment);
router.route("/:id/view").get(protect, newView);

module.exports = router;
