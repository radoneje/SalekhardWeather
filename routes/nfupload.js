var express = require('express');

var router = express.Router();

router.post("/",(req,res)=>{

    var arr=JSON.parse(req.body.titles)
    console.log("arr", arr)
    res.json(2);
})

module.exports = router;