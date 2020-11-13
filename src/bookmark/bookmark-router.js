const express = require("express");

const { v4: uuid } = require("uuid");
const bookmarks = require("../bookmarks-data");
const logger = require("../logger");
const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, description, ranking, url } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    if (!description) {
      logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
      436;
    }
    if (!ranking) {
      logger.error(`Ranking is required`);
      return res.status(400).send("Invalid data");
    } else if (ranking && (isNaN(ranking) || ranking < 1 || ranking > 5)) {
      logger.error(`Ranking must be between 1 and 5`);
      return res.status(400).send("Invalid data");
    }
    if (!url) {
      logger.error(`Url is required`);
      return res.status(400).send("Invalid data");
    }
    // get an id
    const id = uuid();

    const bookmark = {
      id,
      title,
      description,
      ranking,
      url,
    };

    bookmarks.push(bookmark);
    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

bookmarkRouter
  .route("/bookmarks/:id")
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find((b) => b.id == id);

    // make sure we found a bookmark
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex((b) => b.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Not found");
    }
    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Bookmark with id ${id} deleted.`);

    res.status(204).end();
  });

module.exports = bookmarkRouter;
