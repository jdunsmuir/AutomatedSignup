let user = 'john_4bb82d20-cc28-493d-8388-bef018474553';
fetch('https://raw.githubusercontent.com/jdunsmuir/AutomatedSignup/main/ass.min.js')
  .then((response) => response.text())
  .then((code) => {
    let scriptElement = document.createElement('script');
    (scriptElement.textContent = code), document.head.appendChild(scriptElement);
  })
  .catch((e) => console.error(e));
