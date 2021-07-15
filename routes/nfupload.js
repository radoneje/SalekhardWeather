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
    for (var elem of arr) {
        let row = sheet.getRow(i)
        i++;
        if(elem.type=='SOT')
            row.values =[elem.name, elem.pos]
        if(elem.type=='THM')
            row.values =["","",elem.text]
        if(elem.type=='GEO')
            row.values =["","","",elem.text]
        if(elem.type=='SRC')
            row.values =["","","","",elem.text]
        await workbook.xlsx.writeFile("/tmp/nf.xlsx")
        const ps= child_process.spawn("libreoffice", [
                "--headless",
                "--convert-to",
                "xls",
                "--outdir",
                config.outdir,
                "/tmp/nf.xlsx",

            ]/*, {
                detached: true,
                stdio: ['ignore', out, err]
            }*/
        )
        ps.on('close', (code) => {
            res.send("file is save to "+config.outdir+"/nf.xls")

        });
        ps.stdout.on('data', (data) => {
            console.log(`${data}`);
        });
        ps.stderr.on('data', (data) => {
            console.log(`${data}`);
        });

    }


    res.json(2);
})



module.exports = router;