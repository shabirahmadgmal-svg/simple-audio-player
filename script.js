const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const searchInput = document.getElementById('search');
const songTitleDisplay = document.getElementById('title');
const volumeSlider = document.getElementById('volume');
const playlistContainer = document.getElementById('playlist');
const timeDisplayStart = document.getElementById('current');
const timeDisplayEnd = document.getElementById('duration');

// Progress Elements (Aapke HTML layout ke mutabiq)
const progressContainer = document.getElementById('progressContainer');
const progress = document.getElementById('progress');

// 1. Gaano ki List
const songsList = [
    { title: "Pasoori - Ali Sethi x Shae Gill", src: "songs/pasoori.mp3" },
    { title: "Dil Diyan Gallan - Atif Aslam", src: "songs/dil_diyan.mp3" },
    { title: "Tum Hi Ho - Arijit Singh", src: "songs/tum_hi_ho.mp3" }
];

let currentSongIndex = parseInt(localStorage.getItem('lastPlayedSongIndex')) || 0;
let isPlaying = false;

// 2. HTML ke andar Playlist ko DYNAMICALLY generate karna (CRITICAL FIX)
function initPlaylist() {
    playlistContainer.innerHTML = ''; // Khali karein pehle
    songsList.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        if (index === currentSongIndex) li.classList.add('active');
        
        // Gaane par click karne se chalna
        li.addEventListener('click', () => {
            loadSong(index);
            playSong();
        });
        playlistContainer.appendChild(li);
    });
}

// 3. Gaana Load karne ka function
function loadSong(index) {
    currentSongIndex = index;
    const song = songsList[currentSongIndex];
    if (song) {
        audio.src = song.src;
        songTitleDisplay.textContent = song.title;

        // Active class ko manage karna
        const items = playlistContainer.querySelectorAll('li');
        items.forEach((item, i) => {
            if (i === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        localStorage.setItem('lastPlayedSongIndex', currentSongIndex);
    }
}

// 4. Play / Pause Logics
function playSong() {
    isPlaying = true;
    audio.play().catch(err => console.log("Audio file nahi mili ya error hai: ", err));
    playBtn.textContent = "⏸️"; // Icon badal diya
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.textContent = "▶️";
}

playBtn.addEventListener('click', () => {
    if (isPlaying) { pauseSong(); } else { playSong(); }
});

// 5. Next / Prev Buttons
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songsList.length;
    loadSong(currentSongIndex);
    playSong();
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length;
    loadSong(currentSongIndex);
    playSong();
});

// 6. LIVE SEARCH FILTER FIX
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const items = playlistContainer.querySelectorAll('li');
        let foundAny = false;

        items.forEach((item) => {
            const txt = item.textContent.toLowerCase();
            if (txt.includes(searchTerm)) {
                item.style.display = "block";
                foundAny = true;
            } else {
                item.style.display = "none";
            }
        });

        // Agar gaana na mile to UI par alert text
        if (searchTerm !== "" && !foundAny) {
            songTitleDisplay.textContent = "Local: No songs found";
        } else if (searchTerm === "") {
            songTitleDisplay.textContent = songsList[currentSongIndex].title;
        } else {
            songTitleDisplay.textContent = "Songs Filtered...";
        }
    });
}

// 7. Progress Bar Custom Handler (Aapke Div layout ke liye)
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${pct}%`;

        // Time format format (0:00)
        let curM = Math.floor(audio.currentTime / 60);
        let curS = Math.floor(audio.currentTime % 60);
        timeDisplayStart.textContent = `${curM}:${curS < 10 ? '0' : ''}${curS}`;

        let durM = Math.floor(audio.duration / 60);
        let durS = Math.floor(audio.duration % 60);
        if (!isNaN(durM)) {
            timeDisplayEnd.textContent = `${durM}:${durS < 10 ? '0' : ''}${durS}`;
        }
    }
});

// Progress container par click karke gaana seek karna
progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
});

// Volume Control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Auto-next when song ends
audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songsList.length;
    loadSong(currentSongIndex);
    playSong();
});

// Initialize App
initPlaylist();
loadSong(currentSongIndex);