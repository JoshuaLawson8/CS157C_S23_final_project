# CS157C_S23_final_project

Pulls various metrics out of a yelp data set, such as:

- highest reviewed, most rated restaurant

- worst reviewed, most rated restaurant

- little known, but well rated

- and many more!

To build the whole project, use `docker compose up` in the base directory. 

To run individual containers, run either `docker compose up frontend` or `docker compose up backend`

# Initializing the database

The mongo-seed container will automatically populate the mongodb instance for you.

- download the file `yelp_academic_dataset_review.json` from https://www.kaggle.com/datasets/yelp-dataset/yelp-dataset?select=yelp_academic_dataset_review.json

- download the file `yelp_academic_dataset_business.json` from https://www.kaggle.com/datasets/yelp-dataset/yelp-dataset?select=yelp_academic_dataset_business.json

- Add `yelp_academic_dataset_review.json` to the mongo-seed directory. 

- Add `yelp_academic_dataset_business.json` to the mongo-seed directory.

- After this, simply run `docker compose up mongo-seed` and the database will be initalized. Do be warned, it's a 5gb file and the loading will take 1-2 minutes.

Change in code & reload service by:
- `docker-compose up --force-recreate --build -d backend`
or
- `docker-compose up --force-recreate --build -d frontend`
or 
- `docker-compose up --force-recreate --build -d mongo-seed`
and run this to clean old images:
- `docker image prune -f`

Check service logs:
- `docker compose logs -f <service_name>`
- (backend, frontend, mongo-seed, or mongodb)


[Report on Google Doc](https://docs.google.com/document/d/17gdmrSls8qi8XwBnr2FxYBRLcjbqvjcUfUfsx5EISfE/)
