// ==UserScript==
// @name         GGN No-Intro Helper
// @namespace    https://gazellegames.net/
// @version      1.0.0
// @description  Script that assists with No-Intro Uploads (https://gazellegames.net/forums.php?action=viewthread&threadid=26939)
// @author       brownbear49
// @match        https://gazellegames.net/upload.php*
// @match        https://gazellegames.net/torrents.php?action=edit*
// ==/UserScript==

// region mapping - KIV error checking
const REGIONS = {
    usa: "USA",
    europe: "Europe",
    japan: "Japan",
    asia: "Asia",
    australia: "Australia",
    france: "France",
    germany: "Germany",
    spain: "Spain",
    italy: "Italy",
    uk: "UK",
    netherlands: "Netherlands",
    sweden: "Sweden",
    russia: "Russia",
    china: "China",
    korea: "Korea",
    "hong kong": "Hong Kong",
    taiwan: "Taiwan",
    brazil: "Brazil",
    canada: "Canada",
    "japan, usa": "Japan, USA",
    "japan, europe": "Japan, Europe",
    "usa, europe": "USA, Europe",
    "europe, australia": "Europe, Australia",
    "japan, asia": "Japan, Asia",
    "uk, australia": "UK, Australia",
    world: "World",
    "region-free": "Region-Free",
    other: "other",
};

// language mapping
const LANGUAGES = {
    en: "English",
    de: "German",
    fr: "French",
    cs: "Czech",
    zh: "Chinese",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    pl: "Polish",
    pt: "Portugese",
    ru: "Russian",
    es: "Spanish",
};

// Returns region if found else null
function getRegion(str) {
    if (REGIONS[str.toLowerCase()] != null) {
        return REGIONS[str.toLowerCase()];
    } else return null;
}

// Returns language if found else null
function getLanguages(str) {
    const lower = str.toLowerCase();
    if (LANGUAGES[lower] != null) {
        return LANGUAGES[lower];
    }
    const split = lower.split(",");
    for (const e of split) {
        // if any of the strings are not languages we return null
        // potential bug - "Other"
        if (!LANGUAGES[e]) return null;
    }
    return "Multi-Language";
}

// returns [title, region, language]
function extractInfo(str) {
    const rx = /\(([^()]*)\)/g;
    // Isolate everything within brackets
    const split = [...str.matchAll(rx)];
    const answer = ["", "", ""];
    const toRemove = [];
    let foundRegion = false;
    let foundLanguage = false;

    for (let i = 0; i < split.length; i++) {
        const curr = split[i][1];
        if (!foundRegion) {
            const result = getRegion(curr);
            if (result != null) {
                foundRegion = true;
                answer[1] = result;
                toRemove.push(split[i][0]);
                continue;
            }
        }
        if (!foundLanguage) {
            const result = getLanguages(curr);
            if (result != null) {
                foundLanguage = true;
                answer[2] = result;
                toRemove.push(split[i][0]);
                continue;
            }
        }
    }
    // Remove language and region info from provided string (Regex expression removes duplicate spaces)
    answer[0] = toRemove
        .reduce((prev, curr) => prev.replace(curr, ""), str)
        .replace(/\s\s+/g, " ")
        .trim();
    return answer;
}

function setLanguage(language) {
    if (language === "") {
        console.log("Language not found, setting to English");
        document.getElementById("language").value = "English";
    } else {
        console.log(`language set to ${language}`);
        document.getElementById("language").value = language;
    }
}

function setRegion(region) {
    if (region === "") {
        console.log("Region not found");
    } else {
        console.log(`region set to ${region}`);
        document.getElementById("region").value = region;
    }
}

function setReleaseTitle(title) {
    console.log(`release title set to ${title}`);
    document.getElementById("release_title").value = title;
}

// Checks title for languages/regions and updates form
function processReleaseTitle() {
    const title = document.getElementById("release_title").value;
    const result = extractInfo(title);
    setReleaseTitle(result[0]);
    setRegion(result[1]);
    setLanguage(result[2]);
}

/*
set Age Rating to N/A (upload.php only)
check Special Edition
set Special Edition Year with Group Information Year (must be able to change it later if needed) (upload.php only)
set Special Edition Title to "No-Intro"
*/
function editForm() {
    // Set Age rating to N/A
    if (location.pathname === "/upload.php") {
        document.getElementById("Rating").value = "13";
    }
    // Check special edition (Generates click on checkbox instead of modifying HTML)
    if (document.getElementById("remaster").checked === false) {
        const evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        document.getElementById("remaster").dispatchEvent(evt);
    }
    // Set special edition year
    if (location.pathname === "/upload.php") {
        document.getElementById("remaster_year").value =
            document.getElementById("year").value;
    }
    // Set speecial edition title to "No-Intro"
    document.getElementById("remaster_title").value = "No-Intro";
}

function romButtonClick() {
    editForm();
    processReleaseTitle();
    document.getElementById("miscellaneous").value = "ROM";
}

function isoButtonClick() {
    editForm();
    processReleaseTitle();
    document.getElementById("miscellaneous").value = "Full ISO";
}

function addButtons() {
    const release = document.getElementById("releaseinfo");
    const row = release.insertRow(1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    cell1.innerHTML = "No-Intro Helper";
    cell1.classList.add("label");
    // ROM button
    const romButton = document.createElement("input");
    romButton.type = "button";
    romButton.value = "No-Intro ROM";
    romButton.style.marginRight = "10px";
    romButton.addEventListener("click", romButtonClick);
    cell2.appendChild(romButton);
    // ISO button
    const isoButton = document.createElement("input");
    isoButton.type = "button";
    isoButton.value = "No-Intro Full Iso";
    isoButton.addEventListener("click", isoButtonClick);
    cell2.appendChild(isoButton);
}

(function () {
    "use strict";
    addButtons();
})();
