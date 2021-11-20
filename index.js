const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const connection = {
  host: "localhost",
  user: "postgres",
  database: "review",
  port: 5432,
};

const db = pgp(connection);

app.use(express.json());

app.listen(3000, () => {
  console.log("listening port 3000!");
});

//GET /reviews/
// will return
// param: product_id, page, count
// results:[review_id, rating, summary, recommend, response, body, reviewer_name, helpfulness,
//photo[{id, url}]]

app.get("/reviews/", (req, res) => {
  var page = req.query.page !== undefined ? req.query.page : 1;
  var count = req.query.count !== undefined ? req.query.count : 5;
  var product_id = req.query.product_id;
  var sort = req.query.sort;
  var text = "";

  if (sort === "new") {
    text = `select a.id as review_id, a.rating, a.summary, a.recommend, a.reponse as response, a.body,a.date,
    a.reviewer_name,a.helpfulness, json_agg(json_build_object('id',b.id,'url',b.url)) as photos from testing a left join photo b
    on a.id = b.review_id
    left join index c
    on a.id = c.review_id
    where c.product_id = ${product_id} and a.reported <> 't'
    group by a.id, a.rating, a.summary,a.recommend,a.reponse,a.body,a.date, a.reviewer_name, a.helpfulness
     order by a.date DESC
    limit ${count}`;
  } else if (sort === "helpfulness") {
    text = `select a.id as review_id, a.rating, a.summary, a.recommend, a.reponse as response, a.body,a.date,
    a.reviewer_name,a.helpfulness, json_agg(json_build_object('id',b.id,'url',b.url)) as photos from testing a left join photo b
    on a.id = b.review_id
    left join index c
    on a.id = c.review_id
    where c.product_id = ${product_id} and a.reported <> 't'
    group by a.id, a.rating, a.summary,a.recommend,a.reponse,a.body,a.date, a.reviewer_name, a.helpfulness
     order by a.helpfulness DESC
     limit ${count}`;
  } else {
    text = `select a.id as review_id, a.rating, a.summary, a.recommend, a.reponse as response, a.body,a.date,
    a.reviewer_name,a.helpfulness, json_agg(json_build_object('id',b.id,'url',b.url)) as photos from testing a left join photo b
    on a.id = b.review_id
    left join index c
    on a.id = c.review_id
    where c.product_id = ${product_id} and a.reported <> 't'
    group by a.id, a.rating, a.summary,a.recommend,a.reponse,a.body,a.date, a.reviewer_name, a.helpfulness
    limit ${count} `;
  }

  db.query(text)
    .then((response) => {
      console.log("send the data back");
      res.send(response);
    })
    .catch((e) => {
      console.log(e);
    });
});

//GET /reviews/meta
//param: product_id
//product_id, rating:{2:1,3:1,4:2}, recommended:{0:5...}, characteristics;{Size:{id, value}
//Width{}, Comfort:{}}

app.get("/reviews/meta", (req, res) => {
  var product_id = req.query.product_id;
  var temp = [];
  var result = {};
  result["product_id"] = product_id;

  db.query(
    `select a.rating, count(*) from testing a left join index b on a.id = b.review_id where b.product_id=${product_id} group by a.rating`
  )
    .then((data) => {
      temp.push(data);
      return db.query(
        `select a.recommend_transform as recommend, count(*) from testing a left join index b on a.id = b.review_id where b.product_id =${product_id} group by a.recommend_transform
        `
      );
    })
    .then((data) => {
      console.log(data);
      temp.push(data);
      return db.query(
        `select product_id, name, (sum(value)/count(review_id))::numeric(10,4) as avg_value
        from characteristics_combine
        where product_id = ${product_id}
        group by product_id, name`
      );
    })

    .then((data) => {
      temp.push(data);
      console.log("data", data);
      const rate = {};
      const rem = {};
      const char = {};
      temp[0].forEach((item) => (rate[item.rating] = item.count));
      result["ratings"] = rate;
      temp[1].forEach((item) => (rem[item.recommend] = item.count));
      result["recommended"] = rem;
      temp[2].forEach((item) => {
        char[item.name] = { value: item.avg_value };
      });
      result["characteristics"] = char;
      res.send(result);
    })

    .catch((err) => {
      console.log(err);
    });
});

//POST /reviews
//product_id, rating, summary, body, recommended, name, email, photos, characteristics{id:value}

app.post("/reviews", (req, res) => {
  const product_id = req.body.product_id;
  const rating = req.body.rating;
  const summary = req.body.summary.replace(`'`, `''`);
  const body = req.body.body.replace(`'`, `''`);
  const recommend = req.body.recommend;
  const name = req.body.name;
  const email = req.body.email;
  const characteristics = req.body.characteristics;
  const photos = req.body.photos;
  var page = 0;
  var date = new Date().toISOString("en-US").split("T").join(" ").split(".")[0];
  var recommend_transform = false;
  recommend === true ? (recommend_transform = 1) : (recommend_transform = 0);
  var currReviewId = "";
  db.query(
    `select count(*) from testing a left join index b on a.id = b.review_id where b.product_id =${product_id}`
  )
    .then((data) => {
      console.log("writing data into testing");
      page = Math.floor((parseInt(data[0].count) - 1) / 10 + 1);
      return db.query(
        ` INSERT INTO testing (rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email
          ,helpfulness,page,recommend_transform)
          values(${rating},'${date}',quote_literal('${summary}'),quote_literal('${body}')
          ,${recommend},'f',${name},'${email}',0,${page},${recommend_transform})
          returning id
        `
      );
    })
    .then((data) => {
      console.log("writing data into photo");
      currReviewId = data[0].id;
      return Promise.all(
        photos.map((item) => {
          return db.query(
            `insert into photo (review_id,url) values(${currReviewId},'${item}')`
          );
        })
      );
    })
    .then(() => {
      console.log("updating index table");
      return db.query(
        `insert into index(product_id,review_id) values(${product_id},${currReviewId})`
      );
    })
    .then(() => {
      console.log("writing data into characteristics_combine");
      return Promise.all(
        Object.keys(characteristics).map((item) => {
          return db.query(`insert into characteristics_combine(product_id,review_id,name,value)
          values(${product_id}, ${currReviewId},'${item}',${characteristics[item]})`);
        })
      );
    })

    .then((data) => {
      res.send("POST IT");
    })
    .catch((err) => {
      console.log(err);
    });
});
// ${product_id}, ${rating},${summary},${body},${recommend},${name},${email},${page}
//PUT /reviews/:review_id/helpful
//update helpfulnes
app.put("/reviews/:review_id/helpful", (req, res) => {
  var id = req.params.review_id;
  db.query(`select helpfulness from testing where id = ${id}`)
    .then((data) => {
      const helpfulness = data[0].helpfulness;
      return db.query(
        `update testing set helpfulness = ${helpfulness}+1 where id = ${id}`
      );
    })
    .then(() => {
      res.send("UPDATE IT");
    })
    .catch((err) => {
      console.log(err);
    });
});

//PUT /reviews/:review_id/report
//update report

app.put("/reviews/:review_id/report", (req, res) => {
  db.query(
    `update testing set reported = 't' where id = ${req.params.review_id}`
  )
    .then(() => {
      res.send("REPORT IT");
    })
    .catch((err) => {
      console.log(err);
    });
});
