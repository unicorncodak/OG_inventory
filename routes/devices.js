const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Device = require("../models/Device")
const Assignment = require("../models/Assignment")

const { Validator } = require('node-input-validator')

// Importing middlewares
const isAuthAdmin = require('../middleware/isAuthAdmin');

router.get("/", isAuthAdmin, async(req, res) => {
    try{
        const devices = await Device.find({})
        res.status(200).json({message: "List of registered Devices", devices: devices})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})        
    }
})

router.post("/upload", isAuthAdmin/*, upload.multiple()*/, async(req, res) => {
    try{        
        res.status(200).json({message: "Images saved successfully!", file: req.files})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Got some errors",errors: err})        
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
            'items.*.itemColor': 'required'
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
            const device = await Device.findOne({itemId: req.body.itemId})
            res.status(200).json({message: "Device Data Retrieved Successfully", data: device})
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
            itemColor: 'required'
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
            itemSerialNumber: 'required',
            itemModel: 'required',
            itemColor: 'required'
          });
         
        const matched = await v.check()
        if (!matched) {
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{            
            const device = new Device(req.body)
            device.itemId = mongoose.Types.ObjectId()
            await device.save()        
            const assignment = new Assignment({itemId: device.itemId})
            await assignment.save()
            res.status(200).json({message: "Device saved successfully", data: device})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
})

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