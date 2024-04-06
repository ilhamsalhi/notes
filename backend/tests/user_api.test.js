const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const app = require("../app");
const assert = require("node:assert");

const api = supertest(app);
const { usersInDb} = require("./test_helper");

beforeEach(async () => {
  try {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  } catch (error) {}
});

after(async () => {
  await mongoose.connection.close();
});

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();
    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails ith proper status code and message if username already taken", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "root",
      name: "superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    console.log(result.body);
    assert(result.body.error.includes("expected `username` to be unique"));
  });

  test("all users in the database are returned", async () => {
    const result = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const users = result.body.map((u) => u.username);
    assert(users.includes("root"));
  });
});

// test using promise chaining

// test('creation succeeds with a fresh username', () => {
//   console.log('test started');

//   let usersAtStart;
//   let usersAtEnd;
//   const newUser = {
//     username: 'mluukkai',
//     name: 'Matti Luukkainen',
//     password: 'salainen',
//   };

//     notesInDb()
//     .then((users) => {
//       usersAtStart = users;
//     })
//     .then((_) => {
//       return api
//       .post('/api/users')
//       .send(newUser)
//       .expect(201)
//       .expect('Content-Type', /application\/json/);
//     })
//     .then((_) => {
//       return usersInDb();
//     })
//     .then((usersAtEnd) => {
//       assert(usersAtStart.length, usersAtEnd.length - 1);
//     })
//     .catch((err) => console.log('error2 ', err.message))

//   .finally((_) => {
//     mongoose.connection.close();
//   });
// });

/* 
    // an approach of how test, foreach, after work 
    
      const after = () => {
        console.log('end');
      };

      const promise = new Promise((resolve) => setTimeout(_ => resolve(1), 4000));

      const callback = async () => {
        console.log('callback start');
        promise;
        console.log(promise)
        console.log('callback end');
      };

      const mytest = async (callback) => {
        await before();
        await callback();
        after();
      };

    mytest(callback);
        // output
        start
        callback start
        callback end
        end
        
    */
