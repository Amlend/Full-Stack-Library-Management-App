const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Returned = sequelize.define("returned", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  fine: Sequelize.INTEGER,
  returnAt: Sequelize.DATE,
});

module.exports = Returned;
