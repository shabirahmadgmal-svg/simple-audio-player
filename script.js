// Default background tracks jab tak user kuch search nahi karta
let defaultSongs = [
  { name: "Beautiful Cinematic", file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Energetic Pop", file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Relaxing Acoustic", file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { name: "Electronic Beats", file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

let currentList = defaultSongs;
let currentSong = parseInt(localStorage.getItem("lastSong")) || 0;
let isPlaying = false;

// DOM Elements
const audio = document.getElementById("audio");
const title = document.getElementById("title");
const playlist = document.getElementById("playlist");
const search = document.getElementById("search");
const volume = document.getElementById("volume");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressContainer = document.getElementById("progressContainer");
const currentTimeEl = document.getElementById("current");
const durationEl = document.getElementById("duration");

// Load Playlist into UI
function loadPlaylist(list) {
  currentList = list;
  playlist.innerHTML = "";

  list.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    if (index === currentSong) li.classList.add("active");
    li.onclick = () => playSong(index);
    playlist.appendChild(li);
  });
}

// Play Selected Song
function playSong(index) {
  if (currentList.length === 0) return;
  
  currentSong = index;
  audio.src = currentList[index].file;
  title.textContent = currentList[index].name;
  
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = "⏸";
  }).catch(err => console.log("Playback interrupted or error:", err));

  localStorage.setItem("lastSong", index);
  
  // Active class update karne ke liye re-render
  const items = playlist.querySelectorAll("li");
  items.forEach((item, idx) => {
    if (idx === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Play/Pause Toggle
function playPause() {
  if (!audio.src) {
    // Agar koi source nahi ha to pehla song load karein
    playSong(currentSong);
    return;
  }

  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "▶️";
  } else {
    audio.play().catch(err => console.log(err));
    playBtn.textContent = "⏸";
  }
  isPlaying = !isPlaying;
}

// Next Song
function nextSong() {
  if (currentList.length === 0) return;
  currentSong = (currentSong + 1) % currentList.length;
  playSong(currentSong);
}

// Previous Song
function prevSong() {
  if (currentList.length === 0) return;
  currentSong = (currentSong - 1 + currentList.length) % currentList.length;
  playSong(currentSong);
}

// Global API Search Function
async function searchSongsFromNetwork(query) {
  if (!query) {
    currentList = defaultSongs;
    currentSong = 0;
    loadPlaylist(defaultSongs);
    title.textContent = "Select a song";
    return;
  }

  title.textContent = "Searching online...";
  
  try {
    // iTunes Music API query (limit 15 tracks)
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`);
    const data = await response.json();
    
    // API data mapping
    currentList = data.results.map(track => ({
      name: `${track.trackName} - ${track.artistName}`,
      file: track.previewUrl // official 30 seconds high-quality preview audio stream
    }));

    if (currentList.length === 0) {
      playlist.innerHTML = "<li style='color: #ff4d4d; text-align:center;'>No songs found online.</li>";
      title.textContent = "No results";
    } else {
      currentSong = 0;
      loadPlaylist(currentList);
      title.textContent = `Found ${currentList.length} tracks online`;
    }
  } catch (error) {
    console.error("Error fetching from API:", error);
    title.textContent = "Network Error";
  }
}

// Event Listeners
volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

audio.addEventListener("timeupdate", () => {
  const { duration, currentTime } = audio;
  if (!duration) return;
  
  const percent = (currentTime / duration) * 100;
  progress.style.width = percent + "%";

  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

// Click to seek progress
function setProgress(e) {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  if (audio.duration) {
    audio.currentTime = (clickX / width) * audio.duration;
  }
}

// Format Time Utility
function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

// Debounced Search Event Listener
let searchTimeout;
search.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const value = search.value.trim();
  
  // User ke typing stop karne ke 400ms baad hit karega
  searchTimeout = setTimeout(() => {
    searchSongsFromNetwork(value);
  }, 400);
});

// Controls Event Listeners (Instead of HTML onclick)
playBtn.addEventListener("click", playPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
progressContainer.addEventListener("click", setProgress);

// Autoplay Next Song when current ends
audio.addEventListener("ended", nextSong);

// Initialize Application
loadPlaylist(currentList);
if (currentList[currentSong]) {
  title.textContent = currentList[currentSong].name;
  audio.src = currentList[currentSong].file;
}