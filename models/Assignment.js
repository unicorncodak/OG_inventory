const mongoose = require("mongoose")

const assignmentSchema = mongoose.Schema({
    itemId: {
        type: String,
        default: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Device"
    },
    device_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device"
    },
    ogId: {
        type: String
    },
    full_name: {
        type: String
    },
    itemOutDate: {
        type: Date,
    },
    itemQtyGiven: {
        type: Number
    },
    givenById: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    assigned: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Assignment", assignmentSchema)