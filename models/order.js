const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Order = sequelize.define("books", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  bookedAt: Sequelize.DATE,
  returnAt: Sequelize.DATE,
  fine: Sequelize.INTEGER,
});

module.exports = Order;
