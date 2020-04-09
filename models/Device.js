const mongoose = require("mongoose")

const deviceSchema = mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    itemName:{
        type: String,
        required: true
    },
    itemLocation: {
        type: String,
        required: true
    },
    itemSerialNumber: {
        type: String
    },
    itemModel: {
        type: String,
        required: true
    },
    itemColor: {
        type: String,
        required: true
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    // dateCreated: {
    //     type: Date,
    //     default: Date.now()
    // },
    // dateUpdated: {
    //     type: Date,
    //     default: Date.now()
    // }
},
    { timestamps: true}
)

module.exports = mongoose.model("Device", deviceSchema)