var express = require('express');
const ExcelJS = require('exceljs');
const axios = require('axios');
const moment = require('moment');
const config = require('../config');
const child_process = require('child_process')
const fs = require('fs')
const parser = require('fast-xml-parser');
const he = require('he')
var router = express.Router();

router.post("/",async (req,res)=>{

    var arr=JSON.parse(req.body.titles)

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('NF');
    var i = 1;
    console.log("arr loop")
    for (var elem in arr) {

        let row = sheet.getRow(i)
        i++;
        if (elem.type == 'SOT')
            row.values = [elem.name, elem.pos]
        if (elem.type == 'THM')
            row.values = ["", "", elem.text]
        if (elem.type == 'GEO')
            row.values = ["", "", "", elem.text]
        if (elem.type == 'SRC')
            row.values = ["", "", "", "", elem.text]
        console.log("arr elem", i, row.values, elem)
    }
    console.log("make xlsx")
        await workbook.xlsx.writeFile("/tmp/nf.xlsx")
    console.log("convert xlsx")
        const ps= child_process.spawn("libreoffice", [
                "--headless",
                "--convert-to",
                "xls",
                "--outdir",
                config.outdirNF,
                "/tmp/nf.xlsx",

            ]/*, {
                detached: true,
                stdio: ['ignore', out, err]
            }*/
        )
        ps.on('close', (code) => {
            res.send("file is save to "+config.outdirNF+"/nf.xls")

        });
        ps.stdout.on('data', (data) => {
            console.log(`${data}`);
        });
        ps.stderr.on('data', (data) => {
            console.log(`${data}`);
        });
})



module.exports = router;