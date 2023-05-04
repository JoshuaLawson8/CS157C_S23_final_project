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

app.get('/business/reviews/:id', async (req, res) => {
   try{
       const reviews = await getBusinessReviews(req.params.id);
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

app.get('/restaurants/goodforgroups', async (req, res) =>{
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
    return ReviewModel.findByIdAndDelete(id);
}

const getByID = async (id) => {
    return ReviewModel.findById(id);
}

const updateByID = async (id, review) => {
    return ReviewModel.findOneAndUpdate({_id: new ObjectId(id)}, {
        $set: review
    }, {
        new: true
    });
}

const getBusinessReviews = async (id) => {
    return ReviewModel.find({"business_id": id}).limit(15);
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
    return BusinessModel.findByIdAndDelete(id);
}

const getByIDBusiness = async (id) => {
    return BusinessModel.findById(id);
}

const getByStars = async (stars) => {
    return BusinessModel.find({ stars: stars }).limit(15);
}

const getReservations = async () => {
    return BusinessModel.find({ "attributes.RestaurantsReservations": "True" }).limit(15);
}

const getGoodForGroups = async () =>{
    return BusinessModel.find({ "attributes.RestaurantsGoodForGroups": "True" }).limit(15);
}

const getTakeOut = async () => {
    return BusinessModel.find({ "attributes.RestaurantsTakeOut": "True" }).limit(15);
}

const updateByIDBusiness = async (id, review) => {
    return BusinessModel.findOneAndUpdate({_id: new ObjectId(id)}, {
        $set: review
    }, {
        new: true
    });
}

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})




