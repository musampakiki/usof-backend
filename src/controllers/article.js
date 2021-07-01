const { Op } = require("sequelize");
const {
  User,
  Category,
  Article,
  ArticleLike,
  Comment,
  View,
  Subscription,
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.newArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.create({
    ...req.body,
    userId: req.user.id,
   /* categoryId: req.category.id,*/
  });

  res.status(200).json({ success: true, data: article });
});

exports.getArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findByPk(req.params.id, {
    include: [
      {
        model: User,
        attributes: ["id", "username", "avatar"],
      },
      {
        model: Category,
        attributes: ["id", "title", "thumbnail"],
      },
    ],
  });

  if (!article) {
    return next({
      message: `No article found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comments = await article.getComments({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "text", "createdAt"],
    include: [
      {
        model: User,
        attributes: ["id", "username", "avatar"],
      },
    ],
  });

  const isLiked = await ArticleLike.findOne({
    where: {
      [Op.and]: [
        { articleId: req.params.id },
        { userId: req.user.id },
        { like: 1 },
      ],
    },
  });

  const isDisliked = await ArticleLike.findOne({
    where: {
      [Op.and]: [
        { articleId: req.params.id },
        { userId: req.user.id },
        { like: -1 },
      ],
    },
  });

  const commentsCount = await Comment.count({
    where: {
      articleId: req.params.id,
    },
  });

  const likesCount = await ArticleLike.count({
    where: {
      [Op.and]: [{ articleId: req.params.id }, { like: 1 }],
    },
  });

  const dislikesCount = await ArticleLike.count({
    where: {
      [Op.and]: [{ articleId: req.params.id }, { like: -1 }],
    },
  });

  const views = await View.count({
    where: {
      articleId: req.params.id,
    },
  });

  const isSubscribed = await Subscription.findOne({
    where: {
      subscriber: req.user.id,
      subscribeTo: article.userId,
    },
  });

  const isViewed = await View.findOne({
    where: {
      userId: req.user.id,
      articleId: article.id,
    },
  });

  const subscribersCount = await Subscription.count({
    where: { subscribeTo: article.userId },
  });

  const isArticleMine = req.user.id === article.userId;

  // likesCount, disLikesCount, views
  article.setDataValue("comments", comments);
  article.setDataValue("commentsCount", commentsCount);
  article.setDataValue("isLiked", !!isLiked);
  article.setDataValue("isDisliked", !!isDisliked);
  article.setDataValue("likesCount", likesCount);
  article.setDataValue("dislikesCount", dislikesCount);
  article.setDataValue("views", views);
  article.setDataValue("isArticleMine", isArticleMine);
  article.setDataValue("isSubscribed", !!isSubscribed);
  article.setDataValue("isViewed", !!isViewed);
  article.setDataValue("subscribersCount", subscribersCount);

  res.status(200).json({ success: true, data: article });
});

exports.likeArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findByPk(req.params.id);

  if (!article) {
    return next({
      message: `No article found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const liked = await ArticleLike.findOne({
    where: {
      userId: req.user.id,
      articleId: req.params.id,
      like: 1,
    },
  });

  const disliked = await ArticleLike.findOne({
    where: {
      userId: req.user.id,
      articleId: req.params.id,
      like: -1,
    },
  });

  if (liked) {
    await liked.destroy();
  } else if (disliked) {
    disliked.like = 1;
    await disliked.save();
  } else {
    await ArticleLike.create({
      userId: req.user.id,
      articleId: req.params.id,
      like: 1,
    });
  }

  res.json({ success: true, data: {} });
});

exports.dislikeArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findByPk(req.params.id);

  if (!article) {
    return next({
      message: `No article found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const liked = await ArticleLike.findOne({
    where: {
      userId: req.user.id,
      articleId: req.params.id,
      like: 1,
    },
  });

  const disliked = await ArticleLike.findOne({
    where: {
      userId: req.user.id,
      articleId: req.params.id,
      like: -1,
    },
  });

  if (disliked) {
    await disliked.destroy();
  } else if (liked) {
    liked.like = -1;
    await liked.save();
  } else {
    await ArticleLike.create({
      userId: req.user.id,
      articleId: req.params.id,
      like: -1,
    });
  }

  res.json({ success: true, data: {} });
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const article = await Article.findByPk(req.params.id);

  if (!article) {
    return next({
      message: `No article found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.create({
    text: req.body.text,
    userId: req.user.id,
    articleId: req.params.id,
  });

  const User = {
    id: req.user.id,
    avatar: req.user.avatar,
    username: req.user.username,
  };

  comment.setDataValue("User", User);

  res.status(200).json({ success: true, data: comment });
});

exports.newView = asyncHandler(async (req, res, next) => {
  const article = await Article.findByPk(req.params.id);

  if (!article) {
    return next({
      message: `No article found for ID - ${req.params.id}`,
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
    return next({ message: "You already viewed this article", statusCode: 400 });
  }

  await View.create({
    userId: req.user.id,
    articleId: req.params.id,
  });

  res.status(200).json({ success: true, data: {} });
});

exports.searchArticle = asyncHandler(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ message: "Please enter the searchterm", statusCode: 400 });
  }

  const articles = await Article.findAll({
    include: { model: User, attributes: ["id", "avatar", "username"] },
    include: { model: Category, attributes: ["id", "title", "thumbnail"] },
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: req.query.searchterm,
        },
        description: {
          [Op.substring]: req.query.searchterm,
        },
      },
    },
  });

  if (!articles.length)
    return res.status(200).json({ success: true, data: articles });

  articles.forEach(async (article, index) => {
    const views = await View.count({ where: { articleId: article.id } });
    article.setDataValue("views", views);

    if (index === articles.length - 1) {
      return res.status(200).json({ success: true, data: articles });
    }
  });
});
