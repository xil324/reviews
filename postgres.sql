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

-- ETL:

COPY reviewlist from 'review.csv' DELIMITER ',' CSV HEADER;
COPY photo from 'reviews_photos.csv' DELIMITER ',' CSV HEADER;
COPY characteristics from 'characteristics.csv' DELIMITER ',' CSV HEADER;
COPY characteristics_review from 'characteristics_review.csv' DELIMITER ',' CSV HEADER;

-- convert data before send back
update reviewlist
set date = to_timestamp((date::bigint)/1000);

-- create table to get characteristic name and value

create table characteristics_combine as
SELECT b.product_id,a.review_id,c.id as characteristic_id, c.name, a.value from characteristics_review a
left join reviewlist b
on a.review_id = b.id
left join characteristics c
on a.characteristics_id = c.id and b.product_id = c.product_id

-- create table to get the average characteristic score for each product

create table characteristics_total as
select product_id, name, sum(value) as sum, (sum(value)/count(review_id))::numeric(10,4) as avg_value
  from characteristics_combine where product_id = 37211
group by product_id, name;



-- add page column to reviewlist so that review can be filtered by page and count
create table reviewlist_page as
select *, (row_number()over(partition by product_id order by helpfulness)-1) / 10+1 as page
from reviewlist;
alter table reviewlist_page
add recommend_transform INT ;

-- add a recommend_transform to make it easier when sending the data back to users

update reviewlist_page
set recommend_transform = 0 where recommend = false;
update reviewlist_page
set recommend_transform = 1 where recommend = true;


alter table reviewlist_page
add PRIMARY KEY(id);



-- make table reviewlist_page id column auto_increemnet
-- create sequence seq increment 1 start 5774953;
-- alter  table reviewlist_page alter column id set default nextval('seq');


-- alter table characteristics_combine
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);

--  alter table photo
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);
--  alter table index
--  ADD CONSTRAINT fk FOREIGN KEY (review_id) REFERENCES testing (id);

-- alter table testing add constraint review_id primary key(id);