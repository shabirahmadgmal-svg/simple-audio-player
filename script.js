// ==========================================
// 1. HTML ELEMENTS KO SELECT KARNA
// ==========================================
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
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progressContainer');

// ==========================================
// 2. DEFAULT PLAYLIST DATA (ONLINE BACKUP LINKS)
// ==========================================
// Jab tak user search nahi karega, yeh 4 gaane niche nazar aayenge aur direct play honge
const defaultSongs = [
    {
        title: "Pasoori - Ali Sethi x Shae Gill",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Dil Diyan Gallan - Atif Aslam",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Tum Hi Ho - Arijit Singh",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "Ranjha - Shershaah",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
];

// Active playlist tracks ko store karne ke liye array
let songsList = [...defaultSongs];
let currentSongIndex = 0;
let isPlaying = false;

// ==========================================
// 3. UI PAR PLAYLIST SHOW KARNE KA FUNCTION
// ==========================================
function displayPlaylist() {
    playlistContainer.innerHTML = ''; // Pehle list ko khali karein
    
    songsList.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.title;
        
        // Agar yeh gaana current chal raha hai to active class do
        if (index === currentSongIndex) {
            li.classList.add('active');
        }
        
        // Click event listener har gaane par
        li.addEventListener('click', () => {
            loadSong(index);
            playSong();
        });
        
        playlistContainer.appendChild(li);
    });
}

// ==========================================
// 4. TRACK LOAD KARNE KA FUNCTION
// ==========================================
function loadSong(index) {
    currentSongIndex = index;
    const song = songsList[currentSongIndex];
    
    if (song) {
        audio.src = song.src;
        songTitleDisplay.textContent = song.title;

        // UI par active song highlight badalna
        const items = playlistContainer.querySelectorAll('li');
        items.forEach((item, i) => {
            if (i === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// ==========================================
// 5. PLAY AUR PAUSE LOGIC
// ==========================================
function playSong() {
    isPlaying = true;
    audio.play().catch(err => {
        console.log("Playback failed or interrupted: ", err);
        songTitleDisplay.textContent = "Click anywhere on screen, then press Play";
    });
    playBtn.textContent = "⏸️"; // Pause Icon
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.textContent = "▶️"; // Play Icon
}

// Play/Pause button click trigger
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// ==========================================
// 6. NEXT AUR PREVIOUS CONTROLS
// ==========================================
nextBtn.addEventListener('click', () => {
    if (songsList.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songsList.length;
        loadSong(currentSongIndex);
        playSong();
    }
});

prevBtn.addEventListener('click', () => {
    if (songsList.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length;
        loadSong(currentSongIndex);
        playSong();
    }
});

// ==========================================
// 7. 🚀 LIVE ONLINE SEARCH FEATURE (SAAVN API INTEGRATION)
// ==========================================
let searchTimeout;
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Agar search bar khali ho jaye, to default wale 4 gaane wapas le aao
        if (query === "") {
            songsList = [...defaultSongs];
            currentSongIndex = 0;
            displayPlaylist();
            loadSong(0);
            return;
        }

        songTitleDisplay.textContent = "Searching online...";

        // Debounce logic: Har lafz typing par फालतू API request na jaye
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            // Free and High-Speed Desi/International Songs API
            const apiUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(res => {
                    // API response verification
                    if (res.success && res.data && res.data.results && res.data.results.length > 0) {
                        
                        // Search kiye gaye data ko hamare player format mein badalna
                        songsList = res.data.results.map(track => {
                            // Sabse high quality (320kbps ya 192kbps) stream link uthana
                            const audioUrl = track.downloadUrl && track.downloadUrl.length > 0 
                                ? track.downloadUrl[track.downloadUrl.length - 1].url 
                                : "";

                            return {
                                title: track.name + " - " + (track.artists.primary[0]?.name || "Unknown Artist"),
                                src: audioUrl
                            };
                        }).filter(track => track.src !== ""); // Khali links filter out karein

                        if (songsList.length > 0) {
                            currentSongIndex = 0;
                            displayPlaylist(); // UI updates with suggestions
                            loadSong(0);       // Auto-load first result
                            songTitleDisplay.textContent = "Songs found online!";
                        } else {
                            throw new Error("No streamable url");
                        }

                    } else {
                        songTitleDisplay.textContent = "Online: No songs found";
                        playlistContainer.innerHTML = '<li style="text-align:center; color:#aaa; padding:15px;">No suggestions found</li>';
                    }
                })
                .catch(err => {
                    console.error("API error or lack of results: ", err);
                    songTitleDisplay.textContent = "No results found online";
                    playlistContainer.innerHTML = '<li style="text-align:center; color:#aaa; padding:15px;">No suggestions found</li>';
                });
        }, 600); // User ke type rokne ke 0.6 seconds baad search chalegi
    });
}

// ==========================================
// 8. PROGRESS BAR AUR TIME UPDATES
// ==========================================
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        // Progress bar line width width percentage update karna
        const pct = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${pct}%`;

        // Current Time Format (0:00)
        let curM = Math.floor(audio.currentTime / 60);
        let curS = Math.floor(audio.currentTime % 60);
        timeDisplayStart.textContent = `${curM}:${curS < 10 ? '0' : ''}${curS}`;

        // Total Duration Time Format (0:00)
        let durM = Math.floor(audio.duration / 60);
        let durS = Math.floor(audio.duration % 60);
        if (!isNaN(durM)) {
            timeDisplayEnd.textContent = `${durM}:${durS < 10 ? '0' : ''}${durS}`;
        }
    }
});

// Progress Bar par click karke gaana aage piche (Seek) karna
if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    });
}

// ==========================================
// 9. VOLUME CONTROL & AUTO-NEXT
// ==========================================
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// Gaana khatam hone par automatic agla track chalna
audio.addEventListener('ended', () => {
    if (songsList.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songsList.length;
        loadSong(currentSongIndex);
        playSong();
    }
});

// ==========================================
// 10. PLAYER APP INITIALIZATION
// ==========================================
displayPlaylist();
loadSong(currentSongIndex);