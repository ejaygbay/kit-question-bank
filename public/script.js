let num_of_que = 0;

const submitQuestion = (e) => {
  let subject = document.getElementById("subject").value;
  let num = document.getElementById("number").value;
  let URL = `http://127.0.0.1:3000/question/${subject}/${num}`;
  num_of_que = Number(num);

  document.getElementById("subject-selection").style = "display: none";
  document.getElementById("question-section").style = "display: block";
  document.getElementById("action-btns").style = "display: none";
  document.getElementById("score").innerHTML = `Score: `;
  document.getElementById("correct").innerHTML = `Correct: `;
  document.getElementById("wrong").innerHTML = `Wrong: `;
  document.getElementById("questions").innerHTML = "";

  // https://kit-question.glitch.me/question/math/3
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      let question_keys = Object.keys(data.questions);
      question_keys.forEach((ele, index) => {
        let question = data.questions[ele].question;
        let answer = data.questions[ele].answer;
        let options = data.questions[ele].options;
        let option_keys = Object.keys(options);

        let html = `<section id="question${index + 1}" class="single-question">
            <h3>Question ${index + 1}</h3>
            <div id="real-question">${question}</div>

            <section class="options" id="all-opts-${ele}"></section>
            <div id="${ele}-${answer}" class="${ele}-answer answer">Correct Ans: ${answer}</div>
          </section>`;

        document
          .getElementById("questions")
          .insertAdjacentHTML("beforeend", html);

        option_keys.forEach((opt, ind) => {
          let html_que_options = `
              <div id="option${ind + 1}">
                <input type="radio" id="${ele}-${opt}" value="${ele}-${opt}" name="${ele}-option" onclick="checkAnswer(event)" />
                <label for="${ele}-${opt}">${options[opt]}</label>
              </div>`;
          document
            .getElementById(`all-opts-${ele}`)
            .insertAdjacentHTML("beforeend", html_que_options);
        });
      });
    })
    .catch((err) => console.error(err));
};

const checkAnswer = (e) => {
  let user_ans = e.target.id;
  let correct_ans = document.querySelector(`.${user_ans.split("-")[0]}-answer`);
  let correct_ans_id = correct_ans.id;

  if (correct_ans_id === user_ans) {
    correct_ans.classList.add("correct");
    correct_ans.classList.remove("wrong");
  } else {
    correct_ans.classList.add("wrong");
    correct_ans.classList.remove("correct");
  }

  let correct = document.querySelectorAll(".correct").length;
  let wrong = document.querySelectorAll(".wrong").length;

  if (correct + wrong === num_of_que) {
    document.getElementById("submit-ans").style = "display: block";
  }
};

const submitAnswers = (e) => {
  let correct = document.querySelectorAll(".correct");
  let wrong = document.querySelectorAll(".wrong");

  let point = 100 / (correct.length + wrong.length);

  document.getElementById("score").innerHTML = `Score: ${
    correct.length * point
  }%`;
  document.getElementById("correct").innerHTML = `Correct: ${correct.length}`;
  document.getElementById("wrong").innerHTML = `Wrong: ${wrong.length}`;
  document.getElementById("submit-ans").style = "display: none";
  document.getElementById("action-btns").style = "display: block";

  correct.forEach((ele) => {
    ele.style = "background: #c6ffb3; display: block";
  });

  wrong.forEach((ele) => {
    ele.style = "background: #ffc2b3; display: block";
  });
};

const restartQuestion = (e) => {
  document.getElementById("score").innerHTML = `Score: `;
  document.getElementById("correct").innerHTML = `Correct: `;
  document.getElementById("wrong").innerHTML = `Wrong: `;
  document.getElementById("questions").innerHTML = "";
  submitQuestion();
};

const changeQuestion = (e) => {
  document.getElementById("subject-selection").style = "display: block";
  document.getElementById("question-section").style = "display: none";
};
