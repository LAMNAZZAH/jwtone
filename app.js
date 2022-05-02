const express = require("express");
const res = require("express/lib/response");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { hash } = require("bcrypt");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const users = [];

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

//! verifythereistoken && verifyisAdmin && verify

app.get("/api/dashboard", verifyToken, (req, res, next) => {
  jwt.verify(req.token, "thesecretkey", (err, userAuthData) => {
    if (err) {
      res.status(403).send(`
      <a href='/api/register'>Register</a>
      <a href='/api/login'>Login</a>
      `);
    } else {
      const data = JSON.stringify(userAuthData);

      if (userAuthData.acctype === "admin") {
        res.send(`
            <h1>DASHBOARD</h1>
            <h2>sensitive information!!</h2>
            <h3>information: ${data}</h3>
            <a href='/api/register'>Register</a>
            <a href='/api/login'>Login</a>
            `);
      } else {
        res.send(`
            <h1>DASHBOARD</h1>
            <h2>You are not allowed, upgrade account to teacher please!</h2>
            <a href='/api/register'>Register</a>
            <a href='/api/login'>Login</a>
            `);
      }
    }
  });
});

app.get("/api/login", (req, res, next) => {
  res.send(`
    <h1>The Application</h1>
    <hr/>
    <h2>Login:</h2>
    <form method='POST' action='/api/login'>
    <input type='text' name='name' placeholder='name' required>
    <br/>
    <br/>
    <input type='password' name='password' placeholder='password' required>
    <br/>
    <br/>
    <input type='submit'>
    </form>
    <a href='/api/register'>Register</a>
    <a href='/api/dashboard'>dashboard</a>
    `);
});

app.post("/api/login", async (req, res) => {
  //mock user
  const user = users.find((user) => (user.name = req.body.name));
  if (user == null) {
    return res.status(400).send(`invalid information for existing user!`);
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      jwt.sign(
        { name: user.name, acctype: user.acctype },
        "thesecretkey",
        { expiresIn: "180s" },
        (err, token) => {
          res.json({
            token,
          });
          console.log(token);
        }
      );
      //res.redirect("/api/dashboard");
    } else {
      res.send(`incorrect password!!`);
    }
  } catch {
    res.status(500).send("there is an error loggin in!");
  }
  //
});

app.get("/api/register", (req, res, next) => {
  res.send(`
    <h1>The Application</h1>
    <hr/>
    <h2>Register:</h2>
    <form method='POST' action='/api/register'>
    <input type='text' name='name' placeholder='name' required>
    <br/>
    <br/>
    <input type='password' name='password' placeholder='password' required>
    <br/>
    <br/>
    <select name='acctype'>
    <option value='teacher'>teacher</option>
    <option value='student'>student</option>
    </select>
    <br/>
    <br/>
    <input type='submit'>
    </form>
    <a href='/api/dashboard'>dashboard</a>
    <a href='/api/login'>Login</a>
    `);
});

app.post("/api/register", async (req, res, next) => {
  if (req.body.name && req.body.password && req.body.acctype) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const user = {
      name: req.body.name,
      password: hashedPass,
      acctype: req.body.acctype,
    };
    users.push(user);
    console.log(users);
    res.redirect("/api/login");
  } else {
    res.status(500).send(`there is an error! retry please`);
  }
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
    res.status(403).send(`
        <h2>access token is missing!</h2>
      <a href='/api/register'>Register</a>
      <a href='/api/login'>Login</a>
      `);
  }
}

/*
async function checkUser(name, password) {
    //? fetch user from DB 
    const user = users.find(user => name = user.name);
    const match = await bcrypt.compare(password, user.password);

    if(match) {
        jwt.sign(
            { user },
            "thesecretkey",
            { expiresIn: "180s" },
            (err, token) => {
              res.json({
                token,
              });
              console.log(token);
            }
          );
    }
    return res.send(`Incorrect Information!!`);
}
*/

app.listen(5000, console.log("started on 5000!!!!!"));
