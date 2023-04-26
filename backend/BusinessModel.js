const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    business_id: String,
    name: String,
    address: String,
    city: String,
    state: String,
    postal_code: String,
    latitude: Number,
    longitude: Number,
    stars: Number,
    review_count: Number,
    is_open: Number,
    attributes:{
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    categories: String,
    hours: {
     Monday: String,
     Tuesday: String,
     Wednesday: String,
     Thursday: String,
     Friday: String,
     Saturday: String
    }
});

module.exports = mongoose.model('Business', BusinessSchema);
