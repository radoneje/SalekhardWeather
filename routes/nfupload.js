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
   // console.log(arr)
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('NF');
    var i = 1;
    var  buf={SOT:[],THM:[],GEO:[],SRC:[] }
     arr.forEach(elem=> {
         if(elem.name)
             elem.name=elem.name.replace(/&nbsp;/g, " ")
         if(elem.pos)
             elem.pos=elem.pos.replace(/&nbsp;/g, " ")
         if(elem.text)
             elem.text=elem.text.replace(/&nbsp;/g, " ")

         if (elem.type == 'SOT'){
             buf.SOT.push({name:elem.name, pos:elem.pos})
         }
         if (elem.type == 'THM')
             buf.THM.push(elem.text)
         if (elem.type == 'GEO')
             buf.GEO.push(elem.text)
         if (elem.type == 'SRC')
             buf.SRC.push(elem.text)
     })
    var l=Math.max(buf.SOT.length, buf.THM.length, buf.GEO.length, buf.SRC.length)

    for(var i=0; i<l;i++) {
        var values = [];
        var name = buf.SOT[i] ? buf.SOT[i].name : "";
        var pos = buf.SOT[i] ? buf.SOT[i].pos : "";
        values.push(name, pos, buf.THM[i] || "", buf.GEO[i] || "", buf.SRC[i] || "")

        let row = sheet.getRow(i + 1)
        row.values = values;
    }
/*
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
     for(var i=1;i<=values.length; i++)
     {
         let row = sheet.getRow(i)
         console.log(i, values[i-1])
         row.values =values[i-1];
     }


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