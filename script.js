


const playButton = document.getElementById("play");
let currentfolder = 'english';
let currentsong = new Audio();
let songs = [];

// Format time in mm:ss format
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fetch and update song list
async function GetSongs(folder) {

    currentfolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:5501/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");

        songs = [];
        for (let element of as) {
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href)); // Decode URL encoded song names
            }
        }

        if (songs.length === 0) {
            console.error("No songs found in the directory.");
            return [];
        }

        let songUL = document.querySelector(".song_list ul");
        songUL.innerHTML = '';

        for (let song of songs) {
            const songName = song.split(`/${currentfolder}/`)[1]?.replace(".mp3", "");
            if (songName) {
                songUL.innerHTML += `
                    <li>
                        <img class="invert" src="./img/music.svg" alt="image">
                        <div class="info w-1 overflow-hidden">
                            <div class="songName text-nowrap">${songName}</div>
                            <div class="songArtist">Unknown Artist</div>
                        </div>
                        <div class="playnow flex justify-between items-center gap-[10px] p-4">
                            <span class="text-[15px] w-16 p-3 text-nowrap">Play Now</span>
                            <img class="invert" src="./img/play.svg" alt="play icon">
                        </div>
                    </li>`;
            }
        }

        // Attach click event to each song in the list
        document.querySelectorAll(".song_list li").forEach((li, index) => {
            li.addEventListener("click", () => {
                playmusic(index); // Play the selected song by index
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Play a specific track by index
function playmusic(index, pause = false) {
    if (index < 0 || index >= songs.length) {
        console.error("Invalid song index.");
        return;
    }

    let track = songs[index].split(`/${currentfolder}/`)[1]?.replace(".mp3", "");
    currentsong.src = `/${currentfolder}/` + track + ".mp3";

    if (!pause) {
        currentsong.play();
        playButton.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").textContent = decodeURI(track);
    document.querySelector(".songTime").textContent = "00:00 / 00:00";
}

async function displayAlbum() {
    let response = await fetch(`http://127.0.0.1:5501/songs/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let albumLinks = [];

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        let ehref = e.href;
        if (ehref.includes("/songs/")) {
            let folder = ehref.split("/").slice(-1)[0];

            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
            let albumData = await a.json();
            let CardContainer = document.querySelector(".card-container");

            CardContainer.innerHTML = CardContainer.innerHTML + `
                <div class="card w-[200px] p-[10px] rounded-[7px] bg-[#252525] cursor-pointer relative group opacity-80 transition-all duration-900 hover:bg-[#464646] hover:opacity-100" data-folder="${folder}">
                    <div class="play-button z-10 flex justify-center items-center absolute bottom-1/4 right-4 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:bottom-1/3">
                        <div class="play-icon size-9 flex justify-center items-center rounded-3xl bg-[#1fdf64]">
                            <img class="pl-[5px] w-[30px] h-[30px]" src="./img/images-removebg-preview.png" alt="play">
                        </div>
                    </div>
                    <img class="w-full object-contain rounded-[10px] z-0" src="./songs/${folder}/cover.jpg" alt="Album Cover">
                    <h2 class="text-3xl">${albumData.title}</h2>
                    <p>${albumData.description}</p>
                </div>
            `;

            albumLinks.push(ehref);
        }
    }

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", async (event) => {
            const folderName = event.currentTarget.dataset.folder;
            let songs = await GetSongs(`songs/${folderName}`);

            if (songs.length > 0) {
                playmusic(0);
            }
        });
    });

   
}



// Initialize the player
async function main() {
    await GetSongs(`songs/${currentfolder}`);

    //Display all the albums on the page
    displayAlbum();


    if (songs.length > 0) {
        playmusic(0, true); // Load the first song without playing
    }

    // Play/Pause Button
    playButton.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playButton.src = "img/pause.svg";
        } else {
            currentsong.pause();
            playButton.src = "img/play.svg";
        }
    });

    // Update song progress
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").textContent = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seekbar click event
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // Hamburger Menu Toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous Button
    document.getElementById("previous").addEventListener("click", () => {
        if (songs.length === 0) return;

        let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop().replace(".mp3", ""));
        let index = songs.findIndex(song => decodeURIComponent(song).includes(currentSongFile));

        if (index === -1) return;

        let previousIndex = (index - 1 + songs.length) % songs.length; // Circular navigation
        playmusic(previousIndex);
    });

    // Next Button
    document.getElementById("next").addEventListener("click", () => {
        if (songs.length === 0) return;

        let currentSongFile = decodeURIComponent(currentsong.src.split("/").pop().replace(".mp3", ""));
        let index = songs.findIndex(song => decodeURIComponent(song).includes(currentSongFile));

        if (index === -1) return;

        let nextIndex = (index + 1) % songs.length; // Circular navigation
        playmusic(nextIndex);
    });

    let volumeSlider = document.querySelector(".range input"); // Select the volume slider
    let volumeIcon = document.querySelector(".volume_icon"); // Select the volume icon
    let lastVolume = 0.5; // Store the last volume before muting (default 50%)

    // Ensure volume slider exists
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            let volume = parseInt(e.target.value) / 100;
            currentsong.volume = volume;

            // Save the last volume before muting
            if (volume > 0) {
                lastVolume = volume;
            }

            // Update the volume icon based on volume level
            volumeIcon.src = volume === 0 ? "img/mute.svg" : "img/volume.svg";
        });
    }

    // Ensure volume icon exists before adding event listener
    if (volumeIcon) {
        volumeIcon.addEventListener("click", () => {
            if (currentsong.volume > 0) {
                // Store last volume before muting
                lastVolume = currentsong.volume;
                currentsong.volume = 0;
                volumeSlider.value = 0; // Update slider to reflect mute
                volumeIcon.src = "img/mute.svg"; // Change icon to mute
            } else {
                // Restore last volume before mute
                currentsong.volume = lastVolume;
                volumeSlider.value = lastVolume * 100; // Update slider to reflect volume
                volumeIcon.src = "img/volume.svg"; // Change icon to volume
            }
        });
    }




}

// Start the application
main();
