/**
   * Final Chat Logic: Firebase Firestore (v8)
   */

  // Konfigurasi dari dashboard Firebase kamu
  const firebaseConfig = {
    apiKey: "AIzaSyDxgDezO_EJzM0l6xmGyIfbV-HCOQywq7s",
    authDomain: "music-chat-app-3d525.firebaseapp.com",
    projectId: "music-chat-app-3d525",
    storageBucket: "music-chat-app-3d525.firebasestorage.app",
    messagingSenderId: "157371617723",
    appId: "1:157371617723:web:7088131b3f93e3b04cf49e",
    measurementId: "G-R56P683HK4"
  };

  // Inisialisasi Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatDisplay = document.getElementById('chatDisplay');

  // 1. IDENTITAS ANONIM (Nama Hewan)
  const daftarHewan = ['Kucing', 'Panda', 'Harimau', 'Elang', 'Kelinci', 'Paus', 'Beruang', 'Rubah', 'Singa', 'Penguin'];
  let myIdentity = JSON.parse(localStorage.getItem('myChatIdentity'));

  if (!myIdentity) {
    const hewanAcak = daftarHewan[Math.floor(Math.random() * daftarHewan.length)];
    const angkaAcak = Math.floor(Math.random() * 1000);
    myIdentity = { name: hewanAcak + angkaAcak };
    localStorage.setItem('myChatIdentity', JSON.stringify(myIdentity));
  }

  // 2. FUNGSI RENDER BUBBLE
  function renderChat(name, text, time) {
    const chatBlock = document.createElement('div');
    chatBlock.classList.add('mb-1', 'd-flex', 'flex-column', 'align-items-start');

    const bubble = document.createElement('div');
    bubble.style.backgroundColor = '#ffffff'; 
    bubble.style.color = '#333';
    bubble.style.padding = '10px 18px';
    bubble.style.borderRadius = '20px';
    bubble.style.fontSize = '14px';
    bubble.style.maxWidth = '85%';
    bubble.style.wordBreak = 'break-word';
    bubble.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    
    const nameEl = document.createElement('div');
    nameEl.style.fontWeight = '800';
    nameEl.style.fontSize = '12px';
    nameEl.style.marginBottom = '2px';
    nameEl.textContent = name;

    const bodyEl = document.createElement('div');
    bodyEl.textContent = text;

    bubble.appendChild(nameEl);
    bubble.appendChild(bodyEl);

    const timeEl = document.createElement('small');
    timeEl.style.fontSize = '10px';
    timeEl.style.color = 'rgba(255,255,255,0.6)';
    timeEl.style.marginTop = '4px';
    timeEl.style.marginLeft = '12px';
    timeEl.textContent = time;

    chatBlock.appendChild(bubble);
    chatBlock.appendChild(timeEl);
    chatDisplay.appendChild(chatBlock);
    
    // Auto scroll ke bawah
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  // 3. AMBIL DATA REAL-TIME DARI FIRESTORE
  if (chatDisplay) {
    db.collection("comments").orderBy("timestamp", "asc")
      .onSnapshot((querySnapshot) => {
        chatDisplay.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          renderChat(data.name, data.text, data.timeString);
        });
      });
  }

  // 4. KIRIM PESAN KE FIRESTORE
  if (chatForm) {
    const inputModalEl = document.getElementById('inputModal');
    let inputModal = (inputModalEl) ? new bootstrap.Modal(inputModalEl) : null;

    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const t = chatInput.value.trim();
      
      if(t) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

        db.collection("comments").add({
          name: myIdentity.name,
          text: t,
          timeString: timeStr,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          chatInput.value = ''; 
          if (inputModal) inputModal.hide();
        })
        .catch((error) => {
          console.error("Error sending message: ", error);
        });
      }
    });
  }