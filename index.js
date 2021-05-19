var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { verify } = require("jsonwebtoken");

const port = 5000;

app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var con = mysql.createConnection({
  host: "freedb.tech",
  user: "freedbtech_Hans",
  database: "freedbtech_Koempro",
  password: "Sumiyati81",
});

app.get("/", (req, res) => {
  res.send("Tester");
});

// Token Authentication =================================================
const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "koemprointekid");

    if (validToken) {
      return next();
    }
  } catch (error) {
    return res.json({
      error: "Don't Have Access Token, Please Sign in Again!",
    });
  }
};

// Registration ==========================
app.post("/auth/regist", (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    con.query(
      "INSERT INTO Users (username, password) VALUES (?,?)",
      [username, hash],
      (error, result) => {
        if (error) console.log(error);
        else {
          res.json({ message: "Success Registered!" });
        }
      }
    );
  });
});

// Login ======================================
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  con.query("SELECT * FROM Users WHERE username=?", username, (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (err, response) => {
        if (response) {
          const id = result[0].id;
          const token = jwt.sign({ id }, "koemprointekid");

          res.json(token);
        } else {
          res.json({
            auth: false,
            message: "Wrong username/password combination",
          });
        }
      });
    } else {
      res.json({ auth: false, message: "No user exists!" });
    }
  });
});

// Posts =================================================
// get ======================================
app.get("/posts", (req, res) => {
  con.query("select * from Posts", (error, rows, fields) => {
    if (error) console.log(error);
    else {
      res.send(rows);
    }
  });
});

// find by id ==============================
app.get("/posts/:id", validateToken, (req, res) => {
  con.query(
    "SELECT * FROM Posts where id=? ",
    req.params.id,
    (error, rows, fields) => {
      if (error) console.log(error);
      else {
        console.log(rows);
        res.send(JSON.stringify(rows));
      }
    }
  );
});

// Posts ====================================
app.post("/posts", validateToken, (req, res) => {
  con.query("insert into Posts set ? ", req.body, (error, rows, fields) => {
    if (error) console.log(error);
    else {
      console.log(rows);
      res.send(JSON.stringify(rows));
      res.json(rows);
    }
  });
});

// Update Process =================================
app.put("/posts/:id", validateToken, (req, res) => {
  const id = req.params.id;
  con.query("UPDATE Posts SET ? WHERE id=?", [req.body, id], (error, rows) => {
    if (error) console.log(error);
    else {
      res.send(JSON.stringify(rows));
      // res.send(`Posts with the title: ${title} has been added`);
    }
  });
});

// Delete =================================
app.delete("/posts/:id", validateToken, (req, res) => {
  console.log("Params" + req.params.id);
  con.query(
    "DELETE FROM Posts where id=? ",
    req.params.id,
    (error, rows, fields) => {
      if (error) console.log(error);
      else {
        console.log(rows);
        res.send("Succes Delete");
      }
    }
  );
});

// Members =================================================
// Get ==============================
app.get("/members", (req, res) => {
  con.query("select * from Members", (error, rows, fields) => {
    if (error) console.log(error);
    else {
      res.send(rows);
    }
  });
});

// find by id ==============================
app.get("/members/:id", validateToken, (req, res) => {
  con.query(
    "SELECT * FROM Members where id=? ",
    req.params.id,
    (error, rows, fields) => {
      if (error) console.log(error);
      else {
        console.log(rows);
        res.send(JSON.stringify(rows));
      }
    }
  );
});

// Posts ====================================
app.post("/members", validateToken, (req, res) => {
  con.query("insert into Members set ? ", req.body, (error, rows, fields) => {
    if (error) console.log(error);
    else {
      console.log(rows);
      res.send(JSON.stringify(rows));
    }
  });
});

// Update Process =================================
app.put("/members/:id", validateToken, (req, res) => {
  const id = req.params.id;
  con.query(
    "UPDATE Members SET ? WHERE id=?",
    [req.body, id],
    (error, rows) => {
      if (error) console.log(error);
      else {
        res.send(JSON.stringify(rows));
        // res.send(`Posts with the title: ${title} has been added`);
      }
    }
  );
});

// Delete =================================
app.delete("/members/:id", validateToken, (req, res) => {
  console.log("Params" + req.params.id);
  con.query(
    "DELETE FROM Members where id=? ",
    req.params.id,
    (error, rows, fields) => {
      if (error) console.log(error);
      else {
        console.log(rows);
        res.send("Succes Delete");
      }
    }
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
