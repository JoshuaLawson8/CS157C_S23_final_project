FROM mongo

COPY yelp_academic_dataset_review.json /yelp_academic_dataset_review.json
CMD mongoimport --host mongodb --db yelp --collection reviews --type json --file /yelp_academic_dataset_review.json
