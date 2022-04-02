const express = require("express");
const path = require("path");
const fs = require("fs");
const noteData = require("./db/db.json");
// Helper method for generating unique ids
const uuid = require("./helpers/uuid");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// GET request for notes
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// GET api request for notes
app.get("/api/notes", (req, res) => {
  // Log that a GET request was received
  console.info(`${req.method} request received to get notes from db`);

  return res.status(200).json(noteData);
});

// POST request to add a note
app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newPost = {
      title,
      text,
      id: uuid(),
    };

    // Write the string to a file
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err || !data) {
        console.error(err);
      } else {
        const parsedNotes = JSON.parse(data);
        // Convert the data to a string so we can save it
        parsedNotes.push(newPost);

        fs.writeFile(
          `./db/db.json`,
          JSON.stringify(parsedNotes, null, 4),
          (err) =>
            err
              ? console.error(err)
              : console.log(`Note has been written to JSON file`)
        );
      }
    });

    const response = {
      status: "success",
      body: newPost,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

// POST request to add a review
app.delete("/api/notes/:id", (req, res) => {
  // Log that a POST request was received
  console.info(
    `${req.method} request received to delete note ${req.params.id}`
  );

  const newData = [];

  // If all the required properties are present
  if (req.params.id) {
    const toDelete = req.params.id;
    // Write the string to a file
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err || !data) {
        console.error(err);
      } else {
        const notesData = JSON.parse(data);

        // Convert the data to a string so we can save it
        for (let i = 0; i < notesData.length; i++) {
          if (notesData[i].id != toDelete) {
            newData.push(notesData[i]);
          }
        }

        fs.writeFile(`./db/db.json`, JSON.stringify(newData, null, 4), (err) =>
          err ? console.error(err) : console.log(`Note has been Deleted`)
        );
      }
    });

    const response = {
      status: "success",
      body: newData,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in deleting note");
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
