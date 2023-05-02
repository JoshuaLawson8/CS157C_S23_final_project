#!/bin/bash


# check the collection has business data
if [[ $(mongosh --host mongodb --quiet --eval "db.business.countDocuments()" yelp) -eq 0 ]]; then
    echo "Importing yelp business data into mongodb..."
    mongoimport --host mongodb --db yelp --collection business --type json --file /yelp_academic_dataset_business.json
    echo "Done importing yelp business data into mongodb."
else
    echo "MongoDB already has yelp business data."
fi

# check the collection has review data
if [[ $(mongosh --host mongodb --quiet --eval "db.reviews.countDocuments()" yelp) -eq 0 ]]; then
    echo "Importing yelp review data into mongodb..."
    mongoimport --host mongodb --db yelp --collection reviews --type json --file /yelp_academic_dataset_review.json
    echo "Done importing yelp review data into mongodb."
else
    echo "MongoDB already has yelp review data."
fi


# check the collection has indexes
# if [[ $(mongosh --host mongodb --quiet --eval "db.reviews.getIndexes().length" yelp) -eq 1 ]]; then
#     echo "Creating indexes..."
#     mongosh --host mongodb --quiet --eval "db.reviews.createIndex({business_id: 1, stars: -1, date: -1})" yelp
#     mongosh --host mongodb --quiet --eval "db.reviews.createIndex({user_id: 1, date: -1})" yelp
#     mongosh --host mongodb --quiet --eval "db.reviews.createIndex({text: "text"})" yelp
#     echo "Done creating indexes."
# else
#     echo "MongoDB already has indexes."
# fi
