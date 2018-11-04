var express = require('express');
var user=require("../models/user");
var cat=require("../models/cats");
var rs=require("rs");
var formidable = require("formidable");
var async=require('async');
var content=require("../models/content");
// router.get('/blog', function(req, res, next) {
//     res.render('blog', { title: '博客首页', name: '博客更新'});
// });

// router.get('/blog/user/login',function (req, res, next) {
//     res.render('login',{});
// });

exports.blog1=function (req,res) {
    var imgur2="";
    async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
        getContentAll:function (callback) {
            content.Content.find(function (err, docs) {
                if (err) {
                    res.render('error');
                } else {
                    callback(null, docs)
                }
            })
        },
        getContentByClick:function (callback) {
            content.Content.find({}).sort({'click':-1}).limit(5).exec(function (err, docs) {
                if (err) {
                    res.render('error');
                } else {
                    callback(null, docs)
                }
            })
        },
        getImgUrl:function (callback) {
            if(req.session.username){
                user.User.find({name:req.session.username},function (err, docs) {
                    if(err){
                        res.render('error');
                    }else {
                        if(docs[0]['pic']==""){
                            imgur2="/images/touxiang/Koala.jpg"
                        }else{
                            imgur2=urlHandle(docs[0]['pic'])
                        }
                        callback(null,imgur2);
                    }
                })
            }else {
                callback(null,"00");
            }
        }
    }, function(err, results){
        res.render('blog', {
            title:"博客首页",
            userSession:req.session.username,
            contentsAll:results['getContentAll'],
            contents:results['getContent'],
            imgUrl:results['getImgUrl'],
            contentsByClick:results['getContentByClick']
        });
    });
};
exports.login=function (req,res) {
    res.render('login',{});
};
exports.loginError=function (req,res) {
    res.render('loginError',{});
};
exports.reg=function (req, res) {
    res.render('reg',{});
};

var detail=function (req,res) {
  if(req.body.sRole==1) {
      //处理注册
      var query1 = {name: req.body.user, password: req.body.password};
      var entity = new user.User({"name": query1.name, "password": req.body.password, "pic": ""});
      entity.save();
      var entity2=new cat.Cat({"name":query1.name,"catname":"默认分类"});
      entity2.save();
      req.session.username=query1.name;
      req.session.password=query1.password;
      req.session.imgURl="/images/touxiang/Koala.jpg";
      async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
          getContentAll:function (callback) {
              content.Content.find(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      // console.log(docs)
                      callback(null, docs)
                  }
              })
          },
          getContent: function (callback) {
              content.Content.find({name:req.session.username},function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              });
          },
          getContentByClick:function (callback) {
              content.Content.find({}).sort({'click':-1}).limit(5).exec(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          }
      }, function(err, results){
          res.render('detail', {
              title:"博客详细页",
              username: query1.name,
              userSession:req.session.username,
              imgUrl:"/images/touxiang/Koala.jpg",
              contentsAll:results['getContentAll'],
              contents:results['getContent'],
              contentsByClick:results['getContentByClick'],
              date: new Date()
          });
      });
      
  }else if(req.body.sRole==2){    //处理ajax（用户名是否注册过）
      var query2 = {name: req.body.name};
      user.User.find(query2,function (err, docs) {
          if(err){
              res.render('error');
          }else {
                  if(docs.length==1){
                      res.json({msg:1});
                  }else{
                      res.json({msg:0});
                  }
          }
      });
  }
  else if(req.body.sRole==3){   //处理登录
      var imgur2="";
      var query3={name:req.body.user,password:req.body.password};
      async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
          getContentAll:function (callback) {
              content.Content.find(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          },
          getContent: function (callback) {
              content.Content.find({name:query3.name},function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              });
          },
          getImgUrl:function (callback) {
              user.User.find(query3,function (err, docs) {
                  if(err){
                      res.render('error');
                  }else {
                      if(docs.length==0){
                          res.redirect("/loginError");
                      }else {
                          if(docs[0]['pic']==""){
                              imgur2="/images/touxiang/Koala.jpg"
                          }else{
                              imgur2=urlHandle(docs[0]['pic'])
                          }
                          req.session.username=query3.name;
                          req.session.password=query3.password;
                          req.session.imgURl=imgur2;
                       callback(null,imgur2);
                      }
                  }
              });
          },
          getContentByClick:function (callback) {
              content.Content.find({}).sort({'click':-1}).limit(5).exec(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          }
      }, function(err, results){
           console.log(results['getContentByClick'])
          res.render('detail',{
              title:"博客详细页",
              username:query3.name,
              userSession:req.session.username,
              imgUrl:results['getImgUrl'],
              contentsAll:results['getContentAll'],
              contents:results['getContent'],
              contentsByClick:results['getContentByClick'],
              date:new Date()
          });
      });
      
      
  }
  else if(req.body.sRole==4) {
      var imgurl3 = "";
      //处理头像上传
      var query4 = {name: req.session.username};
      var file = req.files.pic;
      var path = file.path;
      //存储路径
      user.User.update(query4, {$set: {pic: path}}, function (err, docs) {

      });
      if (path == "") {
          imgurl3 = "/images/touxiang/Koala.jpg"
      } else {
          imgurl3 = urlHandle(path)
      }
      req.session.imgURl = imgurl3;


      async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
          getContentAll:function (callback) {
              content.Content.find(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          },
          getContent: function (callback) {
              content.Content.find({name: query4.name}, function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              });
          },
          getContentByClick:function (callback) {
              content.Content.find({}).sort({'click':-1}).limit(5).exec(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          }
      }, function (err, results) {
          res.render('detail', {
              title: "博客详细页",
              username: query4.name,
              userSession: req.session.username,
              contentsAll:results['getContentAll'],
              contents: results['getContent'],
              contentsByClick:results['getContentByClick'],
              imgUrl: imgurl3,
              date: new Date()
          });
      });


  }

  else{

      var imgurl4="";
      var query5={name:req.session.username};
      async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
          getContentAll:function (callback) {
            content.Content.find(function (err, docs) {
                if (err) {
                    res.render('error');
                } else {
                    // console.log(docs)
                    callback(null, docs)
                }
            })  
          },
          getContent: function (callback) {
              content.Content.find({name:query5.name},function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              });
          },
          getImgUrl:function (callback) {
              user.User.find(query5,function (err, docs) {
                  if(err){
                      res.render('error');
                  }else {
                      if(docs.length==0){
                          res.redirect("/loginError");
                      }else {
                          if(docs[0]['pic']==""){
                              imgurl4="/images/touxiang/Koala.jpg"
                          }else{
                              imgurl4=urlHandle(docs[0]['pic'])
                          }
                          req.session.username=query5.name;
                          req.session.password=query5.password;
                          callback(null,imgurl4);
                      }
                  }
              });
          },
          getContentByClick:function (callback) {
              content.Content.find({}).sort({'click':-1}).limit(5).exec(function (err, docs) {
                  if (err) {
                      res.render('error');
                  } else {
                      callback(null, docs)
                  }
              })
          }
      }, function(err, results){
          res.render('detail',{
              title:"博客详细页",
              username:query5.name,
              userSession:req.session.username,
              imgUrl:results['getImgUrl'],
              contentsAll:results['getContentAll'],
              contents:results['getContent'],
              contentsByClick:results['getContentByClick'],
              date:new Date()
          });
      });
      
  }
};

