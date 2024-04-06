const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

usersRouter.post("/", async (req, res, next) => {
  const { username, name, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const savedUsers = await User.find({}).populate('notes', {content: 1, important: 1});
    res.status(200).json(savedUsers);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;

/*
  for users we used 
  test-driven development (TDD),
  where tests for new functionality are written before the functionality is implemented

*/
