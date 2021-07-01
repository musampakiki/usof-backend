const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING,
            defaultValue:
                "https://johanbostrom.se/blog/the-best-image-placeholder-services-on-the-web/placeholder_image_hu7f2c31cb17c6b91aa8599714a1cd3d05_165876_1010x510_fit_box_2.png",
        },
    });
}