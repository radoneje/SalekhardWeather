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
    var buf=[[],[],[],[],[]]
    arr.forEach(elem=> {
        if (elem.type == 'SOT'){
            buf[0].push(elem.name)
            buf[1].push(elem.pos)
        }
        if (elem.type == 'THM')
            buf[2].push(elem.text)
        if (elem.type == 'GEO')
            buf[3].push(elem.text)
        if (elem.type == 'SRC')
            buf[4].push(elem.text)
    })

    var values=[];
    var l=Math.max(buf[0].length, buf[1].length, buf[2].length, buf[3].length,buf[4].length)
    for(var i=1; i<=l;i++){

        buf.forEach(b=>{
            if(b.length<i-1)
                values.push(b)
            //else
                //values.push("")
        })

    }
    console.log("buf ", values,values.length );
   /* for(var i=1; i++;i<=values.length)
    {
        let row = sheet.getRow(i)
       // console.log(i, values[i-1])
        row.values =[1,2,3];
    }*/


   /* arr.forEach(elem=> {
        let row = sheet.getRow(i)
        i++;
        if (elem.type == 'SOT')
            row.values = [elem.name, elem.pos,"","",""]
        if (elem.type == 'THM')
            row.values = ["", "", elem.text,"",""]
        if (elem.type == 'GEO')
            row.values = ["", "", "", elem.text,""]
        if (elem.type == 'SRC')
            row.values = ["", "", "", "", elem.text]
        console.log("arr elem", i, row.values)
    });*/
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