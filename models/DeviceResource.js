const mongoose = require('mongoose');
const DeviceResource = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    device:{type:mongoose.Schema.Types.ObjectId, ref:'Device',required:true},
    filesPath:{type : Array, "default" : [] }
});

module.exports = mongoose.model('DeviceResource',DeviceResource);