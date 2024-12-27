// Base URL for raw GitHub content
const BASE_URL = "https://raw.githubusercontent.com/IPTVSolutions/IPTV_Online/master/playlists/";

// List of available playlists
const playlists = [
<<<<<<< HEAD
  { name: "All TV", file: "playlist_all.m3u8" },
=======
  { name: "Turkey", file: "playlist_turkey.m3u8" },
  { name: "Bulgaria", file: "playlist_bulgaria.m3u8" },
  { name: "Adult", file:
"playlist_adult.m3u8" },
>>>>>>> 5a521b01169d8cd16b4747d966ce37ecaf0fb49a
];

// Populate the dropdown menu
const categorySelect = document.getElementById("categorySelect");
playlists.forEach((playlist) => {
  const option = document.createElement("option");
  option.value = playlist.file;
  option.textContent = playlist.name;
  categorySelect.appendChild(option);
});

// Start by automatically selecting the first playlist and loading the first stream
categorySelect.selectedIndex = 0; // Select the first playlist
fetchM3U(`${BASE_URL}${playlists[0].file}`);

// Event listener for playlist selection
categorySelect.addEventListener("change", (event) => {
  const file = event.target.value;
  if (file) {
    fetchM3U(`${BASE_URL}${file}`);
  } else {
    document.getElementById("playlist").innerHTML = ""; // Clear playlist
  }
});

// Fetch and parse M3U content
function fetchM3U(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${url}`);
      }
      return response.text();
    })
    .then((content) => parseM3U(content))
    .catch((error) => {
      console.error(error);
      alert("Failed to load playlist. Please try again.");
    });
}

// Parse M3U content with metadata
function parseM3U(content) {
  const lines = content.split("\n");
  const playlist = document.getElementById("playlist");
  playlist.innerHTML = ""; // Clear previous items

  let currentChannel = null;
  const channels = []; // Store channels to switch later
  lines.forEach((line) => {
    if (line.startsWith("#EXTINF")) {
      // Extract metadata
      const metadata = line.match(/#EXTINF:-1.*?(tvg-logo="(.*?)")?.*?,(.*)/);
      if (metadata) {
        const [, , logo, name] = metadata;
        currentChannel = { name: name.trim(), logo: logo ? logo.trim() : null };
      }
    } else if (line && !line.startsWith("#")) {
      // This is the stream URL
      if (currentChannel) {
        currentChannel.url = line.trim();
        channels.push(currentChannel);
        createChannelItem(currentChannel, playlist);
        currentChannel = null; // Reset for the next channel
      }
    }
  });

  // Start with the first channel (if available)
  if (channels.length > 0) {
    playStream(channels[0].url); // Play the first channel automatically
    setChannelNavigation(channels); // Set up the key navigation
  }
}

// Create a list item for a channel
function createChannelItem(channel, playlist) {
  const li = document.createElement("li");
  li.className = "channel";

  const logo = channel.logo
    ? `<img src="${channel.logo}" alt="${channel.name}" class="channel-logo">`
    : "";
  li.innerHTML = `${logo}<span class="channel-name">${channel.name}</span>`;
  li.addEventListener("click", () => playStream(channel.url));

  playlist.appendChild(li);
}

// Play the selected stream
function playStream(url) {
  const videoPlayer = document.getElementById("videoPlayer");
  console.log("Attempting to play stream from URL:", url); // Log the URL to verify it's correct

  // Check if the browser supports HLS natively
  if (Hls.isSupported()) {
    const hls = new Hls();

    // Add event listeners for HLS.js errors
    hls.on(Hls.Events.ERROR, function(event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Network error occurred while fetching the manifest");
            alert("Network error occurred while fetching the manifest.");
            break;
          case Hls.ErrorTypes.MANIFEST_LOAD_ERROR:
            console.error("Manifest loading failed. This could be a CORS issue or invalid URL");
            alert("Manifest loading failed. This could be a CORS issue or invalid URL.");
            break;
          case Hls.ErrorTypes.MANIFEST_LOAD_TIMEOUT:
            console.error("Manifest load timed out");
            alert("Manifest load timed out. Please try again.");
            break;
          case Hls.ErrorTypes.OTHER_ERROR:
            console.error("An unexpected error occurred:", data);
            alert("An unexpected error occurred. Please try again.");
            break;
          default:
            console.error("Unknown error occurred:", data);
        }
      }
    });

    // Load the stream URL
    hls.loadSource(url);
    hls.attachMedia(videoPlayer);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log("HLS Manifest Parsed, playing stream...");
      videoPlayer.play().catch((error) => {
        console.error("Error playing the stream:", error);
        alert("Failed to play the stream. Please try again.");
      });
    });
  } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
    // If the browser supports HLS natively (e.g., Safari)
    console.log("Native HLS support detected.");
    videoPlayer.src = url;
    videoPlayer.play().catch((error) => {
      console.error("Error playing the stream:", error);
      alert("Failed to play the stream. Please try again.");
    });
  } else {
    console.error("HLS.js is not supported in this browser.");
    alert("Your browser does not support HLS streaming.");
  }
}

// Function to set up channel navigation with arrow keys
function setChannelNavigation(channels) {
  let currentIndex = 0; // Start with the first channel
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      // Move to the next channel
      currentIndex = (currentIndex + 1) % channels.length;
      playStream(channels[currentIndex].url);
    } else if (event.key === "ArrowUp") {
      // Move to the previous channel
      currentIndex = (currentIndex - 1 + channels.length) % channels.length;
      playStream(channels[currentIndex].url);
    }
  });
}
