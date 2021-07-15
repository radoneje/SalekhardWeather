var express = require('express');

var router = express.Router();

router.post("/",(req,res)=>{
    console.log("w", req.body)
    res.json(2);
})

module.exports = router;