
var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '首页', name: '博客'});
});

module.exports = router;