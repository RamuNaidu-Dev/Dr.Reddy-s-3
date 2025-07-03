const siteDetails = {
  "FTO-2": "FTO-2",
  "FTO-3": "FTO-3",
  "Biologics": "BIOLOGICS",
  "IPDO": "IPDO",
  "CTO-1": "CTO-1",
  "CTO-2": "CTO-2",
  "CTO-3": "CTO-3",
  "CTO-5": "CTO-5",
  "FTO-7": "FTO-7",
  "FTO-9": "FTO-9",
  "CTO-6": "CTO-6",
  "FTO SEZ PU1": "FTO SEZ PU1",
  "FTO SEZ PU2": "FTO SEZ PU2",
  "CTO SEZ": "CTO SEZ",
};

const params = new URLSearchParams(window.location.search);
const site = params.get("site");

document.getElementById("site-title").innerText = site;
document.getElementById("site-description").innerText =
  siteDetails[site] || "No details found for this site.";

function goHome() {
  window.location.href = "index.html";
}

function goToDetails(siteName) {
  window.location.href = `details.html?site=${encodeURIComponent(siteName)}`;
}

function filterSites() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const sections = document.querySelectorAll(".location-section");

  sections.forEach((section) => {
    const locationTitle = section
      .querySelector(".location-title")
      .innerText.toLowerCase();
    const siteButtons = section.querySelectorAll(".site-button");

    let matchFound = false;

    siteButtons.forEach((button) => {
      const siteText = button.innerText.toLowerCase();
      const matchesSite = siteText.includes(input);
      const matchesLocation = locationTitle.includes(input);

      // Show site button if either location or site matches
      if (matchesSite || matchesLocation || input === "") {
        button.style.display = "inline-block";
        matchFound = true;
      } else {
        button.style.display = "none";
      }
    });

    // Show or hide entire section
    section.style.display = matchFound ? "block" : "none";
  });
}

// Fetch site data dynamically

async function loadSiteDetails() {
  const params = new URLSearchParams(window.location.search);
  const siteName = params.get("site");

  const res = await fetch("http://localhost:5000/api/sites");
  const data = await res.json();

  let found = null;
  for (const loc in data) {
    const site = data[loc].find(s => s.siteName === siteName);
    if (site) {
      found = site;
      break;
    }
  }

  document.getElementById("site-title").innerText = siteName;
  document.getElementById("site-description").innerText =
    found?.description || "No details found for this site.";
}
window.onload = loadSiteDetails;

