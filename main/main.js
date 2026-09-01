/* =====================================================
   SHARODIA - DURGA PUJA WEBSITE
===================================================== */


/* =====================================================
   1. DYNAMIC BACKGROUND + CLOCK
===================================================== */

const bgLayer =
    document.getElementById("bgLayer");

const timeBadge =
    document.getElementById("timeBadge");


/*
   IMPORTANT:

   main.html
   ├── main/
   │   └── main.html
   │
   └── image/
       ├── early morning.png
       ├── morning.png
       ├── afternoon.png
       ├── evening.png
       └── mid night.png

   Therefore ../image/ is correct.
*/

const backgrounds = {

    "early-morning":
        "../image/early morning.png",

    "morning":
        "../image/morning.png",

    "afternoon":
        "../image/afternoon.png",

    "evening":
        "../image/evening.png",

    "mid-night":
        "../image/mid night.png"

};


const timeLabels = {

    "early-morning":
        "Early Morning",

    "morning":
        "Morning",

    "afternoon":
        "Afternoon",

    "evening":
        "Evening",

    "mid-night":
        "Mid Night"

};


/* =====================================================
   GET TIME PERIOD
===================================================== */

function getTimePeriod(hour) {

    if (hour >= 5 && hour < 9) {
        return "early-morning";
    }

    if (hour >= 9 && hour < 12) {
        return "morning";
    }

    if (hour >= 13 && hour < 16) {
        return "afternoon";
    }

    if (hour >= 17 && hour < 20) {
        return "evening";
    }

    return "mid-night";

}


/* =====================================================
   FORMAT CLOCK
===================================================== */

function getFormattedTime(date) {

    let hour =
        date.getHours();

    const minute =
        date.getMinutes();

    const second =
        date.getSeconds();


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {
        hour = 12;
    }


    const formattedHour =
        String(hour).padStart(2, "0");


    const formattedMinute =
        String(minute).padStart(2, "0");


    const formattedSecond =
        String(second).padStart(2, "0");


    return `${formattedHour}:${formattedMinute}:${formattedSecond} ${ampm}`;

}


/* =====================================================
   UPDATE BACKGROUND + CLOCK
===================================================== */

function updateBackground() {

    const now =
        new Date();


    const hour =
        now.getHours();


    const period =
        getTimePeriod(hour);


    /* ================================================
       BACKGROUND
    ================================================ */

    if (bgLayer) {

        const image =
            backgrounds[period];


        if (image) {

            bgLayer.style.backgroundImage =
                `url("${image}")`;

        }

    }


    /* ================================================
       CLOCK
    ================================================ */

    if (timeBadge) {

        const formattedTime =
            getFormattedTime(now);


        timeBadge.textContent =
            `${timeLabels[period]} • ${formattedTime}`;

    }

}


/* =====================================================
   2. NAVIGATION
===================================================== */

const menuToggle =
    document.getElementById("menuToggle");

const nav =
    document.querySelector("nav");


if (menuToggle && nav) {

    menuToggle.addEventListener(
        "click",
        () => {

            nav.classList.toggle("open");

        }
    );

}


