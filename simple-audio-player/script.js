// Default tracks (100% full working direct links)
let defaultSongs = [
  { name: "Pasoori - Ali Sethi x Shae Gill", file: "https://pub-c5e31b5cdafb419a821a615712e6b010.r2.dev/Pasoori.mp3" },
  { name: "Dil Diyan Gallan - Atif Aslam", file: "https://pub-c5e31b5cdafb419a821a615712e6b010.r2.dev/Dil-Diyan-Gallan.mp3" },
  { name: "Tum Hi Ho - Arijit Singh", file: "https://pub-c5e31b5cdafb419a821a615712e6b010.r2.dev/Tum-Hi-Ho.mp3" }
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

function loadPlaylist(list) {
  currentList = list;
  playlist.innerHTML = "";

  list.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>🎵 ${song.name}</span> <small style='float:right; opacity:0.6; font-size:11px;'>Full Song</small>`;
    if (index === currentSong) li.classList.add("active");
    li.onclick = () => playSong(index);
    playlist.appendChild(li);
  });
}

function playSong(index) {
  if (currentList.length === 0 || !currentList[index]) return;
  
  currentSong = index;
  audio.src = currentList[index].file;
  title.textContent = currentList[index].name;
  
  audio.play().then(() => {
    isPlaying = true;
    playBtn.textContent = "⏸";
  }).catch(err => {
    console.log("Playback error:", err);
  });

  localStorage.setItem("lastSong", index);
  
  const items = playlist.querySelectorAll("li");
  items.forEach((item, idx) => {
    if (idx === index) item.classList.add("active");
    else item.classList.remove("active");
  });
}

function playPause() {
  if (!audio.src) {
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

function nextSong() {
  if (currentList.length === 0) return;
  currentSong = (currentSong + 1) % currentList.length;
  playSong(currentSong);
}

function prevSong() {
  if (currentList.length === 0) return;
  currentSong = (currentSong - 1 + currentList.length) % currentList.length;
  playSong(currentSong);
}

// Live Search with Local Fallback (Taarqi network browser ko block na kare)
async function fetchLiveSongs(query) {
  if (!query) {
    loadPlaylist(defaultSongs);
    if (defaultSongs[currentSong]) title.textContent = defaultSongs[currentSong].name;
    return;
  }

  title.textContent = "Searching full tracks...";

  try {
    const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=15`);
    
    if (!response.ok) throw new Error("CORS or Network Blocked");
    
    const resData = await response.json();

    if (resData.success && resData.data.results && resData.data.results.length > 0) {
      currentList = resData.data.results.map(track => {
        const downloadUrl = track.downloadUrl && track.downloadUrl.length > 0 
          ? track.downloadUrl[track.downloadUrl.length - 1].url 
          : "";
        return {
          name: `${track.name} - ${track.artists.primary[0]?.name || 'Unknown'}`,
          file: downloadUrl
        };
      }).filter(item => item.file !== "");

      currentSong = 0;
      loadPlaylist(currentList);
      title.textContent = `Results for "${query}"`;
    } else {
      // Fallback to local search if no results on API
      localFilter(query);
    }
  } catch (error) {
    console.log("API Localhost Blocked, Switching to Local Search Mode");
    localFilter(query);
  }
}

// Local Filter Function (Network error par crash hone se bachayega)
function localFilter(query) {
  const filtered = defaultSongs.filter(song => 
    song.name.toLowerCase().includes(query.toLowerCase())
  );
  currentSong = 0;
  loadPlaylist(filtered);
  title.textContent = filtered.length > 0 ? "Found in backup list" : "Local: No songs found";
}

// Event Listeners
volume.addEventListener("input", () => { audio.volume = volume.value; });

audio.addEventListener("timeupdate", () => {
  const { duration, currentTime } = audio;
  if (!duration) return;
  const percent = (currentTime / duration) * 100;
  progress.style.width = percent + "%";
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

function setProgress(e) {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  if (audio.duration) audio.currentTime = (clickX / width) * audio.duration;
}

function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

let searchTimeout;
search.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const value = search.value.trim();
  searchTimeout = setTimeout(() => {
    fetchLiveSongs(value);
  }, 500);
});

playBtn.addEventListener("click", playPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
progressContainer.addEventListener("click", setProgress);
audio.addEventListener("ended", nextSong);

// Start App
loadPlaylist(currentList);
if (currentList[currentSong]) {
  title.textContent = currentList[currentSong].name;
  audio.src = currentList[currentSong].file;
}