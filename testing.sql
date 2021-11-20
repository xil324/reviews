-- select count(*) from index; 5774954

-- select * from index limit 58000;  49.481 ms

-- select a.id as review_id, a.rating, a.summary, a.recommend, a.reponse as response, a.body,a.date,
-- a.reviewer_name,a.helpfulness, json_agg(json_build_object('id',b.id,'url',b.url)) as photos from testing a left join photo b
-- on a.id = b.review_id
-- left join index c
-- on a.id = c.review_id
-- where c.product_id = 1000011
-- group by a.id, a.rating, a.summary,a.recommend,a.reponse,a.body,a.date, a.reviewer_name, a.helpfulness
-- order by helpfulness DESC;
-- average time 1.5ms-2ms

-- select a.rating, count(*) from testing a left join index b on a.id = b.review_id
-- where b.product_id=101111
--  group by a.rating
--  should be within in 6ms


-- select product_id, name, (sum(value)/count(review_id))::numeric(10,4) as avg_value
-- from characteristics_combine
-- where product_id = 100489
-- group by product_id, name;
--10-20ms initially


select helpfulness from testing where id = 214297;
-- < 1ms
