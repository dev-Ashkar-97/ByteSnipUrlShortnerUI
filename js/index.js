function copyToClipboard() {
  const input = document.getElementById('copyshortenedurl');
  const value = input.value.trim();

  if (value) {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        showToast('success', 'URL Copied');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  } else {
    alert('Input is empty!');
  }
}

window.copyToClipboard = copyToClipboard;

function showToast(type, message) {
  const container = document.getElementById('toastContainer');

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  // Header text
  const header = document.createElement('div');
  header.className = 'custom-toast-header';
  header.innerText = type === 'success' ? 'Success' : 'Error';

  // Content
  const content = document.createElement('div');
  content.innerText = message;

  // Progress bar
  const progress = document.createElement('div');
  progress.className = 'custom-toast-progress';

  // Append children
  toast.appendChild(header);
  toast.appendChild(content);
  toast.appendChild(progress);
  container.appendChild(toast);

  // Timeout duration
  const duration = 3000; // 3 seconds

  // Animate progress bar
  setTimeout(() => {
    progress.style.width = '0%';
  }, 50);
  progress.style.transition = `width ${duration}ms linear`;

  // Remove after timeout
  setTimeout(() => {
    toast.remove();
  }, duration + 500);
}

window.showToast = showToast;

function showSpinner() {
  document.getElementById('spinner-overlay').style.display = 'flex';
}

function hideSpinner() {
  document.getElementById('spinner-overlay').style.display = 'none';
}

let qrinput;

async function shortenUrl() {
  const input = document.getElementById('inputUrl');
  const output = document.getElementById('copyshortenedurl');
  const value = input.value.trim();

  if (!value) {
    showToast('error', 'Input is empty!');
    return;
  }

  try {
    new URL(value); // validate
  } catch {
    showToast('error', 'Invalid URL');
    return;
  }

  showSpinner();

  try {
    const response = await fetch(
      //'https://localhost:7076/Api/Url/Shorten',
      'https://bytesnipapi.azurewebsites.net/api/Url/Shorten',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: value }),
      }
    );

    if (!response.ok) {
      showToast('error', 'Failed to shorten. Server error.');

      return;
    }

    const data = await response.json();

    if (!data || !data.shortenedUrl) {
      showToast('error', 'Cant shorten now, please try again later.');

      return;
    } else {
      showToast('success', 'Successfully shortened URL');
    }

    // ✅ Show shortened URL in output box
    output.value = data.shortenedUrl;
    qrinput = data.shortenedUrl;
  } catch (error) {
    console.error('Error:', error);
    showToast('error', 'Something went wrong while shortening.');
  } finally {
    hideSpinner();
  }
}

window.shortenUrl = shortenUrl;

async function sendMessage(event) {
  showSpinner();

  event.preventDefault(); // stop the form from reloading the page

  const fullname = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;

  try {
    const response = await fetch(
      'https://bytesnipapi.azurewebsites.net/api/EnquiryMessage/PostRequestMessage',
      //'https://localhost:7076/Api/EnquiryMessage/PostRequestMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: fullname,
          email: email,
          message: message,
          subject: subject,
        }),
      }
    );

    if (!response.ok) {
      showToast('error', 'Failed to send message. Server error.');

      return;
    }

    showToast('success', 'Successfully send message thank you');
  } catch (error) {
    showToast('error', 'Failed to send message. Server error.');
    return;
  } finally {
    hideSpinner();
  }
}

let qr;

function toggleQRPopup() {
  const popup = document.getElementById('qrPopup');
  const qrContainer = document.getElementById('qrcode');

  if (qrinput && qrinput.trim() !== '') {
    // Toggle visibility
    popup.classList.toggle('d-none');

    // Generate QR only if visible
    if (!popup.classList.contains('d-none')) {
      qrContainer.innerHTML = '';
    }

    qr = new QRCode(qrContainer, {
      text: qrinput, // 🔹 replace with dynamic string
      width: 150,
      height: 150,
    });
  } else {
    showToast('error', 'No QR found');
  }
}

function closeQRPopup() {
  document.getElementById('qrPopup').classList.add('d-none');
}

function downloadQR() {
  if (!qr) return;
  const qrCanvas = document.querySelector('#qrcode canvas');
  if (!qrCanvas) return;

  const link = document.createElement('a');
  link.href = qrCanvas.toDataURL('image/png');
  link.download = 'ByteSnip.png';
  link.click();
}
