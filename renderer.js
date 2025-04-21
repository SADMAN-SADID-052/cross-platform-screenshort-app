const { ipcRenderer } = require('electron');

let selectedFolder = null;

document.getElementById('start').addEventListener('click', async () => {
  const interval = parseInt(document.getElementById('interval').value);
  const format = document.getElementById('format').value;


  selectedFolder = await ipcRenderer.invoke('select-folder');
  if (!selectedFolder) return;

  ipcRenderer.send('start-capturing', {
    interval,
    format,
    folder: selectedFolder,
  });
});

document.getElementById('stop').addEventListener('click', () => {
  ipcRenderer.send('stop-capturing');
});

// Show toast message
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

// Add screenshot to gallery
ipcRenderer.on('screenshot-saved', (event, filePath) => {
  const gallery = document.getElementById('screenshot-gallery');

  const img = document.createElement('img');
  img.src = `file://${filePath}`;
  img.alt = 'Screenshot';
  img.className = 'screenshot-thumb';

  gallery.prepend(img);
});

// Full image preview on click
document.getElementById('screenshot-gallery').addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG' && e.target.classList.contains('screenshot-thumb')) {
    showFullImage(e.target.src);
  }
});

function showFullImage(src) {
  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';

  const img = document.createElement('img');
  img.src = src;
  img.className = 'full-image';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.innerText = '×';
  closeBtn.onclick = () => overlay.remove();

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}
