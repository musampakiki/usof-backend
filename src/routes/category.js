const express = require("express");
const router = express.Router();
const { getCategories, recommendCategories } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

const {
    newCategory,
    getCategory,
    newView,
    searchCategory,
} = require("../controllers/category");

router.route("/").post(protect, newCategory);
router.route("/search").get(protect, searchCategory);
router.route("/").get(protect, getCategories);
router.route("/").get(protect, recommendCategories);
router.route("/:id").get(protect, getCategory);
router.route("/:id/view").get(protect, newView);

module.exports = router;
