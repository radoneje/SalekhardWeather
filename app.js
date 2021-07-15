const ExcelJS = require('exceljs');
const axios = require('axios');
const moment = require('moment');
const config = require('./config');
const child_process = require('child_process')
const fs = require('fs')
const parser = require('fast-xml-parser');
const he = require('he');


main();

async function main() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('weather');
    var i = 1;
    for (var city of config.city) {
        console.log(city)
        let r = await getWeather(city.en);
        let row = sheet.getRow(i)
        row.values = [city.ru, Math.round(r.temp), r.weather, r.weatherCode, moment().format("DD.MM.yyyy HH:mm:ss")];
        i++;
    }
    let valuteXML=(await axios.get("https://www.cbr.ru/scripts/XML_daily.asp")).data;
    let valuteXML_old=(await axios.get("https://www.cbr.ru/scripts/XML_daily.asp?date_req="+moment().add("-1", "day").format("DD/MM/yyyy HH:mm:ss"))).data;

    var options = {
        attributeNamePrefix : "@_",
        attrNodeName: "attr", //default is 'false'
        textNodeName : "#text",
        ignoreAttributes : true,
        ignoreNameSpace : false,
        allowBooleanAttributes : false,
        parseNodeValue : true,
        parseAttributeValue : false,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        parseTrueNumberOnly: false,
        arrayMode: false, //"strict"
        attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
        tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
        stopNodes: ["parse-me-as-string"]
    };

    const sheet2 = workbook.addWorksheet('Currency');
    let valute=parser.parse(valuteXML, options).ValCurs.Valute;
    let valute_old=parser.parse(valuteXML, options).ValCurs.Valute;
    //console.log(valute)
    i=1;
    for (var currency of config.currency) {
        var curs=valute.filter(v=>{return v.CharCode==currency})
        var curs_old=valute_old.filter(v=>{return v.CharCode==currency})
        if(curs.length>0){
            let trand=(curs[0].Value-curs_old[0].Value)<0?0:1
            let row = sheet2.getRow(i)
            console.log(currency, curs[0].Value, "", trand, moment().format("DD.MM.yyyy HH:mm:ss"))
            row.values = [currency, curs[0].Value, "", trand, moment().format("DD.MM.yyyy HH:mm:ss")];
            i++;
        }

    }


    await workbook.xlsx.writeFile("/tmp/informer.xlsx")

    const ps= child_process.spawn("libreoffice", [
                "--headless",
                "--convert-to",
                "xls",
                "--outdir",
                config.outdir,
                "/tmp/informer.xlsx",

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

