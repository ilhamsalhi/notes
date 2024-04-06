const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");

const api = supertest(app);
const helper = require("./test_helper");
const Note = require("../models/note");
const User = require("../models/user");

describe("when there is initially some notes saved", () => {
  beforeEach(async () => {
    await Note.deleteMany({});

    for (let note of helper.initialNotes) {
      let noteObject = new Note(note);
      await noteObject.save();
    }
  });

  test("notes are returned as json", async () => [
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/),
  ]);

  test("all notes are returned", async () => {
    const response = await api.get("/api/notes");

    assert.strictEqual(response.body.length, helper.initialNotes.length);
  });

  test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");
    const contents = response.body.map((r) => r.content);

    assert(contents.includes("Browser can execute only JavaScript"));
  });
});

describe("addition of new note", async () => {

  test("succeeds with valid data", async () => { 
    const newNote = {
      content: "async/await simplifies making async calls",
      important: true,
    };

    await api
      .post("/api/notes")
      .send(newNote)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    assert(contents.includes(newNote.content));
  });

  test("fails with 400 if data is invalid", async () => {
    await api.post("/api/notes").send({}).expect(400);
  });
});

describe("viewing a specific note", () => {
  test("succeds if id is valid", async () => {
    const notesAtStart = await helper.notesInDb();

    const noteToview = notesAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToview.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(noteToview, resultNote.body);
  });

  test("fails with 404 if note doesnt exist", async () => {
    const deletedNoteId = await helper.nonExistingId();

    await api.get(`/api/notes/${deletedNoteId}`).expect(404);
  });

  test("fails with 400 if id isnt valid", async () => {
    const invalidId = "hh";
    await api.get(`/api/notes/${invalidId}`).expect(400);
  });
});

describe("deletion of note", () => {
  test("succeeds if id is valid", async () => {
    const notesAtStart = await helper.notesInDb();

    const noteTodelete = notesAtStart[0];

    const resultNote = await api
      .delete(`/api/notes/${noteTodelete.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(resultNote.body, noteTodelete);

    const notesAtEnd = await helper.notesInDb();
    assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1);

    const contents = notesAtEnd.map((n) => n.content);
    assert(!contents.includes(noteTodelete.content));
  });

  test("fails with 404 if it doest exist", async () => {
    const notesAtStart = await helper.notesInDb();

    const deletedNoteId = await helper.nonExistingId();

    await api.delete(`/api/notes/${deletedNoteId}`).expect(404);

    const notesAtEnd = await helper.notesInDb();
    assert.strictEqual(notesAtEnd.length, notesAtStart.length);
  });

  test("fails with 400 if id isnt valid", async () => {
    const invalidId = "hh";
    await api.delete(`/api/notes/${invalidId}`).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});

/*
    what is supertest =>
        node.js library that extends the superagent library by adding expect
        it could be used as standalobe library or with javascript testing frameworks lie Mocha
        or with node native test runner lie we did here


    minifying focuses on optimizing individual files by reducing their size, while bundling focuses on optimizing the delivery of multiple files by combining them into a single file
*/

// beforeEach(async () => {
//     await Note.deleteMany({})

//     // approach 1 : problematic
//     // helper.initialNotes.forEach(async (note) => {
//     //     let noteObject = new Note(note)
//     //     await noteObject.save()
//     //     console.log('saved')
//     //   })
//     //   console.log('done')

//     // approach 2
//     // const noteObjects = helper.initialNotes
//     //     .map(note => new Note(note))

//     // const promiseArray = noteObjects.map(note => note.save())
//     // const result = await Promise.all(promiseArray)

//     // approach 3
//     await Note.deleteMany({})

//     for (let note of helper.initialNotes) {
//         let noteObject = new Note(note)
//         await noteObject.save()
//         console.log('saved')
//     }
//     console.log('done')

// })