/* =====================================================
   3. SMOOTH NAVIGATION
===================================================== */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        targetId &&
                        targetId !== "#"
                    ) {

                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();


                            target.scrollIntoView({
                                behavior: "smooth"
                            });

                        }

                    }


                    if (nav) {

                        nav.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   4. CURRENT YEAR
===================================================== */

const year =
    document.getElementById("year");


if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =====================================================
   5. PUJA COUNTDOWN
===================================================== */

const countdown =
    document.getElementById("countdown");


function updateCountdown() {

    if (!countdown) {
        return;
    }


    /*
       Durga Puja 2026
       Target:
       October 17, 2026
    */

    const target =
        new Date(
            "2026-10-17T00:00:00+05:30"
        );


    const now =
        new Date();


    const difference =
        target - now;


    if (difference <= 0) {

        countdown.textContent =
            "শুভ দুর্গাপূজা!";

        return;

    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (
                difference %
                (1000 * 60 * 60 * 24)
            ) /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (
                difference %
                (1000 * 60 * 60)
            ) /
            (1000 * 60)
        );


    const seconds =
        Math.floor(
            (
                difference %
                (1000 * 60)
            ) /
            1000
        );


    countdown.textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


/* =====================================================
   6. MUSIC API
===================================================== */

const API_URL = "https://durga-puja-backend-xl9o.onrender.com";


let songs = [];
let currentIndex = 0;
let isPlaying = false;


const audio = new Audio();


const songList =
    document.getElementById("songList");

const playBtn =
    document.getElementById("playBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const nowTitle =
    document.getElementById("nowTitle");

const nowArtist =
    document.getElementById("nowArtist");

const vinyl =
    document.getElementById("vinyl");


/* =====================================================
   GET SONG URL
===================================================== */

function getSongURL(song) {

    if (!song || !song.url) {

        console.error("Song URL is missing:", song);

        return "";

    }


    const url = String(song.url);


    /*
       If API already sends a complete URL
    */

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {

        return url;

    }


    /*
       API sends something like:
       /songs/song.mp3
    */

    if (url.startsWith("/")) {

        return API_URL + url;

    }


    /*
       API sends something like:
       songs/song.mp3
    */

    return API_URL + "/" + url;

}


/* =====================================================
   LOAD SONGS FROM FASTAPI
===================================================== */

async function loadSongs() {

    console.log("Loading songs from:", API_URL + "/api/songs");


    if (!songList) {

        console.error("songList element not found!");

        return;

    }


    songList.innerHTML = `
        <div class="loading-songs">
            Loading Pujo Songs... 🎵
        </div>
    `;


    try {

        const response = await fetch(
            `${API_URL}/api/songs`
        );


        console.log(
            "API Response Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Server returned error ${response.status}`
            );

        }


  const data =
    await response.json();


console.log(
    "Songs received from API:",
    data
);


/*
   FastAPI returns:

   {
       total: 11,
       songs: [...]
   }

   So we need to access data.songs
*/


if (
    !data ||
    !Array.isArray(data.songs)
) {

    throw new Error(
        "API response does not contain a songs array"
    );

}


/*
   Store the songs array
*/

songs =
    data.songs;


        /*
           Clear loading message
        */

        songList.innerHTML = "";


        /*
           No songs available
        */

        if (songs.length === 0) {

            songList.innerHTML = `
                <div class="loading-songs">
                    No Pujo songs available 🎵
                </div>
            `;

            return;

        }


        /*
           Create Song List
        */

        songs.forEach(
            (song, index) => {


                const item =
                    document.createElement("article");


                item.className =
                    "song-item";


                item.dataset.index =
                    index;


                /*
                   PLAY BUTTON
                */

                const smallPlay =
                    document.createElement("button");


                smallPlay.type =
                    "button";


                smallPlay.className =
                    "play-btn";


                smallPlay.textContent =
                    "▶";


                smallPlay.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        playSong(index);

                    }
                );


                /*
                   SONG NUMBER
                */

                const number =
                    document.createElement("div");


                number.className =
                    "song-number";


                number.textContent =
                    String(index + 1)
                        .padStart(2, "0");


                /*
                   SONG INFORMATION
                */

                const meta =
                    document.createElement("div");


                meta.className =
                    "song-meta";


                const title =
                    document.createElement("strong");


                title.textContent =
                    song.title || "Unknown Song";


                const artist =
                    document.createElement("span");


                artist.textContent =
                    song.artist ||
                    "Sharodia • Durga Puja";


                meta.appendChild(title);

                meta.appendChild(artist);


                /*
                   MP3 LABEL
                */

                const duration =
                    document.createElement("span");


                duration.className =
                    "song-duration";


                duration.textContent =
                    "MP3";


                /*
                   ADD TO SONG ITEM
                */

                item.appendChild(smallPlay);

                item.appendChild(number);

                item.appendChild(meta);

                item.appendChild(duration);


                /*
                   CLICK SONG
                */

                item.addEventListener(
                    "click",
                    () => {

                        playSong(index);

                    }
                );


                songList.appendChild(item);

            }
        );


        /*
           SET FIRST SONG DETAILS
        */

        currentIndex = 0;


        if (nowTitle) {

            nowTitle.textContent =
                songs[0].title ||
                "Select a song";

        }


        if (nowArtist) {

            nowArtist.textContent =
                songs[0].artist ||
                "Sharodia • Durga Puja";

        }


        console.log(
            "Songs successfully loaded:",
            songs.length
        );


        updatePlayerUI();

    }


    catch (error) {

        console.error(
            "Unable to load songs:",
            error
        );


        if (songList) {

            songList.innerHTML = `
                <div class="loading-songs">
                    Unable to load Pujo Songs 🎵
                    <br>
                    <small>
                        Please check the FastAPI server.
                    </small>
                </div>
            `;

        }

    }

}


