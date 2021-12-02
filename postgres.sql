--  /Applications/Postgres.app/Contents/Versions/14/bin/psql -p5432 "postgres"
-- CREATE DATABASE review;
-- \i filename
-- '\c databse'
-- '\dt show tables
-- \COPY <table name> TO 'location + file_name' DELIMITER ',' CSV HEADER;

CREATE TABLE reviewlist (
  ID  SERIAL,
  product_id INT NOT NULL,
  rating INT,
  date TEXT,
  summary TEXT DEFAULT NULL,
  body TEXT DEFAULT NULL,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT DEFAULT NULL,
  reviewer_email TEXT DEFAULT NULL,
  reponse TEXT DEFAULT NULL,
  helpfulness INT
);

CREATE TABLE photo (
  ID  SERIAL,
  review_id INT NOT NULL,
  url TEXT
);


CREATE TABLE characteristics (
  id SERIAL,
  product_id INT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE characteristics_review (
  id SERIAL,
  characteristics_id INT NOT NULL,
  review_id INT NOT NULL,
  value INT NOT NULL
);

CREATE TABLE index (
  product_id INT NOT NULL,
  review_id INT NOT NULL
)

-- ETL:

COPY reviewlist from 'reviews.csv' DELIMITER ',' CSV HEADER;
COPY photo from 'reviews_photos.csv' DELIMITER ',' CSV HEADER;
COPY characteristics from 'characteristics.csv' DELIMITER ',' CSV HEADER;
COPY characteristics_review from 'characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

-- convert data before send back
update reviewlist
set date = to_timestamp((date::bigint)/1000);

-- create table to get characteristic name and value

create table characteristics_combine as
SELECT b.product_id,a.review_id,c.id as characteristic_id, c.name, a.value from characteristics_review a
left join reviewlist b
on a.review_id = b.id
left join characteristics c
on a.characteristics_id = c.id and b.product_id = c.product_id;



-- add page column to reviewlist so that review can be filtered by page and count
create table testing as
select *, (row_number()over(partition by product_id order by helpfulness)-1) / 10+1 as page
from reviewlist;

alter table testing
add recommend_transform INT ;

-- add a recommend_transform to make it easier when sending the data back to users

update testing
set recommend_transform = 0 where recommend = false;
update testing
set recommend_transform = 1 where recommend = true;


create index review_index on testing(review_id);
create index review_index on photo(review_id);
create index product_index on characteristics_combine(product_id);
create index product_index on index(product_id);




-- alter table characteristics_combine
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);

--  alter table photo
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);
--  alter table index
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);

-- alter table testing add constraint review_id primary key(id);