exports.detail=detail;


var readAll=function (req, res) {
    var imgurl4="";
    var query5={name:req.query.name};
    async.parallel({   //parallel函数是并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行
        getContent: function (callback) {
            content.Content.find({name:req.query.name,title:req.query.title.toString()},function (err, docs) {
                if (err) {
                    res.render('error');
                } else {
                    callback(null, docs)
                }
            });
        },
        getImgUrl:function (callback) {  //获取登陆头像
            user.User.find({name:req.session.username},function (err, docs) {
                if(err){
                    res.render('error');
                }else {
                    if(docs.length==0){
                        
                    }else {
                        if(docs[0]['pic']==""){
                            imgurl4="/images/touxiang/Koala.jpg"
                        }else{
                            imgurl4=urlHandle(docs[0]['pic'])
                        }
                    }
                    callback(null,imgurl4);
                }
            });
        },
        getImgUrl2:function (callback) {  //获取博客作者头像
            user.User.find(query5,function (err, docs) {
                if(err){
                    res.render('error');
                }else {
                    if(docs.length==0){

                    }else {
                        if(docs[0]['pic']==""){
                            imgurl4="/images/touxiang/Koala.jpg"
                        }else{
                            imgurl4=urlHandle(docs[0]['pic'])
                        }
                    }
                    callback(null,imgurl4);
                }
            });
        },
        getCats:function (callback) {
            cat.Cat.find(query5,function (err,docs) {
                if(err){res.render('error')}
                else {
                    callback(null,docs);
                }
            });
        },
        getCatsNum:function (callback) {
            cat.Cat.find({name:req.query.name},function (err, docs) {
                if (err) {
                    res.render('error');
                } else {
                    var catsNum={},result2=[];
                    async.mapSeries(docs,function (dd,callback1) {
                        content.Content.find({name:req.query.name,cat:dd['catname']},function (err, rs) {
                            catsNum[dd['catname']]=rs.length;
                            callback1(null,catsNum);
                        });
                    },function (err, results) {
                        result2=results;
                        callback(null, result2)
                    });

                }
            });
        }
    }, function(err, results){
        res.render('readAll',{
            title:"博客内容页单页",
            username:query5.name,
            userSession:req.session.username,
            imgUrl:results['getImgUrl'],
            imgUrl2:results['getImgUrl2'],
            contents:results['getContent'],
            cats:results['getCats'],
            catsNum:results['getCatsNum'],
            date:new Date()
        });
    });
};
exports.readAll=readAll;


var fwNum=function (req,res) {
    var query={name:req.body.name,title:req.body.title}
    async.waterfall([
        function (callback) {
            content.Content.find(query,function (err, docs) {
                docs[0]['click']++;
                callback(null,docs[0]['click'])
            })
        },
        function (num, callback) {
            // console.log(num)
            content.Content.update(query, {$set: {click:num}}, function (err, docs) {
                //console.log(docs)
            });
            callback(null,num);
        }
    ],function (err, result) {
        res.json({msg:result});
    });
};

exports.fwNum=fwNum;


















function urlHandle(url) {
    var str=url.replace(/\\/g,"/");
    return str.replace(/public/g,"")
}