/* =====================================================
   PLAY SONG
===================================================== */

function playSong(index) {

    if (!songs.length) {

        console.error("No songs available");

        return;

    }


    if (!songs[index]) {

        console.error(
            "Song not found at index:",
            index
        );

        return;

    }


    currentIndex = index;


    const song = songs[index];


    const songURL =
        getSongURL(song);


    console.log(
        "Playing song:",
        song.title
    );


    console.log(
        "Song URL:",
        songURL
    );


    if (!songURL) {

        return;

    }


    /*
       Set Audio Source
    */

    audio.src =
        songURL;


    audio.load();


    /*
       Update Song Information
    */

    if (nowTitle) {

        nowTitle.textContent =
            song.title ||
            "Unknown Song";

    }


    if (nowArtist) {

        nowArtist.textContent =
            song.artist ||
            "Sharodia • Durga Puja";

    }


    /*
       Play Audio
    */

    audio.play()

        .then(() => {

            isPlaying = true;

            updatePlayerUI();

        })

        .catch(error => {

            console.error(
                "Audio play error:",
                error
            );


            isPlaying = false;

            updatePlayerUI();

        });


    /*
       Highlight Current Song
    */

    document
        .querySelectorAll(".song-item")
        .forEach(item => {

            item.classList.remove("playing");

        });


    const selectedItem =
        document.querySelector(
            `.song-item[data-index="${index}"]`
        );


    if (selectedItem) {

        selectedItem.classList.add(
            "playing"
        );

    }

}


/* =====================================================
   UPDATE PLAYER UI
===================================================== */

function updatePlayerUI() {


    /*
       MAIN PLAY BUTTON
    */

    if (playBtn) {

        playBtn.textContent =
            isPlaying
                ? "⏸"
                : "▶";

    }


    /*
       LOGO ANIMATION
    */

    if (vinyl) {

        if (isPlaying) {

            vinyl.classList.add(
                "playing"
            );

        }

        else {

            vinyl.classList.remove(
                "playing"
            );

        }

    }


    /*
       SONG PLAY BUTTONS
    */

    document
        .querySelectorAll(".song-item")
        .forEach(item => {


            const index =
                Number(
                    item.dataset.index
                );


            const button =
                item.querySelector(
                    ".play-btn"
                );


            if (button) {

                if (
                    isPlaying &&
                    index === currentIndex
                ) {

                    button.textContent =
                        "⏸";

                }

                else {

                    button.textContent =
                        "▶";

                }

            }

        });

}


/* =====================================================
   PLAY / PAUSE BUTTON
===================================================== */

if (playBtn) {

    playBtn.addEventListener(
        "click",
        () => {


            if (!songs.length) {

                console.log(
                    "Songs are still loading"
                );

                return;

            }


            /*
               If no song selected yet
            */

            if (!audio.src) {

                playSong(currentIndex);

                return;

            }


            /*
               PAUSE
            */

            if (isPlaying) {

                audio.pause();


                isPlaying = false;


                updatePlayerUI();


                return;

            }


            /*
               PLAY
            */

            audio.play()

                .then(() => {
z
                    isPlaying = true;

                    updatePlayerUI();

                })

                .catch(error => {

                    console.error(
                        "Audio play error:",
                        error
                    );

                });

        }
    );

}


/* =====================================================
   PREVIOUS SONG
===================================================== */

if (prevBtn) {

    prevBtn.addEventListener(
        "click",
        () => {


            if (!songs.length) {

                return;

            }


            let previousIndex =
                currentIndex - 1;


            if (previousIndex < 0) {

                previousIndex =
                    songs.length - 1;

            }


            playSong(previousIndex);

        }
    );

}


/* =====================================================
   NEXT SONG
===================================================== */

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        () => {


            if (!songs.length) {

                return;

            }


            let nextIndex =
                currentIndex + 1;


            if (
                nextIndex >= songs.length
            ) {

                nextIndex = 0;

            }


            playSong(nextIndex);

        }
    );

}


