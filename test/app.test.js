const app = require("../src/app");

describe("App Bookmarks API", () => {
  it("GET /bookmarks should require authorization", () => {
    return supertest(app)
      .get("/bookmarks")
      .expect(401, { error: "Unauthorized request" });
  });

  it("GET /bookmarks should should respond with an array", () => {
    const apiToken = process.env.API_TOKEN;
    return supertest(app)
      .get("/bookmarks")
      .set("Authorization", "bearer " + apiToken)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) =>
        // Better way to do this. Should response be rearange?
        expect(res.body[0]).to.have.all.keys(
          "id",
          "title",
          "description",
          "ranking",
          "url"
        )
      );
  });
});
