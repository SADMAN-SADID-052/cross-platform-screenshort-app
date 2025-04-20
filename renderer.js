const { ipcRenderer } = require('electron');

let selectedFolder = null;

document.getElementById('start').addEventListener('click', async () => {
  const interval = parseInt(document.getElementById('interval').value);
  const format = document.getElementById('format').value;
  const notify = document.getElementById('notify').checked;

  selectedFolder = await ipcRenderer.invoke('select-folder');

  if (!selectedFolder) return; // User canceled

  ipcRenderer.send('start-capturing', {
    interval,
    format,
    notify,
    folder: selectedFolder,
  });
});

document.getElementById('stop').addEventListener('click', () => {
  ipcRenderer.send('stop-capturing');
});

// Show toast message when save the screenshot in the selected folder
ipcRenderer.on('show-toast', (event, message) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
});
