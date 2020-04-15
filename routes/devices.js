const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Device = require("../models/Device")
const Assignment = require("../models/Assignment")

const { Validator } = require('node-input-validator')
const DeviceResource = require('../models/DeviceResource');
// Importing middlewares
const isAuthAdmin = require('../middleware/isAuthAdmin');

router.get("/", async(req, res) => {
    try{
        const devices = await Device.find({})
        res.status(200).json({message: "List of registered Devices", devices: devices})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})        
    }
})

router.post("/bulk", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            'items': "required|array",
            'items.*.itemName': 'required',
            'items.*.itemLocation': 'required',
            'items.*.itemQuantity': 'required|numeric',
            'items.*.createdById': 'required',
            'items.*.itemSerialNumber': 'string',
            'items.*.itemModel': 'required',
            'items.*.itemColor': 'required',
            itemType: "required"
        });
         
        const matched = await v.check() 
        if (!matched) {
            let error_messages = pile_error_messages(v.errors)
            console.log(v.errors)            
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{    
            let device
            for await (const x of req.body.items){
                x.itemId = mongoose.Types.ObjectId()
                device = new Device(x)
                await device.save()
                const assignment = new Assignment({itemId: x.itemId})
                await assignment.save()
            }
            res.status(200).json({message: "Bulk Device saved successfully", data: req.body.items})
        }
    }catch(err){
        console.log(err)        
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
})

router.post("/one", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemId: "required"
        })

        const matched = await v.check()
        if(!matched){
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{
            Promise.all([
                await Device.findOne({itemId: req.body.itemId}),
                await DeviceResource.findOne({device: req.body.itemId}) 
            ]).then(results=>{
                const [device,deviceImages] = results;
                res.status(200).json({message: "Device Data Retrieved Successfully", data: device, deviceImages:deviceImages.filesPath})
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some errors occured", errors: err})        
    }
})

router.put("/", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemId: 'required',
            itemName: 'required',
            itemLocation: 'required',
            itemQuantity: 'required|numeric',
            createdById: 'required',
            itemSerialNumber: 'required',
            itemModel: 'required',
            itemColor: 'required',
            itemType: "required|string"
          });
         
        const matched = await v.check()
        if (!matched) {
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{            
            const device = await Device.findOneAndUpdate({itemId: req.body.itemId}, req.body, {new: true})
            if(device){
                res.status(200).json({message: "Device updated successfully", data: device})
            }else{
                res.status(422).json({message: "Device Not Found. Please Provide A Valid itemId"})
            }
        }
    }catch(err){
        console.log(err)        
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
})

router.delete("/", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemId:"required"
        })

        const matched = await v.check()
        if(!matched){
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{
            const device = await Device.findOneAndDelete({itemId: req.body.itemId})
            if(device){
                res.status(200).json({message: "Device Deleted", data: device})
            }else{
                res.status(422).json({message: "Device Not Found. Please Provide A Valid itemId"})
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
})

router.post("/", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemName: 'required',
            itemLocation: 'required',
            itemQuantity: 'required|numeric',
            createdById: 'required',
            itemSerialNumber: 'string',
            itemModel: 'required',
            itemColor: 'required',
            itemType: "required|string"
          });
         
        const matched = await v.check()
        if (!matched) {
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{            
            if(req.body.itemType == "single" && req.body.itemQuantity > 1){
                res.status(422).json({message: "Quantity of single device provided is more than one"})
            }else{
                const device = new Device(req.body)
                device.itemId = mongoose.Types.ObjectId()
                await device.save()
                res.status(200).json({message: "Device saved successfully", data: device})
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
})

//
//create images

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './fileServer');
  },
  filename: function (req, file, callback) {
    //   console.log(req)
    callback(null, Date.now() + '-' + file.originalname.toLowerCase().split(' ').join('-'));
  }
});

var upload = multer({ storage : storage,
    fileFilter: function (req, file, callback){
        if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'  || file.mimetype==='image/jpg'){
            callback(null, true)
        }else{
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
        }
    },limits: function (req, file, callback) {
        fileSize: 1024*1024*5 //limit of 5MB
    }
 }).array('deviceImage');

 router.post('/upload',isAuthAdmin, async function(req,res){
    try{
            await  upload(req,res, async function(err) {
            let filePaths = [];
            let deviceId = req.body.deviceId
            req.files.forEach(el=>{
                console.log(el)
                filePaths.push(el.path);
            })
            if(err) {
                return res.status(201).json({
                    message:"fail",
                    error:err
                });
            }
            const device = await DeviceResource.find({deviceId:deviceId})
            if(device.length > 0){
                //update - add more to images
                const updateRecord = await DeviceResource.findOneAndUpdate({deviceId:device[0].deviceId},{$addToSet:{"filesPath": filePaths}})
                res.status(200).json({message:"success",device:updateRecord});
            }else{
                //create new Images
                const newDevice = new DeviceResource({
                    _id : mongoose.Types.ObjectId(),
                    device :deviceId,
                    filesPath : filePaths
                })
                const saveImage = await newDevice.save()
                res.status(200).json({message:'Success',device:saveImage});
            }
        });
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
});

function pile_error_messages(errors){
    let error_messages = [] 
    Object.entries(errors).map(x => {
        let obj = {}
        obj[x[0]] = x[1].message
        error_messages.push(obj)
    })
    return error_messages
}

module.exports = router