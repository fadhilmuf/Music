/**
   * Final Chat Logic: Right/Left Alignment + Firebase
   */

  // 1. CONFIG FIREBASE (Gunakan milikmu yang tadi)
  const firebaseConfig = {
    apiKey: "AIzaSyDxgDezO_EJzM0l6xmGyIfbV-HCOQywq7s",
    authDomain: "music-chat-app-3d525.firebaseapp.com",
    projectId: "music-chat-app-3d525",
    storageBucket: "music-chat-app-3d525.firebasestorage.app",
    messagingSenderId: "157371617723",
    appId: "1:157371617723:web:7088131b3f93e3b04cf49e",
    measurementId: "G-R56P683HK4"
  };

  if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
  const db = firebase.firestore();

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatDisplay = document.getElementById('chatDisplay');

  // 2. IDENTITAS ANONIM
  const daftarHewan = ['Kucing', 'Panda', 'Harimau', 'Elang', 'Kelinci', 'Paus', 'Beruang', 'Rubah', 'Singa', 'Penguin'];
  let myIdentity = JSON.parse(localStorage.getItem('myChatIdentity'));

  if (!myIdentity) {
    const hewanAcak = daftarHewan[Math.floor(Math.random() * daftarHewan.length)];
    const angkaAcak = Math.floor(Math.random() * 1000);
    myIdentity = { name: hewanAcak + " " + angkaAcak };
    localStorage.setItem('myChatIdentity', JSON.stringify(myIdentity));
  }

  // 3. FUNGSI RENDER (DENGAN LOGIKA KANAN-KIRI)
  function renderChat(name, text, time) {
    // Cek apakah ini pesan saya atau orang lain
    const isMe = (name === myIdentity.name);

    const chatRow = document.createElement('div');
    chatRow.classList.add('mb-3', 'd-flex', 'w-100');
    
    // Kalau pesan saya, pindah ke kanan (flex-row-reverse)
    if (isMe) {
        chatRow.classList.add('justify-content-end');
    } else {
        chatRow.classList.add('justify-content-start');
    }

    const chatBlock = document.createElement('div');
    chatBlock.classList.add('d-flex', 'flex-column');
    chatBlock.style.maxWidth = '80%';
    
    // Penyelarasan teks di dalam blok
    chatBlock.style.alignItems = isMe ? 'flex-end' : 'flex-start';

    const bubble = document.createElement('div');
    // Warna bubble: Putih untuk orang lain, Biru Muda/Abu Terang untuk saya
    bubble.style.backgroundColor = isMe ? '#e3f2fd' : '#ffffff'; 
    bubble.style.color = '#333';
    bubble.style.padding = '10px 16px';
    bubble.style.borderRadius = isMe ? '20px 20px 0px 20px' : '20px 20px 20px 0px'; // Ujung tajam di sisi berbeda
    bubble.style.fontSize = '14px';
    bubble.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    
    const nameEl = document.createElement('div');
    nameEl.style.fontWeight = '800';
    nameEl.style.fontSize = '11px';
    nameEl.style.marginBottom = '2px';
    nameEl.style.color = isMe ? '#0d47a1' : '#555';
    nameEl.textContent = isMe ? "You" : name; // Ganti nama jadi "You" kalau itu kita

    const bodyEl = document.createElement('div');
    bodyEl.textContent = text;

    bubble.appendChild(nameEl);
    bubble.appendChild(bodyEl);

    const timeEl = document.createElement('small');
    timeEl.style.fontSize = '9px';
    timeEl.style.color = 'rgba(255,255,255,0.7)';
    timeEl.style.marginTop = '4px';
    timeEl.textContent = time;

    chatBlock.appendChild(bubble);
    chatBlock.appendChild(timeEl);
    chatRow.appendChild(chatBlock);
    chatDisplay.appendChild(chatRow);
    
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  // 4. LISTEN FIREBASE & KIRIM PESAN (Tetap sama)
  if (chatDisplay) {
    db.collection("comments").orderBy("timestamp", "asc").onSnapshot((qs) => {
        chatDisplay.innerHTML = ''; 
        qs.forEach((doc) => {
          const d = doc.data();
          renderChat(d.name, d.text, d.timeString);
        });
    });
  }

  if (chatForm) {
    const modalEl = document.getElementById('inputModal');
    let modal = (modalEl) ? new bootstrap.Modal(modalEl) : null;

    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const t = chatInput.value.trim();
      if(t) {
        const timeStr = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
        db.collection("comments").add({
          name: myIdentity.name,
          text: t,
          timeString: timeStr,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          chatInput.value = ''; 
          if (modal) modal.hide();
        });
      }
    });
  }