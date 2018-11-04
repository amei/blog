/**
 * Created by xuwk on 2016/12/12.
 */

var express = require('express');
var router = express.Router();

/* GET blog index page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'git页', name: 'git页'});
});

module.exports = router;