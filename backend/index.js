const express = require('express');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const ReviewModel = require('./ReviewModel');
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

app.get('/', async (req, res) => {
    try {
        const review = await getOneReview();
        res.send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/:id', async (req, res) => {
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


app.post('/', async (req, res) => {
    try {
        console.log(req.body);
        const review = await createReview(req.body);
        res.status(201).send(review);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.delete('/:id', async (req, res) => {
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

app.patch('/:id', async (req, res) => {
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


app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})




