#!/bin/bash

# check the database has business data
if [[ $(mongosh --host mongodb --quiet --eval "db.business.countDocuments()" yelp) -eq 0 ]]; then
    echo "Importing yelp business data into mongodb..."
    mongoimport --host mongodb --db yelp --collection business --type json --file /yelp_academic_dataset_business.json
    echo "Done importing yelp business data into mongodb."
else
    echo "MongoDB already has yelp business data."
fi

# check the database has review data
if [[ $(mongosh --host mongodb --quiet --eval "db.reviews.countDocuments()" yelp) -eq 0 ]]; then
    echo "Importing yelp review data into mongodb..."
    mongoimport --host mongodb --db yelp --collection reviews --type json --file /yelp_academic_dataset_review.json
    echo "Done importing yelp review data into mongodb."
else
    echo "MongoDB already has yelp review data."
fi


# check the collection reviews has indexes
if [[ $(mongosh --host mongodb --quiet --eval "db.reviews.getIndexes().length" yelp) -eq 1 ]]; then
    echo "Creating indexes on reviews collection..."
    mongosh --host mongodb --quiet --eval "db.reviews.createIndex({review_id: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.reviews.createIndex({business_id: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.reviews.createIndex({user_id: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.reviews.createIndex({stars: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.reviews.createIndex({funny: 1})" yelp
    echo "Done creating indexes on reviews collection."
else
    echo "MongoDB already has indexes on reviews collection."
fi


# check the collection business has indexes
if [[ $(mongosh --host mongodb --quiet --eval "db.business.getIndexes().length" yelp) -eq 1 ]]; then
    echo "Creating indexes on business collection..."
    mongosh --host mongodb --quiet --eval "db.business.createIndex({business_id: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.business.createIndex({name: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.business.createIndex({review_count: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.business.createIndex({stars: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.business.createIndex({categories: 1})" yelp
    mongosh --host mongodb --quiet --eval "db.business.createIndex({review_count: 1})" yelp
    echo "Done creating indexes on business collection."
else
    echo "MongoDB already has indexes on business collection."
fi