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

let error = {
  status: 1,
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

// done
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// done
const readFromFile = (file, callback) => {
  fs.readFile(`${__dirname}/questions-folder/${file}`, "utf8", (err, fd) => {
    return callback(JSON.parse(fd));
  });
};

// done
const writeToFile = (file, data) => {
  fs.writeFile(`${__dirname}/questions-folder/${file}`, data, (err) => {
    console.log("Error", err);
  });
};

// done
const generateNumber = (digit) => {
  let arr = [];
  for (let i = 1; i <= digit; i++) {
    arr.push(Math.floor(Math.random() * 9));
  }
  return arr.join("");
};

// done
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

// done
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

// done
app.get("/api-key", (req, res) => {
  if (req.query.username) {
    let username = req.query.username;
    let api_key = generateNumber(6);

    readFromFile("api-keys.json", (data) => {
      data[api_key] = username;
      writeToFile("api-keys.json", JSON.stringify(data));
    });
    res.send(`This is your API Key: ${api_key}`);
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

// done
app.get("/student", (req, res) => {
  if (req.query && req.query.api_key) {
    let api_key = req.query.api_key;
    let student_id = req.query.id;
    validateAPIKey(api_key, (result) => {
      if (result) {
        if (student_id) {
          validateStudentID(api_key, student_id, (result2) => {
            if (result2) {
              readFromFile("students.json", (data) => {
                res.send(data[api_key].students_info[student_id]);
              });
            } else {
              error.message = `there is no student with this id ${student_id}`;
              res.send(error);
            }
          });
        } else {
          readFromFile("students.json", (data) => {
            res.send(data[api_key].students_info);
          });
        }
      } else {
        error.message = "you do not have any student yet";
        res.send(error);
      }
    });
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

app.post("/student", (req, res) => {
  if (req.body && req.body.api_key) {
    let api_key = req.body.api_key;
    let student_id = req.body.new_data.id;
    let new_data = req.body.new_data;

    validateAPIKey(api_key, (result) => {
      if (result) {
        validateStudentID(api_key, student_id, (result2) => {
          if (!result2) {
            readFromFile("students.json", (data) => {
              let name = req.body.new_data.name;
              data[api_key].students_info[student_id] = new_data;
              writeToFile("students.json", JSON.stringify(data));
              res.send({
                status: 0,
                message: `student ${name} was created with id: ${student_id}`,
              });
            });
          } else {
            error.message = `there is a student with this id ${student_id}`;
            res.send(error);
          }
        });
      } else {
        error.message = "you do not have any student yet";
        res.send(error);
      }
    });
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

// done
app.delete("/student", (req, res) => {
  if (req.body && req.body.api_key && req.body.id) {
    let api_key = req.body.api_key;
    let student_id = req.body.id;

    validateAPIKey(api_key, (result) => {
      if (result) {
        validateStudentID(api_key, student_id, (result2) => {
          if (result2) {
            readFromFile("students.json", (data) => {
              delete data[api_key].students_info[student_id];
              writeToFile("students.json", JSON.stringify(data));
              res.send({
                status: 0,
                message: `student ${data[api_key].students_info[student_id].name} was deleted`,
              });
            });
          } else {
            error.message = "there is no student with this id";
            res.send(error);
          }
        });
      } else {
        error.message = "you do not have any student yet";
        res.send(error);
      }
    });
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

// done
app.put("/student", (req, res) => {
  if (req.body && req.body.api_key && req.body.id) {
    let api_key = req.body.api_key;
    let student_id = req.body.id;
    let new_data = req.body.new_data;

    validateAPIKey(api_key, (result) => {
      if (result) {
        validateStudentID(api_key, student_id, (result2) => {
          if (result2) {
            readFromFile("students.json", (data) => {
              let name = data[api_key].students_info[student_id].name;
              data[api_key].students_info[student_id] = new_data;
              writeToFile("students.json", JSON.stringify(data));
              res.send({
                status: 0,
                message: `student ${name} was updated`,
              });
            });
          } else {
            error.message = "there is no student with this id";
            res.send(error);
          }
        });
      } else {
        error.message = "you do not have any student yet";
        res.send(error);
      }
    });
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

// done
const validateAPIKey = (api_key, callback) => {
  readFromFile("students.json", (data) => {
    let all_api_keys = Object.keys(data);
    all_api_keys.includes(api_key) ? callback(true) : callback(false);
  });
};

// done
const validateStudentID = (api_key, student_id, callback) => {
  readFromFile("students.json", (data) => {
    let students_ids = Object.keys(data[api_key].students_info);
    students_ids.includes(student_id) ? callback(true) : callback(false);
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
