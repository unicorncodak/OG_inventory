const express = require("express")
const router = express.Router()

const Assignment = require("../models/Assignment")
const User = require("../models/User")
const Device = require("../models/Device")

const { Validator } = require('node-input-validator')

// Importing middlewares
const isAuthAdmin = require('../middleware/isAuthAdmin');

router.get("/", isAuthAdmin, async(req, res) => {
    res.status(200).json({message: "Right here miss"})
})

router.get("/all", async(req, res) => {
    try{
        const devices_assigned = await Assignment.find({assigned: true}).populate("employee_id device_id" )
        res.json({message: "All Assigned Devices", assigned_devices: devices_assigned})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Error Occured", errors: err})    
    }
})

router.get("/unassigned", async(req, res) => {
    try{
        const devices_unassigned = await Assignment.find({assigned: false}).populate("employee_id device_id" )
        res.json({message: "All Unassigned Devices", unassigned_devices: devices_unassigned})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Error Occured", errors: err})    
    }
})

router.post("/undo", isAuthAdmin, async(req, res) => {
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
            if(device){
                const assigned = await Assignment.findOneAndUpdate({itemId: req.body.itemId}, {
                    assigned: false 
                }, {new: true})
                if(assigned){
                    res.status(200).json({message: "Device Unassigned successfully"})
                }else{
                    res.status(422).json({message: "Device Not Assigned Yet"})
                }
            }else{
                res.status(422).json({message: "Device Id Not Found"})
            }
        }
    }catch(err){
        console.log(err)
        res.status(422).json({message: err.name == "CastError" ? "Device ID provided not found in database" : "You have some errors there", errors: err})
    }
})

router.post("/modify", async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemId: "required",
            ogId: "required",
            itemOutDate: "required|date",
            itemQtyGiven: "required",
            givenById: "required"
        }, {itemOutDate: 'Date format should be YYYY-MM-DD'})

        const matched = await v.check()
        if(!matched){
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{
            const user = await User.findOne({ogId: req.body.ogId})
            const device = await Device.findOne({itemId: req.body.itemId})
            
            if(user && device){
                const assigned = await Assignment.findOneAndUpdate({itemId: req.body.itemId}, {
                    ogId: req.body.ogId,
                    itemOutDate: req.body.itemOutDate,
                    itemQtyGiven: req.body.itemQtyGiven,
                    givenById: req.body.givenById,
                    assigned: true
                }, {new: true})
                console.log(assigned)
                if(assigned){
                    res.status(201).json({message: "Device assigned to another employee successfully", device: device, user: user, assigment: assigned})
                }else{
                    res.status(200).json({message: "Device has not been assigned"})
                }
            }else{
                res.status(422).json({message: "Please provide valid device and user"})
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Error Occured", errors: err})    
    }
})

router.post("/employee", isAuthAdmin, async(req, res) => {
    try{
        const v = new Validator(req.body, {
            itemId: "required",
            ogId: "required",
            full_name: "required",
            itemOutDate: "required|date",
            itemQtyGiven: "required",
            givenById: "required"
        }, {itemOutDate: 'Date format should be YYYY-MM-DD'}) 

        const matched = await v.check()
        if(!matched){
            let error_messages = pile_error_messages(v.errors)
            res.status(422).json({message: "Validation Error", errors: error_messages})
        }else{
            // const user = await User.findOne({ogId: req.body.ogId})
            const device = await Device.findOne({itemId: req.body.itemId})
            const prev_assginment = await Assignment.findOne({itemId: req.body.itemId})
            
            if(device){
                if(device.itemType == "single" && prev_assginment != null){
                    res.status(422).json({message: "Device is single and has been assigned to an employee already"})
                }else{
                    req.body.device_id = device._id
                    if(req.body.itemQtyGiven > device.itemQuantity){
                        res.status(422).json({message: "Device quantity less than what you want to assign"})
                    }else{
                        const assigned = new Assignment(req.body)
                        await Assignment.findOneAndUpdate({itemId: req.body.itemId, assigned: false, ogId: null}, req.body)
                        
                        device.itemQuantity = device.itemQuantity - req.body.itemQtyGiven
                        await device.save()
                        if(assigned){
                            res.status(201).json({message: "Device assigned to employee successfully"})
                        }else{
                            res.status(200).json({message: "Device has been assigned already"})
                        }
                    }
                }
            }else{
                res.status(422).json({message: "Please provide a valid device id"})
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Error Occured", errors: err})       
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

module.exports = router