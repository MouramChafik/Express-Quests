const request = require("supertest");


const database = require("../database");
afterAll(() => database.end());

const app = require("../src/app");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});


//test le route post users
const crypto = require("node:crypto");

describe("POST /api/users", () => {
  it("should return created user", async () => {
   const newUser = {
    firstname: "Marie",
    lastname: "Martin",
    email: `${crypto.randomUUID()}@wild.co`,
    city: "Paris",
    language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(newUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(newUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(newUser.city);

  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Massimo" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});


//test la route PUT

describe("PUT /api/users/:id", () => {
  it("should edit a user", async () => {
    const newUser = {
      firstname: "David",
      lastname: "Cameron",
      email: "exemple@wild.com",
      city: "Lyon",
      language: "french",
    };

    const [insertResult] = await database.query(
      "INSERT INTO users (firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = insertResult.insertId;

    const updatedUser = {
      firstname: "Luca",
      lastname: "Updated",
      email: "updated@wild.me",
      city: "Nice",
      language: "Spanish",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(204);

    const [selectResult] = await database.query("SELECT * FROM users WHERE id=?", [id]);

    const [userInDatabase] = selectResult;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toEqual(updatedUser.language);
  });

  it("should return an error if required properties are missing", async () => {
    const userWithMissingProps = { firstname: "Harry Potter" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return a 404 if trying to update a non-existent user", async () => {
    const newUser = {
      firstname: "Avatar",
      lastname: "James Cameron",
      email: "2009",
      city: "1",
      language: 162,
    };

    const response = await request(app).put("/api/movies/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});
