const ExcelJS = require('exceljs');
const axios = require('axios');
const moment = require('moment');
const config = require('./config');
const child_process = require('child_process')
const fs = require('fs')
var parser = require('xml2json');


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
    let valuteXML=(await axios.get("https://www.cbr.ru/scripts/XML_daily.asp?date_req=29/03/2021")).data;
    let valuteXML_old=(await axios.get("https://www.cbr.ru/scripts/XML_daily.asp?date_req=29/03/2021")).data;

    let valute=parser.toJson(valuteXML);
    let valute_old=parser.toJson(valuteXML);
    console.log(valute)
    for (var C of config.currency) {

        i++;
    }


    await workbook.xlsx.writeFile("/tmp/weather.xlsx")

    const ps= child_process.spawn("libreoffice", [
                "--headless",
                "--convert-to",
                "xls",
                "--outdir",
                config.outdir,
                "/tmp/weather.xlsx",

            ]/*, {
                detached: true,
                stdio: ['ignore', out, err]
            }*/
        )
    ps.on('close', (code) => {
            console.log( moment().format("DD.MM.yyyy HH:mm:ss") +` sleep 20 min`);
            setTimeout(async ()=>{await main()}, 20*60*1000)
    });
    ps.stdout.on('data', (data) => {
        console.log(`${data}`);
    });
    ps.stderr.on('data', (data) => {
        console.log(`${data}`);
    });


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

