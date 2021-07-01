const { Op } = require("sequelize");
const { ArticleLike, Article, User, Subscription, View, Category } = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.toggleSubscribe = asyncHandler(async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return next({
      message: "You cannot to subscribe to your own channel",
      statusCode: 400,
    });
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next({
      message: `No user found for ID - '${req.params.id}'`,
      statusCode: 404,
    });
  }

  const isSubscribed = await Subscription.findOne({
    where: {
      subscriber: req.user.id,
      subscribeTo: req.params.id,
    },
  });

  if (isSubscribed) {
    await Subscription.destroy({
      where: {
        subscriber: req.user.id,
        subscribeTo: req.params.id,
      },
    });
  } else {
    await Subscription.create({
      subscriber: req.user.id,
      subscribeTo: req.params.id,
    });
  }

  res.status(200).json({ success: true, data: {} });
});

exports.getFeed = asyncHandler(async (req, res, next) => {
  const subscribedTo = await Subscription.findAll({
    where: {
      subscriber: req.user.id,
    },
  });

  const subscriptions = subscribedTo.map((sub) => sub.subscribeTo);

  const feed = await Article.findAll({
    include: {
      model: User,
      attributes: ["id", "title", "thumbnail"],
    },
    include: {
      model: User,
      attributes: ["id", "avatar", "username"],
    },
    where: {
      userId: {
        [Op.in]: subscriptions,
      },
    },
    order: [["createdAt", "DESC"]],
  });

  if (!feed.length) {
    return res.status(200).json({ success: true, data: feed });
  }

  feed.forEach(async (article, index) => {
    const views = await View.count({ where: { articleId: article.id } });
    article.setDataValue("views", views);

    if (index === feed.length - 1) {
      return res.status(200).json({ success: true, data: feed });
    }
  });
});

exports.editUser = asyncHandler(async (req, res, next) => {
  await User.update(req.body, {
    where: { id: req.user.id },
  });

  const user = await User.findByPk(req.user.id, {
    attributes: [
      "id",
      "firstname",
      "lastname",
      "username",
      "channelDescription",
      "avatar",
      "cover",
      "email",
    ],
  });

  res.status(200).json({ success: true, data: user });
});

