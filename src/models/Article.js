const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Article", {
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
        description: {
            type: DataTypes.STRING,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING,
            defaultValue:
                "https://packagecontrol.io/readmes/img/e9492f0f82721e4998b1360e409e6fe8affc30bb.png",
        },
    });
};
