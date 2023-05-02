FROM mongo

COPY yelp_academic_dataset_review.json /yelp_academic_dataset_review.json
COPY yelp_academic_dataset_business.json /yelp_academic_dataset_business.json

COPY setup.sh /setup.sh

RUN ["chmod", "+x", "/setup.sh"]

CMD ["/setup.sh"]
