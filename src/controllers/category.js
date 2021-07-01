const { Op } = require("sequelize");
const {
    User,
    Article,
    Category,
    View,
    Subscription,
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.newCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.create({
        ...req.body,
        userId: req.user.id,
    });

    res.status(200).json({ success: true, data: category });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id, {
        include: [
            {
                model: User,
                attributes: ["id", "username", "avatar"],
            },
        ],
    });

    if (!category) {
        return next({
            message: `No category found for ID - ${req.params.id}`,
            statusCode: 404,
        });
    }

    const articles = await category.getArticles({
        order: [["createdAt", "DESC"]],
        attributes: ["id", "title", "createdAt"],
        include: [
            {
                model: User,
                attributes: ["id", "username", "avatar"],
            },
        ],
    });

    const articlesCount = await Article.count({
        where: {
            categoryId: req.params.id,
        },
    });

    const views = await View.count({
        where: {
            categoryId: req.params.id,
        },
    });

    const isSubscribed = await Subscription.findOne({
        where: {
            subscriber: req.user.id,
            subscribeTo: category.userId,
        },
    });

    const isViewed = await View.findOne({
        where: {
            userId: req.user.id,
            categoryId: category.id,
        },
    });

    const subscribersCount = await Subscription.count({
        where: { subscribeTo: category.userId },
    });

    const isCategoryMine = req.user.id === category.userId;

    // likesCount, disLikesCount, views
    category.setDataValue("articles", articles);
    category.setDataValue("articlesCount", articlesCount);

    category.setDataValue("views", views);
    category.setDataValue("isCategoryMine", isCategoryMine);
    category.setDataValue("isSubscribed", !!isSubscribed);
    category.setDataValue("isViewed", !!isViewed);
    category.setDataValue("subscribersCount", subscribersCount);

    res.status(200).json({ success: true, data: category });
});


exports.newView = asyncHandler(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
        return next({
            message: `No category found for ID - ${req.params.id}`,
            statusCode: 404,
        });
    }

    const viewed = await View.findOne({
        where: {
            userId: req.user.id,
            articleId: req.params.id,
        },
    });

    if (viewed) {
        return next({ message: "You already viewed this category", statusCode: 400 });
    }

    await View.create({
        userId: req.user.id,
        articleId: req.params.id,
    });

    res.status(200).json({ success: true, data: {} });
});

exports.searchCategory = asyncHandler(async (req, res, next) => {
    if (!req.query.searchterm) {
        return next({ message: "Please enter the searchterm", statusCode: 400 });
    }

    const categories = await Category.findAll({
        include: { model: User, attributes: ["id", "avatar", "username"] },
        where: {
            [Op.or]: {
                title: {
                    [Op.substring]: req.query.searchterm,
                },
            },
        },
    });

    if (!categories.length)
        return res.status(200).json({ success: true, data: categories });

    categories.forEach(async (article, index) => {
        const views = await View.count({ where: { articleId: article.id } });
        article.setDataValue("views", views);

        if (index === categories.length - 1) {
            return res.status(200).json({ success: true, data: categories });
        }
    });
});
