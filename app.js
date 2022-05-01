const express = require("express");
const res = require("express/lib/response");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    message: "welcome to api",
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "thesecretkey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "post created . . .",
        authData, 
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  //mock user
  const user = {
    id: 1,
    username: "moha",
    email: "moha@gmail.com",
  };

  jwt.sign({ user }, "thesecretkey", (err, token) => {
    res.json({
      token,
    });
  });
});

function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.header("Authorization");
  // check if undefined
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    //get token from array
    const bearerToken = bearer[1];
    //set the token
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(5000, console.log("started on 5000!!!!!"));
