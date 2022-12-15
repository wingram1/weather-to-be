const apikey = `9f22897565b785c5e1809cff5dde2ef9`;
// const geocodeLink = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apikey}`;

function searchHandler(event) {
  event.preventDefault();

  const city = document.querySelector("#city-input").value;

  getCoords(city);
}

document.querySelector("#city-search").addEventListener("click", searchHandler);

function getCoords(city) {
  const apiLink = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apikey}`;

  fetch(apiLink).then((response) => {
    if (!response.ok) {
      console.log("Uh-oh! Something went wrong fetching the city coords");
    }

    response.json().then((data) => {
      const lat = data[0].lat;
      const lon = data[0].lon;

      getForecast(city, lat, lon);
    });
  });
}

function getForecast(city, lat, lon) {
  const apiLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apikey}`;

  fetch(apiLink).then((response) => {
    if (!response.ok) {
      console.log("Uh-oh! Something went wrong fetching the forecast");
    }

    response.json().then((data) => {
      const current = data.current;

      const daily = [];

      for (let i = 0; i < 5; i++) {
        daily.push(data.daily[i]);
      }

      generateHTML(city, current, daily);
    });
  });
}

function generateHTML(city, current, daily) {
  // current
  const currentContainer = document.querySelector("#current");
  currentContainer.replaceChildren();

  const currentDate = unixToDate(current.dt);
  const currentIcon = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

  console.log(city, current, daily);
  //h2 city name - date - icon
  const cityName = document.createElement("h2");
  cityName.innerHTML = `${city} (${currentDate}) <img src=${currentIcon} />`;

  // temp
  const currentTemp = document.createElement("p");
  currentTemp.textContent = `Temp: ${kelvinsToFahr(current.temp)}°F`;
  // wind
  const currentWind = document.createElement("p");
  currentWind.textContent = `Wind: ${current.wind_speed} MPH`;
  // humidity
  const currentHumidity = document.createElement("p");
  currentHumidity.textContent = `Humidity: ${current.humidity}%`;

  currentContainer.append(cityName);
  currentContainer.append(currentTemp);
  currentContainer.append(currentWind);
  currentContainer.append(currentHumidity);

  // 5-day forecast cards
  const forecastContainer = document.querySelector("#cards");
  forecastContainer.replaceChildren();

  for (let i = 0; i < daily.length; i++) {
    const day = daily[i];
    // card
    const dayCard = document.createElement("div");
    dayCard.className = "card";
    dayCard.innerHTML = `
        <h4>${unixToDate(day.dt)}</h4>
        <img src="https://openweathermap.org/img/wn/${
          day.weather[0].icon
        }@2x.png"
        <p>Temp: ${kelvinsToFahr(day.temp.day)}°F</p>
        <p>Wind: ${day.wind_speed}</p>
        <p>Humidity: ${day.humidity}%</p>
    `;

    forecastContainer.append(dayCard);
  }

  saveToHistory(city);
}

function unixToDate(unix) {
  const date = new Date(unix * 1000);
  console.log(date);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function kelvinsToFahr(K) {
  let F = 1.8 * (K - 273) + 32;

  return F.toFixed(2);
}

function saveToHistory(city) {
  // get data from localStorage
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  //if it doesn't exists, create
  if (!searchHistory) {
    searchHistory = [];
  }

  // loop through search history, see if what we searched already exists
  for (let i = 0; i < searchHistory.length; i++) {
    if (searchHistory[i] === city) {
      searchHistory.splice(i, 1);
    }
  }

  // write over saved data with new data
  searchHistory.splice(0, 0, city);

  // save to localStorage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

  loadHistory();
}

function loadHistory() {
  const history = document.querySelector("#history");

  history.replaceChildren();

  let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  if (!searchHistory) {
    return;
  }

  for (let i = 0; i < searchHistory.length; i++) {
    let historyButton = document.createElement("button");
    historyButton.className = "btn btn-secondary historyBtn";
    historyButton.textContent = searchHistory[i];
    history.append(historyButton);

    // get textcontent and run fetch
    historyButton.addEventListener("click", function (event) {
      event.preventDefault();

      let cityName = event.target.textContent;
      getCoords(cityName);
    });
  }
}

// load history on page load
loadHistory();
