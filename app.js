const ExcelJS = require('exceljs');
const axios = require('axios');
const moment = require('moment');
const config = require('./config');
const child_process = require('child_process')


main();

async function main() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
    var i = 1;
    for (var city of config.city) {
        console.log(city)
        let r = await getWeather(city.en);
        let row = sheet.getRow(i)
        row.values = [city.ru, Math.round(r.temp), r.weather, r.weatherCode, moment().format("DD.MM.yyyy HH:mm:ss")];
        i++;
    }
    await workbook.xlsx.writeFile("/tmp/weather.xlsx")
    var out = fs.openSync('/tmp/out.log', 'a');
    var err = fs.openSync('/tmp/out.log', 'a');

    child_process.spawn("libreoffice", [
            "--headless",
            "--convert-to",
            "xls",
            "/tmp/weather.xlsx"
        ], {
            detached: true,
            stdio: ['ignore', out, err]
        }
    ).unref();
}

// lat широта
//lon, долготоа

async function getWeather(city) {
    let r = await axios.get("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + config.openweathermapAppId + "&units=metric&lang=ru")

    return {
        weather: r.data.weather[0].description,
        weatherCode: r.data.weather[0].id,
        temp: r.data.main.temp
    }


}

