const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Order = require("../models/order");
const Returned = require("../models/returned");
const path = require("path");
const express = require("express");
const cron = require("node-cron");
const { log } = require("console");

exports.getOrderPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "public", "views", "library.html"));
};

exports.postOrderData = (req, res, next) => {
  const d = new Date();
  const book = {
    name: req.body.name,
    bookedAt: d,
    returnAt: new Date(d.getTime() + 60 * 60 * 1000),
    fine: 0,
  };

  console.log(book);

  Order.create({
    name: book.name,
    bookedAt: book.bookedAt,
    returnAt: book.returnAt,
    fine: book.fine,
  })
    .then(() => {
      //   res.send("Book Created Successfully!");

      // Schedule a cron job to update fines every hour
      const updateFineJob = cron.schedule("0 * * * *", async () => {
        console.log("Running cron job to update fines...");

        try {
          // Fetch all orders where returnAt is less than current time (overdue)
          const overdueOrders = await Order.findAll({
            where: {
              returnAt: {
                [Op.lt]: new Date(), // Less than current time
              },
            },
          });

          for (const order of overdueOrders) {
            const updatedFine = calculateFine(order.bookedAt, order.returnAt);

            // Update fine for overdue orders
            await Order.update(
              { fine: updatedFine },
              { where: { id: order.id } }
            );
            console.log(`Updated fine for order ${order.id}: ${updatedFine}`);
          }
        } catch (err) {
          console.error("Error updating fines:", err);
        }
      });

      updateFineJob.start();
    })
    .catch((err) => console.log(err));
  res.redirect("/");
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({ allOrders: orders });
  } catch (error) {
    console.log("Get orders failings", JSON.stringify(error));
    res.status(500).json({ error: error });
  }
};

exports.getReturnedOrders = async (req, res) => {
  try {
    const orders = await Returned.findAll();
    res.status(200).json({ allOrders: orders });
  } catch (error) {
    console.log("Get orders failings", JSON.stringify(error));
    res.status(500).json({ error: error });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(orderId);
    await Order.destroy({ where: { id: orderId } });
    res.status(200);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.postReturnData = async (req, res, next) => {
  try {
    const returned = {
      name: req.body.name,
      fine: req.body.fine,
      returnAt: new Date(),
    };
    console.log(returned);

    Returned.create({
      name: returned.name,
      fine: returned.fine,
      returnAt: returned.returnAt,
    })
      .then(() => {
        console.log("Returned books saved");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

function calculateFine(bookedAt, returnAt) {
  const now = new Date();
  // Convert timestamps to UTC objects
  const bookedTime = new Date(bookedAt);
  const returnTime = new Date(returnAt + "Z");
  // Calculate difference in milliseconds in UTC
  const diffInMs = now.getTime() - returnTime.getTime();
  // Convert milliseconds to hours (rounded up)
  const overdueHours = Math.ceil(diffInMs / (1000 * 60 * 60));
  // Fine calculation (10 per hour)
  const fine = overdueHours * 10;

  return fine;
}
