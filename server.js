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

app.get("/student", (req, res) => {
  if (req.query && req.query.api_key && req.query.id) {
    let api_key = req.query.api_key;
    let student_id = req.query.id;
    validateAPIKeyAndStudentID(api_key, student_id, (result) => {
      if (result) {
        res.send(result);
      } else {
        error.message = "You do not have any student yet";
        res.send(error);
      }
    });
  } else {
    error.message = "missing parameter";
    res.send(error);
  }
});

const validateAPIKeyAndStudentID = (api_key, student_id, callback) => {
  readFromFile("students.json", (data) => {
    validateAPIKey(data, api_key, (result) => {
      if (result) {
        validateStudentID(
          data[api_key].students_info,
          student_id,
          (stu_res) => {
            return callback(data[api_key].students_info[student_id]);
          }
        );
      } else {
        return callback(result);
      }
    });
  });
};

const validateAPIKey = (data, api_key, callback) => {
  let all_api_keys = Object.keys(data);
  all_api_keys.includes(api_key) ? callback(true) : callback(false);
};

const validateStudentID = (data, student_id, callback) => {
  let students_ids = Object.keys(data);
  students_ids.includes(student_id) ? callback(true) : callback(false);
};

app.post("/student", (req, res) => {
  // if (req.body && req.body.api_key) {
  console.log("api key & student id post::", req.body);
  res.send("create students");
  // } else {
  //   error.message = "missing parameter";
  //   res.send(error);
  // }
});

app.delete("/student", (req, res) => {
  console.log("api key & student id delete::", req.query);
  res.send("delete students");
});

app.put("/student", (req, res) => {
  console.log("api key & student id put::", req.query);
  res.send("update students");
});

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
