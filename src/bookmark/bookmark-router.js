const path = require("path");
const express = require("express");
const data = require("../bookmarks-data");
const { isWebUri } = require("valid-url");
const logger = require("../logger");
const bookmarkRouter = express.Router();
const xss = require("xss");
const bodyParser = express.json();
const BookmarksService = require("../bookmarks-service");

const serializeBookmark = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: bookmark.rating,
});

bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    BookmarksService.getAllBookmarks(knexInstance)
      .then((bookmarks) => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { title, description, rating, url } = req.body;
    const requirements = { title, rating, url };
    const newBookmark = { title, description, rating, url };

    for (const [key, value] of Object.entries(requirements)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
      logger.error(`'Rating' must be a number between 0 and 5`);
      return res.status(400).send("'rating' must be a number between 0 and 5");
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send(`'url' must be a valid URL`);
    }

    BookmarksService.insertBookmark(req.app.get("db"), newBookmark)
      .then((bookmark) => {
        logger.info(`Bookmark with id ${bookmark.id} created`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });

bookmarkRouter
  .route("/bookmarks/:bookmark_id")
  .all((req, res, next) => {
    BookmarksService.getById(req.app.get("db"), req.params.bookmark_id)
      .then((bookmark) => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` },
          });
        }
        res.bookmark = bookmark; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  // Why not using next here but we are using it in .delete
  // Is .all always running?
  .get((req, res, next) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req, res, next) => {
    BookmarksService.deleteBookmark(req.app.get("db"), req.params.bookmark_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, description, url, rating } = req.body;
    const requirements = { title, rating, url };
    const bookmarkToUpdate = { title, description, rating, url };

    const numberOfValues = Object.values(requirements).filter(Boolean)
      .length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'url' or 'rating'`,
        },
      });
    }

    BookmarksService.updateBookmark(
      req.app.get("db"),
      req.params.bookmark_id,
      bookmarkToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarkRouter;
