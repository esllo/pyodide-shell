(function () {
  let py = null;
  const main = document.getElementById("main");
  const input = document.querySelector(".shell-input");
  const content = document.querySelector(".shell-content");
  const shell = document.querySelector(".shell");
  const sline = document.querySelector(".shell-line");

  const log = console.log;
  const error = console.error;
  console.log = (arg) => insertLine(arg, 2);
  console.error = (arg) => insertLine(arg, 1);

  async function script() {
    let pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/",
    });
    py = window.py = pyodide;
    sline.style.display = "block";
    input.addEventListener("keydown", onShellInput);
    main.addEventListener("click", focusInput);
  }
  function insertLine(text, type = 0) {
    if (text === undefined) return;
    const TYPES = ["plain", "error", "warn", "info"];
    const lines = text.toString().split("\n");
    lines.forEach((line) => {
      const p = document.createElement("p");
      p.classList.add("line");
      p.classList.add(TYPES[type]);
      p.textContent = line;
      content.insertBefore(p, sline);
    });
    shell.scroll(0, shell.scrollHeight);
  }
  function focusInput() {
    input.focus({ preventScroll: true });
  }
  async function onShellInput(event) {
    if (event.keyCode === 13 || event.code.toLowerCase() === "enter") {
      event.preventDefault();
      if (py && input.textContent.trim()) {
        const line = input.textContent.trim();
        insertLine(">>> " + line);
        if (line.startsWith("#load ")) {
          const package = line.substr(6);
          if (package) {
            sline.style.display = "none";
            await py.loadPackage(package);
            sline.style.display = "block";
            focusInput();
          }
        } else {
          try {
            const result = py.runPython(line);
            insertLine(result);
          } catch (e) {
            insertLine(e.toString(), 1);
          }
        }
      } else {
        insertLine(">>>");
      }
      input.textContent = "";
    }
  }
  script();
})();
