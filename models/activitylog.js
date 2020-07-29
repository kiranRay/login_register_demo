const mongoose = require('mongoose');

const activitylogSchema = new mongoose.Schema({
    user_id :String,
    activity: String,
    user_agent: String,
    os: String,
    device: String,
    user_ip: String,
    country: String,
    time: {
        type: Date,
        default: Date.now()
    }
});

const Activitylog = new mongoose.model('Activitylog', activitylogSchema);

module.exports.activitylogSchema = activitylogSchema;
module.exports.Activitylog = Activitylog;