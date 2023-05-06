const express = require('express');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const ReviewModel = require('./ReviewModel');
const BusinessModel = require('./BusinessModel');
require('dotenv').config();

mongoose.connect(`${process.env.MONGO_URL || 'mongodb://localhost:27017'}/yelp`, { useNewUrlParser: true });

const mdb = mongoose.connection;

mdb.on('error', (err) => {
    console.error('Mongoose connection error: ', err)
})
mdb.on('connected', () => {
    console.log('Mongoose connected')
});

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
const port = 8080

app.get('/review', async (req, res) => {
    try {
        const review = await getOneReview();
        res.send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/reviews', async (req, res) => {
    const size = req.query.size || 15;
    const page = req.query.page || 1;
    const skip = (page - 1) * size;
    try {
        const reviews = await ReviewModel.find({}).skip(skip).limit(size);
        res.send(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/review/search/:id', async (req, res) => {
    try {
        const review = await getByID(req.params.id);
        if (!review) {
            res.status(404).send('Review not found');
            return;
        }
        res.send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


app.post('/review/post', async (req, res) => {
    try {
        console.log(req.body);
        const review = await createReview(req.body);
        res.status(201).send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.delete('/review/delete/:id', async (req, res) => {
    try {
        const review = await deleteReview(req.params.id);
        if (!review) {
            res.status(404).send('Review not found');
            return;
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.patch('/review/update/:id', async (req, res) => {
    try {
        const review = await updateByID(req.params.id, req.body);
        if (!review) {
            res.status(404).send('Review not found');
            return;
        }
        res.status(200).send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/business', async (req, res) => {
    try {
        const business = await getOneBusiness();
        if (!business) {
            res.status(404).send('Business not found');
            return;
        }
        res.send(business);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/businesses', async (req, res) => {
    const size = req.query.size || 15;
    const page = req.query.page || 1;
    const name = req.query.name || '';

    const skip = (page - 1) * size;
    const query = {};
    if (name !== '') {
        query.name = { $regex: name, $options: 'i' };
    }

    try {
        const reviews = await BusinessModel.find(query).skip(skip).limit(size);
        res.send(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/business/search/:id', async (req, res) => {
    try {
        const business = await getByIDBusiness(req.params.id);
        if (!business) {
            res.status(404).send('Business not found');
            return;
        }
        res.send(business);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


app.post('/business/post', async (req, res) => {
    try {
        console.log(req.body);
        const business = await createBusiness(req.body);
        res.status(201).send(business);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.delete('/business/delete/:id', async (req, res) => {
    try {
        const business = await deleteBusiness(req.params.id);
        if (!business) {
            res.status(404).send('Business not found');
            return;
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/business/reviews/:name', async (req, res) => {
   try{
       const formattedStr = req.params.name.replace(/_/g, ' ').replace(/\b(\w)/g, (match) => match.toUpperCase());
       const reviews = await getBusinessReviews(formattedStr);
       if (!reviews){
           res.status(404).send('This business has no reviews')
           return;
       }
       res.send(reviews);
   } catch (err) {
       console.log(err);
       res.status(500).send(err.message);
   }
});

app.get('/business/:stars', async (req, res) => {
    try {
        const business = await getByStars(req.params.stars);
        if (!business) {
            res.status(404).send('5 stars restaurant not found');
            return;
        }
        res.send(business);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/restaurants/reservations', async (req, res) => {
   try{
       const business = await getReservations();
       if (!business) {
           res.status(404).send('No restaurant allows reservations');
           return;
       }
       res.send(business);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/restaurants/goodForGroups', async (req, res) =>{
   try{
       const business = await getGoodForGroups();
       if (!business){
           res.status(404).send('No restaurant is good for groups');
           return;
       }
       res.send(business);
   } catch (err){
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/restaurants/takeout', async (req, res) => {
   try{
       const business = await getTakeOut();
       if(!business){
           res.status(404).send('No takeout restaurants are found');
           return;
       }
       res.send(business);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/restaurants/most/reviews', async (req, res) => {
   try{
       const business = await getMostReviews();
       if(!business){
           res.status(404).send('No restaurants are found');
           return;
       }
       res.send(business);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/bestRated', async (req, res) => {
    try{
       const restaurant = await getBestRated();
       if(!restaurant){
           res.status(404).send('No restaurants are found');
           return;
       }
       res.send(restaurant);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/worstRated', async (req, res) => {
    try{
       const restaurant = await getWorstRated();
       if(!restaurant){
           res.status(404).send('No restaurants are found');
           return;
       }
       res.send(restaurant);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/littleKnown', async (req, res) => {
    try{
       const restaurant = await getLittleKnown();
       if(!restaurant){
           res.status(404).send('No restaurants are found');
           return;
       }
       res.send(restaurant);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/avgReviewLength', async (req, res) => {
    try{
       const length = await getAvgReviewLength();
       if(!length){
           res.status(404).send('No reviews are found');
           return;
       }
       res.send(length);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/avgReviews', async (req, res) => {
    try{
       const avg_rating = await getAvgReviews();
       if(!avg_rating){
           res.status(404).send('No reviews are found');
           return;
       }
       res.send(avg_rating);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/most4and5stars', async (req, res) => {
    try{
       const business = await getMost4and5Stars();
       if(!business){
           res.status(404).send('No business are found');
           return;
       }
       res.send(business);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/userSentiment', async (req, res) => {
    try{
       const sentiments = await getUserSentiment();
       if(!sentiments){
           res.status(404).send('No reviews are found');
           return;
       }
       res.send(sentiments);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/totalUniqueUsers', async (req, res) => {
    try{
       const totalUsers = await getTotalUniqueUsers();
       if(!totalUsers){
           res.status(404).send('No users are found');
           return;
       }
       res.send(totalUsers);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/funniestReview', async (req, res) => {
    try{
       const review = await getFunniestReview();
       if(!review){
           res.status(404).send('No review are found');
           return;
       }
       res.send(review);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/mostPositiveReviewer', async (req, res) => {
    try{
       const reviewer = await getMostPositiveReviewer();
       if(!reviewer){
           res.status(404).send('No reviewer are found');
           return;
       }
       res.send(reviewer);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.get('/mostReviewer', async (req, res) => {
    try{
       const reviewer = await getMostReviewer();
       if(!reviewer){
           res.status(404).send('No reviewer are found');
           return;
       }
       res.send(reviewer);
   } catch (err) {
       console.error(err);
       res.status(500).send(err.message)
   }
});

app.patch('/business/update/:id', async (req, res) => {
    try {
        const business = await updateByIDBusiness(req.params.id, req.body);
        if (!business) {
            res.status(404).send('Business not found');
            return;
        }
        res.status(200).send(business);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});


// Reviews
const getOneReview = async () => {
    return ReviewModel.findOne({});
}

const createReview = async (review) => {
    const newReview = new ReviewModel(review);
    return newReview.save();
}

const deleteReview = async (id) => {
    return ReviewModel.findOneAndDelete({ review_id: id });
}

const getByID = async (id) => {
    return ReviewModel.findOne({ review_id: id });
}

const updateByID = async (id, review) => {
    return ReviewModel.findOneAndUpdate({review_id: id}, {
        $set: review
    }, {
        new: true
    });
}

// get business' reviews
const getBusinessReviews = async (name) => {
    return BusinessModel.aggregate([ { $match: { name: name } },{ $lookup: { from: ReviewModel, localField: "business_id", foreignField: "business_id", as: "Reviews" } }]);
}

// get overall reviews' rating
const getAvgReviews = async () => {
    return ReviewModel.aggregate([{$group: {_id: null, avg_rating: {$avg: "$stars" }}}])
}

// get average reviews' text length
const getAvgReviewLength = async () => {
    return ReviewModel.aggregate([{$group: { _id: null, avgLength: { $avg: { $strLenCP: "$text"}}}}]);
}

// get the funniest review
const getFunniestReview = async () => {
    return ReviewModel.find().sort({funny: -1}).limit(1);
}

// Business
const getOneBusiness = async () => {
    return BusinessModel.findOne({});
}

const createBusiness = async (review) => {
    const newBusiness = new BusinessModel(review);
    return newBusiness.save();
}

const deleteBusiness = async (id) => {
    return BusinessModel.findOneAndDelete({ business_id: id });
}

const getByIDBusiness = async (id) => {
    return BusinessModel.findOne({ business_id: id });
}

// get the restaurant with best rating
const getBestRated = async () => {
    return BusinessModel.find({categories: "Restaurants"}).sort({stars: -1}).limit(1);
}

// get the restaurant with worst rating
const getWorstRated = async () => {
    return BusinessModel.find({categories: "Restaurants"}).sort({stars: 1}).limit(1);
}

// get the business with most reviews
const getMostReviews = async () => {
    return BusinessModel.find().sort({review_count: -1}).limit(1);
}

// get little known restaurants which have the least reviews but mostly
// positive
const getLittleKnown = async () => {
    return BusinessModel.find({categories: "Restaurants", review_count: {$gt: 0}}).sort({stars: -1, review_count: 1}).limit(5);
}

// get the restaurants with the most 4 and 5 stars reviews
const getMost4and5Stars = async () => {
    const top_businesses = await ReviewModel.aggregate([{ $match: { stars: { $in: [4, 5] } } },{ $group: { _id: "$business_id", count: { $sum: 1 } } },{ $sort: { count: -1 } },{ $limit: 5 }]);
    return BusinessModel.find({ business_id: { $in: top_businesses.map(business => business._id) } });
}

// filter business with certain star rating
const getByStars = async (stars) => {
    return BusinessModel.find({ stars: stars }).limit(15);
}

// get business that allows reservations
const getReservations = async () => {
    return BusinessModel.find({ "attributes.RestaurantsReservations": "True" }).limit(15);
}

// get business that is good for groups
const getGoodForGroups = async () =>{
    return BusinessModel.find({ "attributes.RestaurantsGoodForGroups": "True" }).limit(15);
}

// get business that allows takeout order
const getTakeOut = async () => {
    return BusinessModel.find({ "attributes.RestaurantsTakeOut": "True" }).limit(15);
}

// get overall users' sentiment
const getUserSentiment = async () => {
    return ReviewModel.aggregate([{$group: {_id: "$user_id", avg_rating: {$avg: "$stars"}}}]);
}

// count the number of total unique users
const getTotalUniqueUsers = async () => {
    return ReviewModel.aggregate([{$group: {_id: "$user_id",count: { $sum: 1 }}},{$group: {_id: null,total: { $sum: 1 }}}]);
}

const getMostPositiveReviewer = async () => {
    return ReviewModel.aggregate([{$match: {stars: 5}},{$group: {_id: "$user_id", count: {$sum: 1}}},{$sort: {count: -1}},{$limit: 1},{$project: {_id: 1}}]);
}

const getMostReviewer = async () => {
    return ReviewModel.aggregate([{ $group: { _id: "$user_id", count: { $sum: 1 } } },{ $sort: { count: -1 } },{ $limit: 1 }])
}

const updateByIDBusiness = async (id, review) => {
    return BusinessModel.findOneAndUpdate({ business_id: id }, {
        $set: review
    }, {
        new: true
    });
}

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})




