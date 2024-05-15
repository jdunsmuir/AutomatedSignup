function fetchAndRunCode(githubUrl) {
  fetch(githubUrl)
    .then((response) => response.text())
    .then((code) => {
      console.log(code);
      eval(code);
    })
    .catch((error) => console.error('Error fetching the code:', error));
}

const githubRawUrl = 'https://raw.githubusercontent.com/jdunsmuir/AutomatedSignup/main/automatedSignup.js';
fetchAndRunCode(githubRawUrl);
