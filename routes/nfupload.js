var express = require('express');

var router = express.Router();

router.post("/",(req,res)=>{

    var arr=JSON.parse(req.body.titles)
    console.log("arr", req.body.titles)
    res.json(2);
})

module.exports = router;