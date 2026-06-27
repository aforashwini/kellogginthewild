/* Kellogg In the Wild — world map of classmates */
(function () {
  "use strict";

  // The Google Sheet, exported as CSV. We build the /export endpoint from the
  // sheet ID so PapaParse receives raw CSV rather than the HTML edit page.
  var SHEET_ID = "1Qg2xGWWOJ6HuqawhZyIKyHf7Pwn3J_vzpDeepdh2Zgg";
  var CSV_BASE =
    "https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/export?format=csv";

  var REFRESH_MS = 5 * 60 * 1000; // re-fetch every 5 minutes

  // City -> [lat, lng]. People in cities not listed here are skipped silently.
  var CITY_COORDS = {"Abu Dhabi, UAE": [24.4539, 54.3773], "Accra, Ghana": [5.6037, -0.187], "Albuquerque, NM, USA": [35.0844, -106.6504], "Amsterdam, Netherlands": [52.3676, 4.9041], "Athens, Greece": [37.9838, 23.7275], "Atlanta, GA, USA": [33.749, -84.388], "Auckland, New Zealand": [-36.8485, 174.7633], "Austin, TX, USA": [30.2672, -97.7431], "Baltimore, MD, USA": [39.2904, -76.6122], "Bangalore, India": [12.9716, 77.5946], "Bangkok, Thailand": [13.7563, 100.5018], "Barcelona, Spain": [41.3851, 2.1734], "Beijing, China": [39.9042, 116.4074], "Berlin, Germany": [52.52, 13.405], "Bogota, Colombia": [4.711, -74.0721], "Boston, MA, USA": [42.3601, -71.0589], "Brisbane, Australia": [-27.4698, 153.0251], "Brussels, Belgium": [50.8503, 4.3517], "Budapest, Hungary": [47.4979, 19.0402], "Buenos Aires, Argentina": [-34.6037, -58.3816], "Cairo, Egypt": [30.0444, 31.2357], "Calgary, Canada": [51.0447, -114.0719], "Cape Town, South Africa": [-33.9249, 18.4241], "Charlotte, NC, USA": [35.2271, -80.8431], "Chennai, India": [13.0827, 80.2707], "Chicago, IL, USA": [41.8781, -87.6298], "Cleveland, OH, USA": [41.4993, -81.6944], "Columbus, OH, USA": [39.9612, -82.9988], "Copenhagen, Denmark": [55.6761, 12.5683], "Dallas, TX, USA": [32.7767, -96.797], "Delhi, India": [28.7041, 77.1025], "Denver, CO, USA": [39.7392, -104.9903], "Detroit, MI, USA": [42.3314, -83.0458], "Doha, Qatar": [25.2854, 51.531], "Dubai, UAE": [25.2048, 55.2708], "Dublin, Ireland": [53.3498, -6.2603], "Edinburgh, UK": [55.9533, -3.1883], "Fort Worth, TX, USA": [32.7555, -97.3308], "Frankfurt, Germany": [50.1109, 8.6821], "Geneva, Switzerland": [46.2044, 6.1432], "Guadalajara, Mexico": [20.6597, -103.3496], "Guangzhou, China": [23.1291, 113.2644], "Hamburg, Germany": [53.5511, 9.9937], "Hanoi, Vietnam": [21.0278, 105.8342], "Helsinki, Finland": [60.1699, 24.9384], "Ho Chi Minh City, Vietnam": [10.8231, 106.6297], "Hong Kong": [22.3193, 114.1694], "Houston, TX, USA": [29.7604, -95.3698], "Hyderabad, India": [17.385, 78.4867], "Indianapolis, IN, USA": [39.7684, -86.1581], "Istanbul, Turkey": [41.0082, 28.9784], "Jacksonville, FL, USA": [30.3322, -81.6557], "Jakarta, Indonesia": [-6.2088, 106.8456], "Johannesburg, South Africa": [-26.2041, 28.0473], "Kansas City, MO, USA": [39.0997, -94.5786], "Kuala Lumpur, Malaysia": [3.139, 101.6869], "Lagos, Nigeria": [6.5244, 3.3792], "Las Vegas, NV, USA": [36.1699, -115.1398], "Lima, Peru": [-12.0464, -77.0428], "Lisbon, Portugal": [38.7223, -9.1393], "London, UK": [51.5074, -0.1278], "Los Angeles, CA, USA": [34.0522, -118.2437], "Louisville, KY, USA": [38.2527, -85.7585], "Madrid, Spain": [40.4168, -3.7038], "Manchester, UK": [53.4808, -2.2426], "Manila, Philippines": [14.5995, 120.9842], "Melbourne, Australia": [-37.8136, 144.9631], "Memphis, TN, USA": [35.1495, -90.049], "Mexico City, Mexico": [19.4326, -99.1332], "Miami, FL, USA": [25.7617, -80.1918], "Milan, Italy": [45.4642, 9.19], "Milwaukee, WI, USA": [43.0389, -87.9065], "Minneapolis, MN, USA": [44.9778, -93.265], "Monterrey, Mexico": [25.6866, -100.3161], "Montreal, Canada": [45.5017, -73.5673], "Moscow, Russia": [55.7558, 37.6173], "Mumbai, India": [19.076, 72.8777], "Munich, Germany": [48.1351, 11.582], "Nairobi, Kenya": [-1.2921, 36.8219], "Nashville, TN, USA": [36.1627, -86.7816], "New York, NY, USA": [40.7128, -74.006], "Oklahoma City, OK, USA": [35.4676, -97.5164], "Osaka, Japan": [34.6937, 135.5023], "Oslo, Norway": [59.9139, 10.7522], "Panama City, Panama": [8.9824, -79.5199], "Paris, France": [48.8566, 2.3522], "Philadelphia, PA, USA": [39.9526, -75.1652], "Phoenix, AZ, USA": [33.4484, -112.074], "Pittsburgh, PA, USA": [40.4406, -79.9959], "Portland, OR, USA": [45.5152, -122.6784], "Prague, Czechia": [50.0755, 14.4378], "Pune, India": [18.5204, 73.8567], "Raleigh, NC, USA": [35.7796, -78.6382], "Rio de Janeiro, Brazil": [-22.9068, -43.1729], "Riyadh, Saudi Arabia": [24.7136, 46.6753], "Rome, Italy": [41.9028, 12.4964], "Salt Lake City, UT, USA": [40.7608, -111.891], "San Antonio, TX, USA": [29.4241, -98.4936], "San Diego, CA, USA": [32.7157, -117.1611], "San Francisco, CA, USA": [37.7749, -122.4194], "San Jose, CA, USA": [37.3382, -121.8863], "San Jose, Costa Rica": [9.9281, -84.0907], "Santiago, Chile": [-33.4489, -70.6693], "Sao Paulo, Brazil": [-23.5505, -46.6333], "Seattle, WA, USA": [47.6062, -122.3321], "Seoul, South Korea": [37.5665, 126.978], "Shanghai, China": [31.2304, 121.4737], "Shenzhen, China": [22.5431, 114.0579], "Singapore": [1.3521, 103.8198], "Stockholm, Sweden": [59.3293, 18.0686], "Sydney, Australia": [-33.8688, 151.2093], "Taipei, Taiwan": [25.033, 121.5654], "Tel Aviv, Israel": [32.0853, 34.7818], "Tokyo, Japan": [35.6762, 139.6503], "Toronto, Canada": [43.6532, -79.3832], "Tucson, AZ, USA": [32.2226, -110.9747], "Vancouver, Canada": [49.2827, -123.1207], "Vienna, Austria": [48.2082, 16.3738], "Warsaw, Poland": [52.2297, 21.0122], "Washington, DC, USA": [38.9072, -77.0369], "Zurich, Switzerland": [47.3769, 8.5417]};

  // ---------- DOM ----------
  var els = {
    statPeople: document.getElementById("stat-people"),
    statCities: document.getElementById("stat-cities"),
    search: document.getElementById("search"),
    refreshBtn: document.getElementById("refresh-btn"),
    status: document.getElementById("status"),
    statusSpinner: document.getElementById("status-spinner"),
    statusMessage: document.getElementById("status-message"),
    statusRetry: document.getElementById("status-retry"),
    panel: document.getElementById("panel"),
    panelCity: document.getElementById("panel-city"),
    panelCount: document.getElementById("panel-count"),
    panelList: document.getElementById("panel-list"),
    panelClose: document.getElementById("panel-close"),
  };

  // ---------- State ----------
  var map;
  var markers = {}; // city -> { marker, people, coords }
  var citiesData = {}; // city -> people[]  (current data set)
  var openCity = null; // city name whose panel is open, or null
  var searchTerm = "";
  var hasLoadedOnce = false;

  // ---------- Map setup ----------
  function initMap() {
    map = L.map("map", {
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 12,
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", function () {
      closePanel();
    });
  }

  // ---------- Helpers ----------
  function trim(v) {
    return (v == null ? "" : String(v)).trim();
  }

  function badgeIcon(count, dimmed) {
    // Size scales gently with the count so big hubs read as bigger.
    var size = count >= 100 ? 46 : count >= 10 ? 40 : 34;
    var html =
      '<div class="city-badge' +
      (dimmed ? " dimmed" : "") +
      '" style="width:' +
      size +
      "px;height:" +
      size +
      "px;font-size:" +
      (count >= 100 ? 13 : 14) +
      'px;">' +
      count +
      "</div>";
    return L.divIcon({
      html: html,
      className: "city-badge-wrap",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  function matchesSearch(city, people) {
    if (!searchTerm) return true;
    if (city.toLowerCase().indexOf(searchTerm) !== -1) return true;
    for (var i = 0; i < people.length; i++) {
      if (people[i].name.toLowerCase().indexOf(searchTerm) !== -1) return true;
    }
    return false;
  }

  // ---------- Rendering ----------
  function rebuildMarkers() {
    var cities = Object.keys(citiesData);

    // Remove markers for cities that no longer exist.
    Object.keys(markers).forEach(function (city) {
      if (cities.indexOf(city) === -1) {
        map.removeLayer(markers[city].marker);
        delete markers[city];
      }
    });

    // Add or update markers for current cities.
    cities.forEach(function (city) {
      var people = citiesData[city];
      var coords = CITY_COORDS[city];
      var visible = matchesSearch(city, people);
      var count = people.length;

      if (markers[city]) {
        markers[city].people = people;
        markers[city].marker.setIcon(badgeIcon(count, !visible));
      } else {
        var marker = L.marker(coords, {
          icon: badgeIcon(count, !visible),
        }).addTo(map);
        marker.on("click", function (e) {
          L.DomEvent.stopPropagation(e);
          openPanel(city);
        });
        markers[city] = { marker: marker, people: people, coords: coords };
      }
    });

    // If the open city is gone, close the panel; otherwise refresh its list.
    if (openCity) {
      if (!citiesData[openCity]) {
        closePanel();
      } else {
        renderPanel(openCity);
      }
    }
  }

  function applySearchToMarkers() {
    Object.keys(markers).forEach(function (city) {
      var entry = markers[city];
      var visible = matchesSearch(city, entry.people);
      entry.marker.setIcon(badgeIcon(entry.people.length, !visible));
    });
  }

  // ---------- Panel ----------
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderPanel(city) {
    var people = citiesData[city] || [];
    els.panelCity.textContent = city;
    els.panelCount.textContent =
      people.length + (people.length === 1 ? " classmate" : " classmates");

    var html = people
      .map(function (p) {
        var liLinked = p.linkedin
          ? '<a class="person-link" href="' +
            escapeHtml(p.linkedin) +
            '" target="_blank" rel="noopener noreferrer">LinkedIn</a>'
          : '<span class="person-link disabled">LinkedIn</span>';
        var emailLink = p.email
          ? '<a class="person-link" href="mailto:' +
            escapeHtml(p.email) +
            '">Email</a>'
          : '<span class="person-link disabled">Email</span>';
        return (
          '<li class="person"><div class="person-name">' +
          escapeHtml(p.name) +
          '</div><div class="person-links">' +
          liLinked +
          emailLink +
          "</div></li>"
        );
      })
      .join("");

    els.panelList.innerHTML = html;
  }

  function openPanel(city) {
    openCity = city;
    renderPanel(city);
    els.panel.classList.add("open");
    els.panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    openCity = null;
    els.panel.classList.remove("open");
    els.panel.setAttribute("aria-hidden", "true");
  }

  // ---------- Stats ----------
  function updateStats(totalPeople, totalCities) {
    els.statPeople.textContent =
      totalPeople + (totalPeople === 1 ? " classmate" : " classmates");
    els.statCities.textContent =
      totalCities + (totalCities === 1 ? " city" : " cities");
  }

  // ---------- Status overlay ----------
  function showStatus(message, opts) {
    opts = opts || {};
    els.statusMessage.textContent = message;
    els.statusSpinner.hidden = !opts.spinner;
    els.statusRetry.hidden = !opts.retry;
    els.status.hidden = false;
  }

  function hideStatus() {
    els.status.hidden = true;
  }

  // ---------- Data loading ----------
  function processRows(rows) {
    var byCity = {};
    var totalPeople = 0;

    rows.forEach(function (row) {
      var name = trim(row.Name);
      var city = trim(row.City);
      if (!name || !city) return; // skip rows missing name or city
      if (!CITY_COORDS[city]) return; // skip cities we can't place

      if (!byCity[city]) byCity[city] = [];
      byCity[city].push({
        name: name,
        city: city,
        linkedin: trim(row["LinkedIn URL"]),
        email: trim(row.Email),
      });
      totalPeople++;
    });

    citiesData = byCity;
    rebuildMarkers();
    updateStats(totalPeople, Object.keys(byCity).length);
  }

  var isFetching = false;

  function loadData(isManual) {
    if (isFetching) return;
    isFetching = true;
    els.refreshBtn.classList.add("spinning");
    if (isManual) els.refreshBtn.disabled = true;

    if (!hasLoadedOnce) {
      showStatus("Loading classmates…", { spinner: true });
    }

    var url = CSV_BASE + "&_cb=" + Date.now(); // cache-bust every fetch

    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        isFetching = false;
        els.refreshBtn.classList.remove("spinning");
        els.refreshBtn.disabled = false;

        if (!results || !results.data) {
          handleError();
          return;
        }
        try {
          processRows(results.data);
          hasLoadedOnce = true;
          hideStatus();
        } catch (err) {
          handleError();
        }
      },
      error: function () {
        isFetching = false;
        els.refreshBtn.classList.remove("spinning");
        els.refreshBtn.disabled = false;
        handleError();
      },
    });
  }

  function handleError() {
    if (hasLoadedOnce) {
      // We already have data on screen — keep it, don't blank the map.
      return;
    }
    showStatus(
      "We couldn't load the classmate list. Check your connection and try again.",
      { spinner: false, retry: true }
    );
  }

  // ---------- Events ----------
  function wireEvents() {
    els.refreshBtn.addEventListener("click", function () {
      loadData(true);
    });

    els.statusRetry.addEventListener("click", function () {
      showStatus("Loading classmates…", { spinner: true });
      loadData(true);
    });

    els.panelClose.addEventListener("click", closePanel);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });

    var searchDebounce;
    els.search.addEventListener("input", function (e) {
      var value = e.target.value;
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(function () {
        searchTerm = trim(value).toLowerCase();
        applySearchToMarkers();
      }, 120);
    });
  }

  // ---------- Boot ----------
  function init() {
    initMap();
    wireEvents();
    loadData(false);
    setInterval(function () {
      loadData(false);
    }, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
