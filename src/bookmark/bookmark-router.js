const express = require("express");

const { v4: uuid } = require("uuid");
const data = require("../bookmarks-data");
const { isWebUri } = require('valid-url')
const logger = require("../logger");
const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(data.bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, description, rating, url } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("'title' is required");
    }
    // Originally defined every field to be required.
    // Refactored code applying TDD
    // if (!description) {
    //   logger.error(`Description is required`);
    //   return res.status(400).send("Invalid data");
    // }

    if (!rating) {
      logger.error(`Rating is required`);
      return res.status(400).send(`'rating' is required`);
    } else if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
      logger.error(`'Rating' must be a number between 0 and 5`);
      return res.status(400).send("'rating' must be a number between 0 and 5");
    }

    if(!url){
        logger.error(`Rating is required`);
        return res.status(400).send(`'url' is required`);
    }
    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`'url' must be a valid URL`)
    }
    // get an id
    const id = uuid();

    const bookmark = {
      id,
      title,
      description,
      rating,
      url,
    };

    data.bookmarks.push(bookmark);
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
    const bookmark = data.bookmarks.find((b) => b.id == id);

    // make sure we found a bookmark
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = data.bookmarks.findIndex((b) => b.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }
    data.bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Bookmark with id ${id} deleted.`);

    res.status(204).end();
  });

module.exports = bookmarkRouter;
