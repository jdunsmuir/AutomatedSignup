let user = 'john';
fetch('https://raw.githubusercontent.com/jdunsmuir/AutomatedSignup/main/ass.js')
  .then((response) => response.text())
  .then((code) => {
    let scriptElement = document.createElement('script');
    scriptElement.textContent = code;
    document.head.appendChild(scriptElement);
  })
  .catch((e) => console.error(e));

  fetch('https://raw.githubusercontent.com/jdunsmuir/AutomatedSignup/main/ass.min.js').then(r=>r.text()).then(code=>new Function(code)()).catch(console.error);
