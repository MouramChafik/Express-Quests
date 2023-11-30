const request = require("supertest");
const database = require("../database");
afterAll(() => database.end());

const app = require("../src/app");

describe("GET /api/movies", () => {
  it("should return all movies", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/movies/:id", () => {
  it("should return one movie", async () => {
    const response = await request(app).get("/api/movies/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no movie", async () => {
    const response = await request(app).get("/api/movies/0");

    expect(response.status).toEqual(404);
  });
});

//test le route post movies
describe("POST /api/movies", () => {
  it("should return created movie", async () => {
    const newMovie = {
      title: "Star Wars",
      director: "George Lucas",
      year: "1977",
      color: "1",
      duration: 120,
    };

    const response = await request(app).post("/api/movies").send(newMovie);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM movies WHERE id=?",
      response.body.id
    );

    const [movieInDatabase] = result;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(movieInDatabase.title).toStrictEqual(newMovie.title);

    expect(movieInDatabase).toHaveProperty("director");
    expect(movieInDatabase.director).toStrictEqual(newMovie.director);

    expect(movieInDatabase).toHaveProperty("year");
    expect(movieInDatabase.year).toStrictEqual(newMovie.year);

    expect(movieInDatabase).toHaveProperty("color");
    expect(movieInDatabase.color).toStrictEqual(newMovie.color);

    expect(movieInDatabase).toHaveProperty("duration");
    expect(movieInDatabase.duration).toStrictEqual(newMovie.duration);
  });

  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .post("/api/movies")
      .send(movieWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

//test la route PUT

describe("PUT /api/movies/:id", () => {
  it("should edit a movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2010",
      color: "1",
      duration: 162,
    };

    const [insertResult] = await database.query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [
        newMovie.title,
        newMovie.director,
        newMovie.year,
        newMovie.color,
        newMovie.duration,
      ]
    );

    const id = insertResult.insertId;

    const updatedMovie = {
      title: "Wild is Life",
      director: "Alan Smithee",
      year: "2023",
      color: "0",
      duration: 120,
    };

    const response = await request(app)
      .put(`/api/movies/${id}`)
      .send(updatedMovie);

    expect(response.status).toEqual(204);

    const [selectResult] = await database.query("SELECT * FROM movies WHERE id=?", [id]);

    const [movieInDatabase] = selectResult;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(movieInDatabase.title).toEqual(updatedMovie.title);

    expect(movieInDatabase).toHaveProperty("director");
    expect(movieInDatabase.director).toEqual(updatedMovie.director);

    expect(movieInDatabase).toHaveProperty("year");
    expect(movieInDatabase.year).toEqual(updatedMovie.year);

    expect(movieInDatabase).toHaveProperty("color");
    expect(movieInDatabase.color).toEqual(updatedMovie.color);

    expect(movieInDatabase).toHaveProperty("duration");
    expect(movieInDatabase.duration).toEqual(updatedMovie.duration);
  });

  it("should return an error if required properties are missing", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .put(`/api/movies/1`)
      .send(movieWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return a 404 if trying to update a non-existent movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2009",
      color: "1",
      duration: 162,
    };

    const response = await request(app).put("/api/movies/0").send(newMovie);

    expect(response.status).toEqual(404);
  });
});


//test Delete route 

describe("DELETE /api/movies/:id", () => {
  it("should delete a movie", async () => {
    const newMovie = {
      title: "Dark and light",
      director: "James Wild",
      year: "2023",
      color: false,
      duration: 140,
    };

    const [insertResult] = await database.query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [
        newMovie.title,
        newMovie.director,
        newMovie.year,
        newMovie.color,
        newMovie.duration,
      ]
    );

    const movieIdToDelete = insertResult.insertId; 

    const response = await request(app).delete(`/api/movies/${movieIdToDelete}`);

    expect(response.status).toEqual(204); 

    const [selectResult] = await database.query("SELECT * FROM movies WHERE id=?", [
      movieIdToDelete,
    ]);

    expect(selectResult.length).toEqual(0);
  });

  it("should return a 404 if trying to delete a non-existent movie ", async () => {
    const response = await request(app).delete(`/api/movies/0`);

    expect(response.status).toEqual(404); 
  });
});