exports.searchUser = asyncHandler(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ message: "Please enter your search term", statusCode: 400 });
  }

  const users = await User.findAll({
    attributes: ["id", "username", "avatar", "channelDescription"],
    where: {
      username: {
        [Op.substring]: req.query.searchterm,
      },
    },
  });

  if (!users.length)
    return res.status(200).json({ success: true, data: users });

  users.forEach(async (user, index) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: user.id },
    });

    const articlesCount = await Article.count({
      where: { userId: user.id },
    });

    const isSubscribed = await Subscription.findOne({
      where: {
        [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: user.id }],
      },
    });

    const isMe = req.user.id === user.id;

    user.setDataValue("subscribersCount", subscribersCount);
    user.setDataValue("articlesCount", articlesCount);
    user.setDataValue("isSubscribed", !!isSubscribed);
    user.setDataValue("isMe", isMe);

    if (index === users.length - 1) {
      return res.status(200).json({ success: true, data: users });
    }
  });
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: [
      "id",
      "firstname",
      "lastname",
      "username",
      "cover",
      "avatar",
      "email",
      "channelDescription",
    ],
  });

  if (!user) {
    return next({
      message: `No user found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  // subscribersCount, isMe, isSubscribed
  const subscribersCount = await Subscription.count({
    where: { subscribeTo: req.params.id },
  });
  user.setDataValue("subscribersCount", subscribersCount);

  const isMe = req.user.id === req.params.id;
  user.setDataValue("isMe", isMe);

  const isSubscribed = await Subscription.findOne({
    where: {
      [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: req.params.id }],
    },
  });
  user.setDataValue("isSubscribed", !!isSubscribed);

  // find the channels this user is subscribed to
  const subscriptions = await Subscription.findAll({
    where: { subscriber: req.params.id },
  });
  const channelIds = subscriptions.map((sub) => sub.subscribeTo);

  const channels = await User.findAll({
    attributes: ["id", "avatar", "username"],
    where: {
      id: { [Op.in]: channelIds },
    },
  });

  channels.forEach(async (channel) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: channel.id },
    });
    channel.setDataValue("subscribersCount", subscribersCount);
  });

  user.setDataValue("channels", channels);

  const articles = await Article.findAll({
    where: { userId: req.params.id },
    attributes: ["id", "thumbnail", "title", "createdAt"],
  });

  if (!articles.length)
    return res.status(200).json({ success: true, data: user });

  articles.forEach(async (article, index) => {
    const views = await View.count({ where: { articleId: article.id } });
    article.setDataValue("views", views);

    if (index === articles.length - 1) {
      user.setDataValue("articles", articles);
      return res.status(200).json({ success: true, data: user });
    }
  });
});

exports.recommendedArticles = asyncHandler(async (req, res, next) => {
  const articles = await Article.findAll({
    attributes: [
      "id",
      "title",
      "description",
      "thumbnail",
      "userId",
      "categoryId",
      "createdAt",
    ],
  /*  include: [{ model: Category, attributes: ["id", "title", "thumbnail"] }],*/
    include: [{ model: User, attributes: ["id", "avatar", "username"] },{ model: Category, attributes: ["id", "title", "thumbnail"] }],
    order: [["createdAt", "DESC"]],
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

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.findAll({
    attributes: [
      "id",
      "title",
      "thumbnail",
      "userId",
    ],
    include: [{ model: User, attributes: ["id", "avatar", "username"] }],
    order: [["createdAt", "DESC"]],
  });

  if (!categories.length)
    return res.status(200).json({ success: true, data: categories });

  categories.forEach(async (category, index) => {
    const views = await View.count({ where: { categoryId: category.id } });
    category.setDataValue("views", views);

    if (index === categories.length - 1) {
      return res.status(200).json({ success: true, data: categories });
    }
  });
});

exports.recommendChannels = asyncHandler(async (req, res, next) => {
  const channels = await User.findAll({
		limit: 10,
    attributes: ["id", "username", "avatar", "channelDescription"],
    where: {
      id: {
        [Op.not]: req.user.id,
      },
    },
  });

  if (!channels.length)
    return res.status(200).json({ success: true, data: channels });

  channels.forEach(async (channel, index) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: channel.id },
    });
    channel.setDataValue("subscribersCount", subscribersCount);

    const isSubscribed = await Subscription.findOne({
      where: {
        subscriber: req.user.id,
        subscribeTo: channel.id,
      },
    });

    channel.setDataValue("isSubscribed", !!isSubscribed);

    const articlesCount = await Article.count({ where: { userId: channel.id } });
    channel.setDataValue("articlesCount", articlesCount);

    if (index === channels.length - 1) {
      return res.status(200).json({ success: true, data: channels });
    }
  });
});

exports.recommendCategories = asyncHandler(async (req, res, next) => {
  const channels = await Category.findAll({
    limit: 10,
    attributes: ["id", "title", "thumbnail"],
    where: {
      id: {
        [Op.not]: req.category.id,
      },
    },
  });

  if (!channels.length)
    return res.status(200).json({ success: true, data: channels });

  channels.forEach(async (channel, index) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: channel.id },
    });
    channel.setDataValue("subscribersCount", subscribersCount);

    const isSubscribed = await Subscription.findOne({
      where: {
        subscriber: req.user.id,
        subscribeTo: channel.id,
      },
    });

    channel.setDataValue("isSubscribed", !!isSubscribed);

    const articlesCount = await Article.count({ where: { userId: channel.id } });
    channel.setDataValue("articlesCount", articlesCount);

    if (index === channels.length - 1) {
      return res.status(200).json({ success: true, data: channels });
    }
  });
});

exports.getLikedArticles = asyncHandler(async (req, res, next) => {
  return getArticles(ArticleLike, req, res, next);
});

exports.getHistory = asyncHandler(async (req, res, next) => {
  return (getArticles(View, req, res, next), getCategories(View, req, res, next))
});



const getArticles = async (model, req, res, next) => {
  const articleRelations = await model.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "ASC"]],
  });

  const articleIds = articleRelations.map((articleRelation) => articleRelation.articleId);

  const articles = await Article.findAll({
    attributes: ["id", "title", "description", "createdAt", "thumbnail", "text"],
    include: {
      model: Category,
      attributes: ["id", "title", "thumbnail"],
    },
    include: {
      model: User,
      attributes: ["id", "username", "avatar"],
    },
    where: {
      id: {
        [Op.in]: articleIds,
      },
    },
  });

  if (!articles.length) {
    return res.status(200).json({ success: true, data: articles });
  }

  articles.forEach(async (article, index) => {
    const views = await View.count({ where: { articleId: article.id } });
    article.setDataValue("views", views);

    if (index === articles.length - 1) {
      return res.status(200).json({ success: true, data: articles });
    }
  });
};

const getCategories = async (model, req, res, next) => {
  const categoryRelations = await model.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "ASC"]],
  });

  const categoryIds = categoryRelations.map((categoryRelation) => categoryRelation.categoryId);

  const categories = await Category.findAll({
    attributes: ["id", "title", "thumbnail"],
    include: {
      model: User,
      attributes: ["id", "username", "avatar"],
    },
    where: {
      id: {
        [Op.in]: categoryIds,
      },
    },
  });

  if (!categories.length) {
    return res.status(200).json({ success: true, data: categories });
  }

  categories.forEach(async (category, index) => {
    const views = await View.count({ where: { categoryId: category.id } });
    category.setDataValue("views", views);

    if (index === categories.length - 1) {
      return res.status(200).json({ success: true, data: categories });
    }
  });
};













