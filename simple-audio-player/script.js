const songs = [
  { name: "Song 1", file: "songs/audio1.mpeg" },
  { name: "Song 2", file: "songs/audio2.mpeg" },
  { name: "Song 3", file: "songs/audio3.mpeg" },
  { name: "Song 4", file: "songs/audio4.mpeg" },
  { name: "Song 5", file: "songs/audio5.mpeg" }
];
let currentList = songs;
let currentSong = localStorage.getItem("lastSong") || 0;
let isPlaying = false;

const audio = document.getElementById("audio");
const title = document.getElementById("title");
const playlist = document.getElementById("playlist");
const search = document.getElementById("search");
const volume = document.getElementById("volume");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");

const currentTimeEl = document.getElementById("current");
const durationEl = document.getElementById("duration");

// Load Playlist
function loadPlaylist(list) {
  currentList = list;
  playlist.innerHTML = "";

  list.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    if (index == currentSong) li.classList.add("active");
    li.onclick = () => playSong(index);
    playlist.appendChild(li);
  });
}

// Play Song
function playSong(index) {
  currentSong = index;
  audio.src = currentList[index].file;
  title.textContent = currentList[index].name;
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";

  localStorage.setItem("lastSong", index);
  loadPlaylist(currentList);
}

// Play/Pause
function playPause() {
  if (!audio.src) return;

  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "▶️";
  } else {
    audio.play();
    playBtn.textContent = "⏸";
  }
  isPlaying = !isPlaying;
}

// Next/Prev
function nextSong() {
  currentSong = (parseInt(currentSong) + 1) % songs.length;
  playSong(currentSong);
}

function prevSong() {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  playSong(currentSong);
}

// Volume
volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

// Progress Update
audio.addEventListener("timeupdate", () => {
  const { duration, currentTime } = audio;
  const percent = (currentTime / duration) * 100;
  progress.style.width = percent + "%";

  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

// Click to seek
function setProgress(e) {
  const width = e.currentTarget.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
}

// Format Time
function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

// Search
search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  const filtered = songs.filter(song =>
    song.name.toLowerCase().includes(value)
  );
loadPlaylist(filtered);
});

// Init
loadPlaylist(songs);