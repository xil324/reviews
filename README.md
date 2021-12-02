# Back-end Design for an Ecommerce Website (Review & Rating Section)

<summary><h2 style="display: inline-block">Table of Contents</h2></summary>
<li href="#about-the-project">Project Overview</li>
<li><a href="#built-with">Tech Stack</a></li>
<li><a href="#built-with">Installation</a></li>
<li><a href="#prerequisites">API Referrence</a></li>


<summary><h2 style="display: inline-block">Project Overview</h2></summary>
Redesign the curent back end system to support an outstanding increase in traffic and make the system able to handle web scale traffic loads. The current database consisted of over 5 million product reviews and over 10 million characteristics ratings


<summary><h2 style="display: inline-block">Tech Stack</h2></summary>

**Server:** Node, Express

**Database:** PostgreSQL

**Deployment:** AWS EC2 - 20.04 Ubuntu - 10gb SDD 1gb RAM

**Production Stress Testing:** Loader.io

**Load Balancer** NGINX

<summary><h2 style="display: inline-block">Installation</h2></summary>

Install with npm

```bash
  npm install
  npm start
```
<summary><h2 style="display: inline-block">API Referrence</h2></summary>

#### Get Reviews

  Returns all the reviews for a given product ID based on user-defined sorting logic

```http
  GET /reviews?product_id=37211
```

Query Parameters

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `product_id` | `integer` | Specifies the product for which to retrieve reviews. |
| `page` | `integer` | Specifies the page of results to return. Default 1 |
| `count` | `integer` | Specifies how many results per page to return. Default 5. |
| `sort` | `text` | Changes the sort order of reviews to be based on "newest", "helpful", or "relevant" |

Response

[
    {
        "review_id": 214296,
        "rating": 1,
        "summary": "Quia modi consequatur a magni rem quos eos provident consequatur.",
        "recommend": false,
        "response": "null",
        "body": "Sunt similique eaque consequuntur. Porro voluptatem quibusdam. Nulla et repellat suscipit. Facere nam hic ut sapiente ut pariatur ipsum ut.",
        "date": "2020-06-15 06:42:54-07",
        "reviewer_name": "Ima_Hills",
        "helpfulness": 12,
        "photos": [
            {
                "id": 101416,
                "url": "https://images.unsplash.com/photo-1557760257-b02421ae77fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2089&q=80"
            }
        ]
    },
    {
        "review_id": 5774997,
        "rating": 5,
        "summary": "'this is a great product'",
        "recommend": true,
        "response": null,
        "body": "'I don''t know but this is a good product'",
        "date": "2021-12-02 17:25:09",
        "reviewer_name": "postgres",
        "helpfulness": 0,
        "photos": [
            {
                "id": 23,
                "url": "https://images.unsplash.com/photo-1560570803-7474c0f9af99?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80"
            }
        ]
    }
]



#### Get Characteristics MetaData for Reviews
  
  Returns characterisitcs metadata for a given product ID 

```http
  GET /reviews/meta?product_id=37211
```

Query Parameters

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `product_id`      | `integer` | Required ID of the product for which data should be returned|


  Response
 
{
    "product_id": "37211",
    "ratings": {
        "1": "1",
        "3": "1",
        "5": "1"
    },
    "recommend": {
        "0": "2",
        "1": "1"
    },
    "characteristics": {
        "comfort": {
            "value": "5.0000"
        },
        "fit": {
            "value": "4.0000"
        },
        "length": {
            "value": "2.0000"
        },
        "quality": {
            "value": "5.0000"
        }
    }
}

### Post a Review 
Adds a review for the given product
```http
 POST /reviews
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `product_id`      | `integer` | Required ID of the product to post the review for|
|`rating`|`integer`|Integer (1-5) indicating the review rating|
|`summary`|`text`|Summary text of the review|
|`body`|`text`|Continued or full text of the review|
|`recommend`|`bool`Value indicating if the reviewer recommends the product|
|`name`|`text`|Username for question asker|
|`email`|`text`|Email address for question asker|
|`photo`|`[text]`|Array of text urls that link to images to be shown|
|`characteristics`|`object`|Object of keys representing characteristic_id and values representing the review value for that characteristic. { "14": 5, "15": 5 //...}|

### Mark Review as Helpful

Updates a review to show it was found helpful

```http
 PUT /reviews/:review_id/helpful
```
Query Parameters

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`review_id`|`integer`|Required ID of the review to update|


### Report Review

Updates a review to show it was reported

```http
 PUT /reviews/:review_id/report
```
Query Parameters

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`review_id`|`integer`|Required ID of the review to update|





