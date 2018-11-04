/**
 * Created by xuwk on 2016/12/14.
 */
var mongoose=require("mongoose");
var Schema = mongoose.Schema;
//声明Schema
var _User = new Schema({
    name: String,
    password:String,
    pic:String
});
//构建model
var pmodel=mongoose.model('user', _User);
// entity.save();
exports.User = pmodel;



