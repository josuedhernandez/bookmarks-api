# About the API
Build an API for the Bookmarks client supporting GET, POST and DELETE.

# Stack
Node.js, Express

# Requirements for API
* Use the boilerplate to start a new application named bookmarks-server
* Configure logging and API key handling middleware on the server
* Write a route handler for the endpoint GET /bookmarks that returns a list of bookmarks
* Write a route handler for the endpoint GET /bookmarks/:id that returns a single bookmark with the given ID, return 404 Not Found if the ID is not valid
* Write a route handler for POST /bookmarks that accepts a JSON object representing a bookmark and adds it to the list of bookmarks after validation.
* Write a route handler for the endpoint DELETE /bookmarks/:id that deletes the bookmark with the given ID.
* This assignment should take about 2 hours to complete. If you're having trouble, attend a Q&A session or reach out on Slack for help.

# Requirements for API Using Database
* Make two new databases, bookmarks and bookmarks-test commands:
    * createdb -U dunder_mifflin bookmarks
    * createdb -U dunder_mifflin bookmarks-test
* Write the first migration inside the bookmarks-server project that creates the table for bookmarks. Then use the migration to create the tables in both new databases.
    * npm i postgrator-cli@3.2.0 -D
    * npm i pg
* The table should contain fields for id, title, url, description and rating
* The description is the only optional field
* Choose suitable data types for each column
* Refactor the GET /bookmarks endpoint and tests. The endpoint should use the database tables.
* You'll need to wire up Knex into your server and tests.
* Write a BookmarksService object in the bookmarks-server project that will support CRUD for bookmarks using Knex.
* You should use fixtures in your tests for the GET /bookmarks and GET /bookmarks/:bookmark_id
* Write tests for how each endpoint behaves when the database is empty
* Write seeding scripts to insert dummy bookmarks into the database tables so you can check that the refactored endpoints work when your server is running locally