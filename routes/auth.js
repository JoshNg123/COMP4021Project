const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
  return /^\w+$/.test(text);
}

// Handle the /register endpoint
router.post("/register", (req, res) => {
  // Get the JSON data from the body
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync("data/users.json"));

  if (!containWordCharsOnly(username)) {
    res.json({ status: "error", error: "Invalid username." });
    return;
  }

  if (users[username]) {
    res.json({ status: "error", error: "Username already exists." });
    return;
  }

  if (!username || !password) {
    res.json({ status: "error", error: "Missing data." });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const victories = 0;
  users[username] = { hash, victories };

  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));

  res.json({ status: "success" });
});

// Handle the /signin endpoint
router.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync("data/users.json"));

  if (!users[username]) {
    res.json({ status: "error", error: "Username does not exist." });
    return;
  }

  if (!bcrypt.compareSync(password, users[username].hash)) {
    res.json({ status: "error", error: "Invalid password." });
    return;
  }

  const { name } = users[username];
  req.session.user = { username };

  res.json({
    status: "success",
    user: { username: username },
  });
});

// Handle the /validate endpoint
router.get("/validate", (req, res) => {
  if (!req.session.user) {
    res.json({ status: "error", error: "User is not logged in." });
    return;
  }

  res.json({ status: "success", user: req.session.user });
});

// Handle the /signout endpoint
router.get("/signout", (req, res) => {
  //
  // Deleting req.session.user
  //
  delete req.session.user;

  //
  // Sending a success response
  //
  res.json({ status: "success" });
});

module.exports = router;