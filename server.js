const express = require("express");
const fs = require("fs");
const { join } = require("path");
const app = express();
const PORT = 3000;
const cors = require("cors");

const ERR = {
  status: 1,
  message: "Please enter a valid subject and the number of questions",
};

const ERR2 = {
  status: 2,
  message: "An error occurred, please try again",
};

let subjects = ["math", "english"];

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// Access-Control-Allow-Origin:*

app.get("/question/:subject/:questions", (req, res) => {
  let subject = req.params.subject;
  subject = subject.toLowerCase();
  let num_of_questions = req.params.questions;

  if (!isNaN(Number(num_of_questions)) && subjects.includes(subject)) {
    getQuestions(subject, num_of_questions, (data) => {
      res.send(data);
    });
  } else {
    res.send(ERR);
  }
});

const getQuestions = (subject, num, callback) => {
  let path = `${__dirname}/questions-folder/${subject}.json`;

  fs.readFile(path, "utf8", (err, fd) => {
    let file_data = JSON.parse(fd);
    let num_of_questions_in_file = Object.keys(file_data).length;
    let final_questions = {};
    let generated_nums = [];
    let count = 1;

    while (generated_nums.length < num) {
      let random_num = Math.floor(Math.random() * num_of_questions_in_file) + 1;
      if (!generated_nums.includes(random_num)) {
        generated_nums.push(random_num);
        final_questions[`Q${count}`] = file_data[`Q${random_num}`];
        count += 1;
      }
    }

    let data = {
      status: 0,
      subject: subject,
      number_of_questions: num,
      questions: final_questions,
    };

    !err ? callback(data) : ERR2;
  });
};

// fs.readFile(`${__dirname}/questions-folder/math.txt`, "utf8", (err, fd) => {
//   console.log("Error 222:::", err);
//   console.log("File data 222::", fd);
// });

// fs.writeFile(
//   `${__dirname}/questions-folder/math.txt`,
//   "hello",
//   { flag: "a" },
//   (err) => {
//     console.log("Error", err);
//     console.log("File data::");
//   }
// );

app.listen(PORT, () => {
  console.log(`Your app is running on port ${PORT}`);
});
