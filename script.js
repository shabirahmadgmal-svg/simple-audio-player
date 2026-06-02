// 1. Music Player ke saare HTML elements ko select karna
const audio = new Audio();
const playBtn = document.querySelector('.fa-pause, .fa-play')?.parentElement || document.querySelectorAll('button')[1]; // Darmiyan wala button
const prevBtn = document.querySelectorAll('button')[0]; // Pehla button
const nextBtn = document.querySelectorAll('button')[2]; // Teesra button
const searchInput = document.querySelector('input[type="text"]');
const songTitleDisplay = document.querySelector('.song-title, h3, div[style*="bold"]') || document.querySelector('strong') || document.querySelector('h2') || document.getElementsByClassName('SongTitle')[0];
const progressBar = document.querySelector('input[type="range"]') || document.querySelector('.progress-bar');
const timeDisplayStart = document.querySelectorAll('span')[0] || { textContent: "" };
const timeDisplayEnd = document.querySelectorAll('span')[1] || { textContent: "" };

// Maan lete hain aapki playlist ke items par 'song-item' class ha ya woh list items hain
// Agar aapke HTML mein class kuch aur ha, to querySelectorAll mein '.' ke sath woh naam likhein
const songItems = document.querySelectorAll('.song-item, li, .playlist-item'); 

// 2. Gaano ki List (Playlist Data) - Aapke UI ke mutabiq spelling aur naam bilkul sahi hone chahiye
const songsList = [
    {
        title: "Pasoori - Ali Sethi x Shae Gill",
        src: "songs/pasoori.mp3" // Yahan apne folder ke mutabiq sahi audio file ka path dalein
    },
    {
        title: "Dil Diyan Gallan - Atif Aslam",
        src: "songs/dil_diyan.mp3"
    },
    {
        title: "Tum Hi Ho - Arijit Singh",
        src: "songs/tum_hi_ho.mp3"
    }
];

// 3. Track rakhna ke kaunsa gaana chal raha ha
// localStorage se check karein ge agar user ne pehle koi gaana suna tha (Feature)
let currentSongIndex = parseInt(localStorage.getItem('lastPlayedSongIndex')) || 0;
let isPlaying = false;

// 4. Gaana Load karne ka function
function loadSong(index) {
    currentSongIndex = index;
    const song = songsList[currentSongIndex];
    
    if (song) {
        audio.src = song.src;
        // UI par gaane ka naam badalna
        if (songTitleDisplay) {
            songTitleDisplay.textContent = song.title;
        } else {
            // Agar specific element nahi mila to jo active ha uski text badlein
            const activeTitle = document.querySelector('div[style*="font-weight: bold"]') || document.querySelector('h3') || document.querySelector('.current-song-title');
            if (activeTitle) activeTitle.textContent = song.title;
        }
        
        // Playlist mein chalne wale gaane ko alag rang (Highlight) dena
        songItems.forEach((item, i) => {
            if (i === currentSongIndex) {
                item.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; // Highlight color
            } else {
                item.style.backgroundColor = ""; // Reset color
            }
        });

        // LocalStorage mein save karna taqi yaad rahe
        localStorage.setItem('lastPlayedSongIndex', currentSongIndex);
    }
}

// 5. Play aur Pause ke functions
function playSong() {
    isPlaying = true;
    audio.play().catch(err => console.log("Audio play error: ", err));
    // Button ka icon badal kar Pause (||) karna
    const icon = playBtn.querySelector('i') || playBtn;
    if(icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    // Button ka icon badal kar Play (▶) karna
    const icon = playBtn.querySelector('i') || playBtn;
    if(icon.classList.contains('fa-pause')) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// Play/Pause Button Toggle Click
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// 6. Next aur Previous Buttons ke Click Events
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songsList.length; // Akhri ke baad dobara pehle par le aayega
    loadSong(currentSongIndex);
    playSong();
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songsList.length) % songsList.length; // Pehle se piche akhri par le aayega
    loadSong(currentSongIndex);
    playSong();
});

// 7. Playlist ke Items par Click karne ka Feature
songItems.forEach((element, index) => {
    element.addEventListener('click', () => {
        loadSong(index);
        playSong();
    });
    // Cursor ko pointer banana taqi click ka pata chale
    element.style.cursor = "pointer"; 
});

// 8. LIVE SEARCH FILTER FEATURE (Aapka Naya Feature)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        songItems.forEach((item, index) => {
            // Gaane ka text nikalna
            const songText = item.textContent.toLowerCase();
            
            // Agar search term gaane ke naam mein ha to dikhao, warna chhupa do
            if (songText.includes(searchTerm)) {
                item.style.display = "flex"; // Show
            } else {
                item.style.display = "none"; // Hide
            }
        });
    });
}

// 9. Progress Bar Aur Time Update (Optional par behtar UI ke liye)
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        // Progress bar ki value update karna
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.value = progressPercent;
        
        // Time display set karna (0:00)
        let currentMins = Math.floor(audio.currentTime / 60);
        let currentSecs = Math.floor(audio.currentTime % 60);
        if (currentSecs < 10) currentSecs = `0${currentSecs}`;
        if (timeDisplayStart) timeDisplayStart.textContent = `${currentMins}:${currentSecs}`;
        
        let durationMins = Math.floor(audio.duration / 60);
        let durationSecs = Math.floor(audio.duration % 60);
        if (durationSecs < 10) durationSecs = `0${durationSecs}`;
        if (timeDisplayEnd && !isNaN(durationMins)) timeDisplayEnd.textContent = `${durationMins}:${durationSecs}`;
    }
});

// Progress Bar ko pakad kar aage piche karne se gaana aage piche hona
if (progressBar) {
    progressBar.addEventListener('input', (e) => {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });
}

// Gaana khatam hone par automatic agla gaana chalna
audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songsList.length;
    loadSong(currentSongIndex);
    playSong();
});


// 10. Player Shuru hote hi Pehla (ya pichla chora hua) gaana load karna
loadSong(currentSongIndex);