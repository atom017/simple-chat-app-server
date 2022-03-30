const express =require('express');
const router = express.Router();

router.get('/',(req,res) =>{
    res.send('Server running ...');
})

module.exports = router;