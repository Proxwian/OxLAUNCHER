import { ipcRenderer } from 'electron';

export default function browserDownload(url, mirror, filePath) {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke('download-optedout-mod', {
      url,
      mirror,
      filePath
    });

    ipcRenderer.once('opted-out-window-closed-unexpected', () => {
      reject(new Error('Download window closed unexpectedly'));
    });

    ipcRenderer.once('opted-out-download-mod-status', (e, status) => {
      if (!status.error) {
        ipcRenderer.removeAllListeners('opted-out-window-closed-unexpected');
        resolve();
      } else {
        ipcRenderer.removeAllListeners('opted-out-window-closed-unexpected');
        reject(status.error);
      }
    });
  });
}
