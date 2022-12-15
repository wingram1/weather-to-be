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
  currentTemp.textContent = `Temp: ${kelvinsToFahr(current.temp)}°`;
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
  document.querySelector("#forecast").replaceChildren();
  // card
  // date
  // icon
  // temp
  // wind
  // humidity
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
