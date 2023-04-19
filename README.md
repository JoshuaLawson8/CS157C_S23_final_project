# CS157C_S23_final_project

To build the whole project, use `docker compose up` in the base directory. 

To run individual containers, run either `docker compose up frontend` or `docker compose up backend`

# Initializing the database

The mongo-seed container will automatically populate the mongodb instance for you.

- download the file `yelp_academic_dataset_review.json` from https://www.kaggle.com/datasets/yelp-dataset/yelp-dataset?select=yelp_academic_dataset_review.json

- Add `yelp_academic_dataset_review.json` to the mongo-seed directory. 

- After this, simply run `docker compose up mongo-seed` and the database will be initalized. Do be warned, it's a 5gb file and the loading will take 1-2 minutes.

[Report on Google Doc](https://docs.google.com/document/d/17gdmrSls8qi8XwBnr2FxYBRLcjbqvjcUfUfsx5EISfE/)