/* =====================================================
   SONG ENDED
===================================================== */

audio.addEventListener(
    "ended",
    () => {


        if (!songs.length) {

            return;

        }


        let nextIndex =
            currentIndex + 1;


        if (
            nextIndex >= songs.length
        ) {

            nextIndex = 0;

        }


        playSong(nextIndex);

    }
);


/* =====================================================
   AUDIO ERROR
===================================================== */

audio.addEventListener(
    "error",
    () => {

        console.error(
            "Audio error:",
            audio.src
        );


        isPlaying = false;

        updatePlayerUI();

    }
);

/* =====================================================
   7. PUJA ROUTE
===================================================== */


/* =====================================================
   METRO DATA
===================================================== */

const metroData = {

    blue: {

        name: "Blue Line",

        stations: [

            {
                name: "Dakshineswar",
                pandals: [
                    "Dakshineswar Puja",
                    "Nearby Local Puja"
                ]
            },

            {
                name: "Baranagar",
                pandals: [
                    "Baranagar Famous Puja",
                    "Nearby Community Puja"
                ]
            },

            {
                name: "Noapara",
                pandals: [
                    "Noapara Puja",
                    "Nearby Puja Pandal"
                ]
            },

            {
                name: "Dum Dum",
                pandals: [
                    "Dum Dum Park Puja",
                    "Nearby Famous Puja"
                ]
            },

            {
                name: "Belgachhiya",
                pandals: [
                    "Dum Dum Park Puja",
                    "Nearby Famous Puja"
                ]
            },
            
            {
                name: "Shyambazar",
                pandals: [
                    "Shyambazar Famous Puja",
                    "Nearby North Kolkata Puja"
                ]
            },

            {
                name: "Shobhabazar Sutanuti",
                pandals: [
                    "Sovabazar Rajbari",
                    "Nearby Traditional Puja"
                ]
            },

            {
                name: "Girish Park",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "MG Road",
                pandals: [
                    "MG Road Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Central",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Chadni Chowk",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Esplanade",
                pandals: [
                    "Central Kolkata Puja",
                    "Nearby Famous Puja"
                ]
            },

            {
                name: "Park Street",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Maiden",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Rabindra Sadan",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Netaji Bhavan",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Jatin Das Park",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Kalighat",
                pandals: [
                    "Kalighat Puja",
                    "Nearby South Kolkata Puja"
                ]
            },

            {
                name: "Rabindra Sarobar",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Mahanayak Uttam Kumar",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Netaji",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Masterda Surya Sen",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Gitanjali",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Kavi Nazrul",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Sahid Khudiram",
                pandals: [
                    "Girish Park Puja",
                    "Nearby Central Kolkata Puja"
                ]
            }
        ]

    },


    orange: {

        name: "Orange Line",

        stations: [

            {
                name: "Kavi Subhash",
                pandals: [
                    "New Garia Puja",
                    "Nearby South Kolkata Puja"
                ]
            },

            {
                name: "Hemanta Mukhopadhyay",
                pandals: [
                    "Nearby Famous Puja",
                    "Community Puja"
                ]
            },

            {
                name: "Beleghata",
                pandals: [
                    "Beleghata Famous Puja",
                    "Nearby Puja Pandal"
                ]
            }
        ]

    },


    green: {

        name: "Green Line",

        stations: [

            {
                name: "Howrah Maidan",
                pandals: [
                    "Howrah Maidan Puja",
                    "Nearby Howrah Puja"
                ]
            },

            {
                name: "Howrah",
                pandals: [
                    "Howrah Famous Puja",
                    "Nearby Howrah Puja"
                ]
            },

            {
                name: "Mahakaran",
                pandals: [
                    "BBD Bagh Puja",
                    "Nearby Central Kolkata Puja"
                ]
            },

            {
                name: "Esplanade",
                pandals: [
                    "Central Kolkata Puja",
                    "Nearby Famous Puja"
                ]
            },

            {
                name: "Sealdah",
                pandals: [
                    "Sealdah Puja",
                    "Nearby Famous Puja"
                ]
            },

            {
                name: "Salt Lake Sector V",
                pandals: [
                    "Salt Lake Puja",
                    "Nearby Community Puja"
                ]
            }

        ]

    },


    purple: {

        name: "Purple Line",

        stations: [

            {
                name: "Behala Bazar",
                pandals: [
                    "Amarendra Bhavan Durga Puja",
                    "Sonar Durga Bari",
                    "Behala Friends Club"
                ]
            },

            {
                name: "Behala Chowrasta",
                pandals: [
                    "Behala Natun Dal",
                    "Behala Natun Sangha"
                ]
            },

            {
                name: "Saker Bazar",
                pandals: [
                    "Barisha Club",
                    "Saker Bazar Sarbojanin"
                ]
            }

        ]

    }

};


/* =====================================================
   IMPORTANT STATIONS
===================================================== */

const importantStations = [

    {
        name: "Howrah Station",

        type: "RAILWAY STATION",

        pandals: [
            "Howrah Famous Puja",
            "Nearby Howrah Puja",
            "Traditional Community Puja"
        ]
    },

    {
        name: "Sealdah Station",

        type: "RAILWAY STATION",

        pandals: [
            "Sealdah Famous Puja",
            "Nearby Central Kolkata Puja",
            "Community Puja"
        ]
    },

    {
        name: "Kolkata Railway Station",

        type: "RAILWAY STATION",

        pandals: [
            "Nearby North Kolkata Puja",
            "Traditional Bengali Puja",
            "Community Puja"
        ]
    },

    {
        name: "Santragachi Station",

        type: "RAILWAY STATION",

        pandals: [
            "Santragachi Puja",
            "Nearby Howrah Puja"
        ]
    },

    {
        name: "Shalimar Station",

        type: "RAILWAY STATION",

        pandals: [
            "Shalimar Area Puja",
            "Nearby Community Puja"
        ]
    }

];


/* =====================================================
   ROUTE ELEMENTS
===================================================== */

const selectLineBtn =
    document.getElementById(
        "selectLineBtn"
    );


const lineMenu =
    document.getElementById(
        "lineMenu"
    );


const metroSearch =
    document.getElementById(
        "metroSearch"
    );


const metroStationList =
    document.getElementById(
        "metroStationList"
    );


const importantStationSearch =
    document.getElementById(
        "importantStationSearch"
    );


const importantStationList =
    document.getElementById(
        "importantStationList"
    );


const routeModal =
    document.getElementById(
        "routeModal"
    );


const routeModalClose =
    document.getElementById(
        "routeModalClose"
    );


const modalStationName =
    document.getElementById(
        "modalStationName"
    );


const modalStationType =
    document.getElementById(
        "modalStationType"
    );


const modalPandalList =
    document.getElementById(
        "modalPandalList"
    );


const modalMapButton =
    document.getElementById(
        "modalMapButton"
    );


let selectedMetroLine =
    null;


/* =====================================================
   SELECT METRO LINE
===================================================== */

if (
    selectLineBtn &&
    lineMenu
) {

    selectLineBtn.addEventListener(
        "click",
        () => {

            lineMenu.classList.toggle(
                "open"
            );

        }
    );

}


/* =====================================================
   LOAD METRO STATIONS
===================================================== */

function loadMetroStations(line) {

    const data =
        metroData[line];


    if (
        !data ||
        !metroStationList
    ) {

        return;

    }


    selectedMetroLine =
        line;


    if (selectLineBtn) {

        const text =
            selectLineBtn.querySelector(
                "span:first-child"
            );


        if (text) {

            text.textContent =
                data.name;

        }

    }


    if (metroSearch) {

        metroSearch.value =
            "";

    }


    renderMetroStations(
        data.stations
    );

}


/* =====================================================
   RENDER METRO STATIONS
===================================================== */

function renderMetroStations(
    stations
) {

    if (!metroStationList) {

        return;

    }


    metroStationList.innerHTML =
        "";


    if (
        !stations ||
        !stations.length
    ) {

        metroStationList.innerHTML = `
            <p class="station-placeholder">
                No station found.
            </p>
        `;

        return;

    }


    stations.forEach(
        (station, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "station-item";


            button.innerHTML = `
                <span class="station-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span>
                    ${station.name}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    openRouteModal(
                        station.name,
                        "METRO STATION",
                        station.pandals
                    );

                }
            );


            metroStationList.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   METRO SEARCH
===================================================== */

if (metroSearch) {

    metroSearch.addEventListener(
        "input",
        () => {

            if (!selectedMetroLine) {

                return;

            }


            const search =
                metroSearch.value
                    .toLowerCase()
                    .trim();


            const stations =
                metroData[
                    selectedMetroLine
                ].stations;


            const filtered =
                stations.filter(
                    station =>
                        station.name
                            .toLowerCase()
                            .includes(search)
                );


            renderMetroStations(
                filtered
            );

        }
    );

}


/* =====================================================
   METRO LINE BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".metro-line"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    loadMetroStations(
                        button.dataset.line
                    );


                    if (lineMenu) {

                        lineMenu.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   IMPORTANT STATIONS
===================================================== */

function renderImportantStations(
    stations
) {

    if (!importantStationList) {

        return;

    }


    importantStationList.innerHTML =
        "";


    if (
        !stations ||
        !stations.length
    ) {

        importantStationList.innerHTML = `
            <p class="station-placeholder">
                No station found.
            </p>
        `;

        return;

    }


    stations.forEach(
        (station, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "station-item";


            button.innerHTML = `
                <span class="station-number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span>
                    ${station.name}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    openRouteModal(
                        station.name,
                        station.type,
                        station.pandals
                    );

                }
            );


            importantStationList.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   IMPORTANT STATION SEARCH
===================================================== */

if (importantStationSearch) {

    importantStationSearch.addEventListener(
        "input",
        () => {

            const search =
                importantStationSearch.value
                    .toLowerCase()
                    .trim();


            const filtered =
                importantStations.filter(
                    station =>
                        station.name
                            .toLowerCase()
                            .includes(search)
                );


            renderImportantStations(
                filtered
            );

        }
    );

}


/* =====================================================
   OPEN ROUTE POPUP
===================================================== */

function openRouteModal(
    stationName,
    stationType,
    pandals
) {

    if (!routeModal) {

        return;

    }


    if (modalStationName) {

        modalStationName.textContent =
            stationName;

    }


    if (modalStationType) {

        modalStationType.textContent =
            stationType;

    }


    if (modalPandalList) {

        modalPandalList.innerHTML =
            "";


        if (
            pandals &&
            pandals.length
        ) {

            pandals.forEach(
                pandal => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "pandal-item";


                    item.textContent =
                        pandal;


                    modalPandalList.appendChild(
                        item
                    );

                }
            );

        }

    }


    if (modalMapButton) {

        modalMapButton.onclick =
            () => {

                const query =
                    encodeURIComponent(
                        stationName +
                        " Kolkata"
                    );


                window.open(
                    `https://www.google.com/maps/search/?api=1&query=${query}`,
                    "_blank"
                );

            };

    }


    routeModal.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   CLOSE ROUTE POPUP
===================================================== */

function closeRouteModal() {

    if (!routeModal) {

        return;

    }


    routeModal.classList.remove(
        "open"
    );


    document.body.style.overflow =
        "";

}


if (routeModalClose) {

    routeModalClose.addEventListener(
        "click",
        closeRouteModal
    );

}


/* =====================================================
   CLOSE POPUP BY OVERLAY
===================================================== */

if (routeModal) {

    const overlay =
        routeModal.querySelector(
            ".route-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeRouteModal
        );

    }

}


/* =====================================================
   CLOSE POPUP WITH ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            routeModal &&
            routeModal.classList.contains(
                "open"
            )
        ) {

            closeRouteModal();

        }

    }
);


/* =====================================================
   INITIALIZE IMPORTANT STATIONS
===================================================== */

renderImportantStations(
    importantStations
);


/* =====================================================
   8. CONTACT FORM
===================================================== */

const contactForm =
    document.getElementById(
        "contactForm"
    );


const formStatus =
    document.getElementById(
        "formStatus"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const nameInput =
                document.getElementById(
                    "name"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            if (formStatus) {

                formStatus.textContent =
                    `ধন্যবাদ, ${name || "বন্ধু"}! Your message has been received. ✨`;

            }


            contactForm.reset();

        }
    );

}


/* =====================================================
   9. START WEBSITE
===================================================== */


/*
   Load music from FastAPI.
*/

loadSongs();


/*
   Update background and clock immediately.
*/

updateBackground();


/*
   Update clock every second.
*/

setInterval(
    updateBackground,
    1000
);