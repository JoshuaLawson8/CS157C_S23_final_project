FROM mongo

COPY yelp_academic_dataset_review.json /yelp_academic_dataset_review.json
COPY yelp_academic_dataset_business.json /yelp_academic_dataset_business.json

CMD mongoimport --host mongodb --db yelp --collection reviews --type json --file /yelp_academic_dataset_review.json; mongoimport --host mongodb --db yelp --collection business --type json --file /yelp_academic_dataset_business.json