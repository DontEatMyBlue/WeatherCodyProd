const express = require('express');
const axios = require('axios');

const router = express();

//날씨API
//클라이언트에서 위치정보를 받고 날씨정보를 쿠키에 저장
router.post('/getWeather', async (req, res) => {
    const { latitude, longitude } = req.body;
    const apiKey = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    try {
      const response = await axios.get(url);
      let jsonWeather = response.data;
      let location = jsonWeather.name;
      let currentTemp = (jsonWeather.main.temp - 273.15).toFixed(1);
      let weather = jsonWeather.weather[0].main;

      res.cookie('location',location);
      res.cookie('currentTemp',currentTemp);
      res.cookie('weather',weather);

      res.redirect('/');
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error when fetching weather data');
    }
  }); 

 module.exports = router;