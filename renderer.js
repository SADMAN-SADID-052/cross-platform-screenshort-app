const { ipcRenderer } = require('electron');
const path = require('path');

document.getElementById('start').addEventListener('click', () => {
  const interval = parseInt(document.getElementById('interval').value);
  const format = document.getElementById('format').value;
  const notify = document.getElementById('notify').checked;

  ipcRenderer.send('start-capturing', {
    interval,
    format,
    notify,
    folder: null, // Default is Desktop
  });
});

document.getElementById('stop').addEventListener('click', () => {
  ipcRenderer.send('stop-capturing');
});
