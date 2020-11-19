const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeBookmarksArray } = require("./bookmarks.fixtures");

describe.only("Bookmarks Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());
  before("clean the table", () => db("bookmarks").truncate());
  afterEach("cleanup", () => db("bookmarks").truncate());

  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get("/bookmarks")
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post("/bookmarks")
        .send({ title: "test-title", url: "http://some.thing.com", rating: 1 })
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = makeBookmarksArray()[1];
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: "Unauthorized request" });
    });

    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const aBookmark = makeBookmarksArray()[1];
      return supertest(app)
        .delete(`/bookmarks/${aBookmark.id}`)
        .expect(401, { error: "Unauthorized request" });
    });
  });

  describe(`GET /bookmarks`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 200 and all of the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testBookmarks);
      });
    });

    // context(`Given an XSS attack article`, () => {
    //   const { maliciousArticle, expectedArticle } = makeMaliciousArticle();

    //   beforeEach("insert malicious article", () => {
    //     return db.into("blogful_articles").insert([maliciousArticle]);
    //   });

    //   it("removes XSS attack content", () => {
    //     return supertest(app)
    //       .get(`/articles`)
    //       .expect(200)
    //       .expect((res) => {
    //         expect(res.body[0].title).to.eql(expectedArticle.title);
    //         expect(res.body[0].content).to.eql(expectedArticle.content);
    //       });
    //   });
    // });
  });

  describe(`GET /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });

    context("Given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  describe(`POST /bookmarks`, () => {
    const requiredFields = ["title", "rating", "url"];

    requiredFields.forEach((field) => {
      const newArticle = {
        title: "Test new bookmark",
        rating: 4,
        url: "http://www.testurl.com",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newArticle[field];

        return supertest(app)
          .post("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(newArticle)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it(`creates a bookmark, responding with 201 and the new bookmark`, function () {
      return supertest(app)
        .post("/bookmarks")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .send({
          title: "test-title",
          url: "https://www.test.com",
          description: "Test title",
          rating: 1,
        })
        .expect(201);
    });

    it(`responds with 400 invalid 'url' if not a valid URL`, () => {
      const newBookmarkInvalidUrl = {
        title: "test-title",
        url: "htp://invalid-url",
        rating: 1,
      };
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkInvalidUrl)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'url' must be a valid URL`);
    });

    it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
      const newBookmarkInvalidRating = {
        title: "test-title",
        url: "https://test.com",
        rating: "invalid",
      };
      return supertest(app)
        .post(`/bookmarks`)
        .send(newBookmarkInvalidRating)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'rating' must be a number between 0 and 5`);
    });
  });

  describe(`DELETE /bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .delete(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } });
      });
    });

    context("Given there are articles in the database", () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 204 and removes the bookmark", () => {
        const idToRemove = 2;
        const expectedArticles = testBookmarks.filter(
          (article) => article.id !== idToRemove
        );
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/bookmarks`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedArticles)
          );
      });
    });
  });
});
