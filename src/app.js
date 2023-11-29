require("dotenv").config();
const express = require("express");


const app = express();

app.use(express.json());


const movieControllers = require("./controllers/movieControllers");
const usersControllers = require("./controllers/usersControllers");

const validateMovie = require("./middlewares/validateMovie");
const validateUser = require("./middlewares/validateUser")

app.get("/api/movies", movieControllers.getMovies);
app.get("/api/movies/:id", movieControllers.getMovieById);
app.get("/api/users", usersControllers.getUsers);
app.get("/api/users/:id", usersControllers.getUserById);

app.post("/api/movies", validateMovie, movieControllers.postMovie);
app.post("/api/users", validateUser, usersControllers.postUsers);

app.put("/api/movies/:id", movieControllers.updateMovie);
app.put("/api/users/:id", usersControllers.updateUsers);

app.delete("/api/movies/:id", movieControllers.deleteMovie);
app.delete("/api/users/:id", usersControllers.deleteUser);


module.exports = app;
