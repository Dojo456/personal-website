// Initialize pell on an HTMLElement
pell.init({
    // <HTMLElement>, required
    element: document.getElementById('editor'),
  
    // <Function>, required
    // Use the output html, triggered by element's `oninput` event
    onChange: html => document.getElementById('entry').value = html,
  })
  