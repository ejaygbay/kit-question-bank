const submitQuestion = (e) => {
  let subject = document.getElementById("subject").value;
  let num = document.getElementById("number").value;
  let URL = `http://127.0.0.1:3000/question/${subject}/${num}`;

  console.log(subject, num);
  document.getElementById("subject-selection").style = "display: none";
  document.getElementById("question-section").style = "display: block";

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

        let html = `<section id="question${index}">
            <h3>Question ${index + 1}</h3>
            <div id="real-question">${question}</div>

            <section class="options" id="all-opts-${ele}"></section>
            <div id="correct-ans">Correct Ans: ${answer}</div>
          </section>`;

        document
          .getElementById("questions")
          .insertAdjacentHTML("beforeend", html);

        option_keys.forEach((opt, ind) => {
          let html_que_options = `
              <div id="option${ind + 1}">
                <input type="radio" id="${opt}" value="${opt}" name="${ele}-option" />
                <label for="${opt}">${options[opt]}</label>
              </div>`;
          document
            .getElementById(`all-opts-${ele}`)
            .insertAdjacentHTML("beforeend", html_que_options);
        });
      });
    })
    .catch((err) => console.error(err));
};

const submitAnswer = (e) => {
  let user_ans = document.getElementById();
  console.log("");
};
