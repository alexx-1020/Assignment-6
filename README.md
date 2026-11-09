# Recipes API

A REST API for a personal recipe box, built with **Node.js, Express 5 and MongoDB (Mongoose)**.
One resource, `recipes`, with full CRUD: create a recipe, list and search them, read one, replace it, change part of it, delete it. Everything is stored in a real MongoDB database, so the data survives a server restart.

Web Programming · Assignment 6 (REST API Project) · Alex Achkar

## Contents

1. [What it does](#what-it-does)
2. [Run it](#run-it)
3. [Configuration](#configuration)
4. [Project layout](#project-layout)
5. [The recipe object](#the-recipe-object)
6. [Routes at a glance](#routes-at-a-glance)
7. [Route reference with examples](#route-reference-with-examples)
8. [Errors and status codes](#errors-and-status-codes)
9. [Testing the API](#testing-the-api)
10. [Known limitations](#known-limitations)

## What it does

- Six REST routes on `/api/recipes` (list, read one, create, replace, partial update, delete)
- Filtering and search on the list: by title, cuisine, difficulty and vegetarian
- Validation on every create and update, answering with **all** the problems at once, in JSON
- The right status code for each outcome: `200`, `201`, `204`, `400`, `404`, `413`, `500`
- Every answer is JSON, including errors: no HTML error pages, no stack traces
- Bad input, a wrong id or a database outage never stop the server

## Run it

**You need:** Node.js **20.19 or newer** (`node -v`) and a MongoDB database.

**1. Install the dependencies**

```bash
npm install
```

**2. Get a MongoDB connection string** (pick one)

| Option | Connection string |
|---|---|
| **MongoDB Atlas** (free, cloud) | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/recipes_api?retryWrites=true&w=majority` |
| MongoDB installed on your machine | `mongodb://127.0.0.1:27017/recipes_api` |
| Docker: `docker run -d --name recipes-mongo -p 27017:27017 mongo:8` | `mongodb://127.0.0.1:27017/recipes_api` |

For Atlas: create a free cluster, add a database user under *Database Access*, allow your IP under *Network Access*, then copy the string from *Connect → Drivers* and write the database name `recipes_api` just before the `?`.

**3. Create your `.env` file**

```bash
cp .env.example .env
```

Open `.env` and replace the value of `MONGODB_URI` with your connection string. `.env` is listed in `.gitignore`, so the password never reaches git.

**4. Start the server**

```bash
npm start        # node server.js
npm run dev      # same, but restarts on every save
```

You should see:

```
connected to MongoDB
Recipes API listening on http://localhost:3000
```

Check it: open <http://localhost:3000/api/recipes> in a browser. A new database answers `[]`.

**If it does not start**

| The terminal says | What to do |
|---|---|
| `MONGODB_URI is not set. Copy .env.example to .env …` | Do step 3 |
| `DB connection failed: …` | Check the connection string and the password. On Atlas, check *Network Access* |
| `Could not listen on port 3000: …` | Another program is using the port. Stop it, or set another `PORT` in `.env` |

## Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | **yes** | none | MongoDB connection string |
| `PORT` | no | `3000` | Port the API listens on |

Requests from a front end running on `http://localhost:5173` (the Vite dev server) are allowed by CORS.

## Project layout

```
server.js               app setup, middleware, 404 and error handlers, connect to the database, then listen
routes/recipes.js       the six routes of the recipes resource (an Express router)
models/Recipe.js        Mongoose schema and model
validation/recipe.js    checks a request body and returns the list of problems
postman/                Postman collection (26 requests)
evidence/               curl transcript and server log from a real run
.env.example            template for .env
```

## The recipe object

| Field | Type | Required | Rules | Default |
|---|---|---|---|---|
| `title` | string | **yes** | 1 to 100 characters | |
| `cuisine` | string | **yes** | 1 to 40 characters, e.g. `"Lebanese"` | |
| `minutes` | number | **yes** | whole number, 1 to 1440 (total time to make it) | |
| `ingredients` | array of strings | **yes** | 1 to 50 items, each 1 to 80 characters | |
| `difficulty` | string | no | `easy`, `medium` or `hard` | `"easy"` |
| `servings` | number | no | whole number, 1 to 100 | `1` |
| `vegetarian` | boolean | no | `true` or `false` | `false` |
| `steps` | array of strings | no | up to 30 items, each 1 to 500 characters | `[]` |

Set by the server, never by the client: `_id` (MongoDB ObjectId), `createdAt`, `updatedAt`, `__v`.
Text is trimmed before it is stored. Fields that are not in this table are ignored.

## Routes at a glance

| Method | Path | What it does | Success | Errors |
|---|---|---|---|---|
| `GET` | `/` | Health check | `200` | |
| `GET` | `/api/recipes` | List recipes, newest first (optional filters) | `200` | `500` |
| `GET` | `/api/recipes/:id` | Get one recipe | `200` | `400`, `404` |
| `POST` | `/api/recipes` | Create a recipe | `201` | `400`, `413` |
| `PUT` | `/api/recipes/:id` | Replace a recipe (send the whole object) | `200` | `400`, `404` |
| `PATCH` | `/api/recipes/:id` | Change some fields of a recipe | `200` | `400`, `404` |
| `DELETE` | `/api/recipes/:id` | Delete a recipe | `204` | `400`, `404` |

Any other path or method answers `404 {"error":"Not found"}`.

## Route reference with examples

The examples use `curl`. Their output is copied from a real run, kept in full in [`evidence/curl-transcript.md`](evidence/curl-transcript.md). Your ids and dates will differ.

> In zsh, put a URL that contains `?` or `&` in quotes.

### `GET /` · health check

```bash
curl localhost:3000/
```

`200 OK`

```json
{ "status": "ok" }
```

### `POST /api/recipes` · create a recipe

The body is a JSON object with at least `title`, `cuisine`, `minutes` and `ingredients`. Send the header `Content-Type: application/json`.

```bash
curl -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mjaddara","cuisine":"Lebanese","difficulty":"easy","minutes":50,"servings":4,"vegetarian":true,"ingredients":["1 cup brown lentils","1/2 cup rice","3 onions","olive oil","salt"],"steps":["Boil the lentils for 15 minutes.","Add the rice and cook until soft.","Fry the onions until dark and serve on top."]}'
```

`201 Created`

```json
{
  "title": "Mjaddara",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 50,
  "servings": 4,
  "vegetarian": true,
  "ingredients": ["1 cup brown lentils", "1/2 cup rice", "3 onions", "olive oil", "salt"],
  "steps": [
    "Boil the lentils for 15 minutes.",
    "Add the rice and cook until soft.",
    "Fry the onions until dark and serve on top."
  ],
  "_id": "6af22839fd32d043ac3077e1",
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.614Z",
  "__v": 0
}
```

With only the required fields, the others get their defaults:

```bash
curl -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Shish Tawouk","cuisine":"Lebanese","minutes":35,"ingredients":["chicken breast","garlic","lemon","yogurt"]}'
```

`201 Created`

```json
{
  "title": "Shish Tawouk",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 35,
  "servings": 1,
  "vegetarian": false,
  "ingredients": ["chicken breast", "garlic", "lemon", "yogurt"],
  "steps": [],
  "_id": "6af22839fd32d043ac3077e2",
  "createdAt": "2026-11-09T20:08:25.628Z",
  "updatedAt": "2026-11-09T20:08:25.628Z",
  "__v": 0
}
```

**Invalid input** → `400 Bad Request`, with every problem listed:

```bash
curl -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mystery stew","cuisine":"Unknown","difficulty":"extreme","minutes":-5,"vegetarian":"yes","ingredients":[]}'
```

```json
{
  "error": "Validation failed",
  "problems": [
    "difficulty must be one of: easy, medium, hard",
    "minutes must be a whole number from 1 to 1440",
    "vegetarian must be true or false",
    "ingredients must have 1 to 50 items"
  ]
}
```

An empty object `{}` → `400`:

```json
{
  "error": "Validation failed",
  "problems": ["title is required", "cuisine is required", "minutes is required", "ingredients is required"]
}
```

### `GET /api/recipes` · list recipes

Returns an array, newest first. An empty database returns `[]`.

Optional query parameters, which can be combined:

| Parameter | Effect | Example |
|---|---|---|
| `search` | title contains this text (case-insensitive) | `?search=mjad` |
| `cuisine` | cuisine contains this text (case-insensitive) | `?cuisine=lebanese` |
| `difficulty` | exactly `easy`, `medium` or `hard` | `?difficulty=easy` |
| `vegetarian` | `true` or `false` | `?vegetarian=true` |

```bash
curl 'localhost:3000/api/recipes?cuisine=lebanese&vegetarian=false'
```

`200 OK`

```json
[
  {
    "_id": "6af22839fd32d043ac3077e2",
    "title": "Shish Tawouk",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 35,
    "servings": 1,
    "vegetarian": false,
    "ingredients": ["chicken breast", "garlic", "lemon", "yogurt"],
    "steps": [],
    "createdAt": "2026-11-09T20:08:25.628Z",
    "updatedAt": "2026-11-09T20:08:25.628Z",
    "__v": 0
  }
]
```

A filter that matches nothing returns `200 []`, not an error.

### `GET /api/recipes/:id` · get one recipe

```bash
curl localhost:3000/api/recipes/6af22839fd32d043ac3077e2
```

`200 OK` with the recipe object (same shape as above).

| Case | Answer |
|---|---|
| The id is not a MongoDB ObjectId (`/api/recipes/abc`) | `400 {"error":"Invalid id"}` |
| The id is well formed but no recipe has it | `404 {"error":"Recipe not found"}` |

### `PUT /api/recipes/:id` · replace a recipe

Send the **whole** recipe: the four required fields must be there. Optional fields you leave out go back to their defaults. The `_id` and `createdAt` stay the same.

```bash
curl -X PUT localhost:3000/api/recipes/6af22839fd32d043ac3077e1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mjaddara Hamra","cuisine":"Lebanese","difficulty":"medium","minutes":60,"ingredients":["1 cup brown lentils","1/2 cup bulgur","4 onions","olive oil"]}'
```

`200 OK` (note `servings`, `vegetarian` and `steps` are back to their defaults)

```json
{
  "_id": "6af22839fd32d043ac3077e1",
  "title": "Mjaddara Hamra",
  "cuisine": "Lebanese",
  "difficulty": "medium",
  "minutes": 60,
  "servings": 1,
  "vegetarian": false,
  "ingredients": ["1 cup brown lentils", "1/2 cup bulgur", "4 onions", "olive oil"],
  "steps": [],
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.701Z",
  "__v": 0
}
```

A body without every required field → `400`:

```bash
curl -X PUT localhost:3000/api/recipes/6af22839fd32d043ac3077e2 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Only a title"}'
```

```json
{
  "error": "Validation failed",
  "problems": ["cuisine is required", "minutes is required", "ingredients is required"]
}
```

Invalid id → `400`. Unknown id → `404` (PUT does not create a recipe).

### `PATCH /api/recipes/:id` · change some fields

Send only the fields to change. Everything else is left as it is.

```bash
curl -X PATCH localhost:3000/api/recipes/6af22839fd32d043ac3077e1 \
  -H 'Content-Type: application/json' \
  -d '{"servings":6,"vegetarian":true}'
```

`200 OK` with the updated recipe:

```json
{
  "_id": "6af22839fd32d043ac3077e1",
  "title": "Mjaddara Hamra",
  "cuisine": "Lebanese",
  "difficulty": "medium",
  "minutes": 60,
  "servings": 6,
  "vegetarian": true,
  "ingredients": ["1 cup brown lentils", "1/2 cup bulgur", "4 onions", "olive oil"],
  "steps": [],
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.716Z",
  "__v": 0
}
```

A body with no known field (`{}`) → `400`:

```json
{
  "error": "Validation failed",
  "problems": ["Send at least one field to update: title, cuisine, difficulty, minutes, servings, vegetarian, ingredients, steps"]
}
```

The fields you do send follow the same rules as on create. Invalid id → `400`. Unknown id → `404`.

### `DELETE /api/recipes/:id` · delete a recipe

```bash
curl -i -X DELETE localhost:3000/api/recipes/6af22839fd32d043ac3077e1
```

`204 No Content`, with an empty body. Asking for the same recipe afterwards:

```bash
curl localhost:3000/api/recipes/6af22839fd32d043ac3077e1
```

`404 Not Found`

```json
{ "error": "Recipe not found" }
```

Invalid id → `400`. Unknown id (or already deleted) → `404`.

## Errors and status codes

Every error is a JSON object with an `error` string. Validation errors also carry a `problems` array with one readable message per problem.

| Status | When | Body |
|---|---|---|
| `200 OK` | A read or an update worked | the recipe, or an array of recipes |
| `201 Created` | A recipe was created | the new recipe |
| `204 No Content` | A recipe was deleted | empty |
| `400 Bad Request` | The body breaks a rule | `{"error":"Validation failed","problems":[…]}` |
| `400 Bad Request` | The body is not valid JSON | `{"error":"Malformed JSON in request body"}` |
| `400 Bad Request` | The body is not a JSON object, or `Content-Type: application/json` is missing | `{"error":"Validation failed","problems":["Request body must be a JSON object (send Content-Type: application/json)"]}` |
| `400 Bad Request` | The id in the URL is not an ObjectId | `{"error":"Invalid id"}` |
| `404 Not Found` | No recipe has this id | `{"error":"Recipe not found"}` |
| `404 Not Found` | The route does not exist | `{"error":"Not found"}` |
| `413 Payload Too Large` | The body is larger than 100 KB | `{"error":"Request body is too large (limit: 100 KB)"}` |
| `500 Internal Server Error` | Something failed on the server, e.g. the database is unreachable | `{"error":"Internal server error"}` |

On a `500` the details go to the server's terminal only. The client never receives a stack trace or the database address.

## Testing the API

**Postman.** Import [`postman/recipes-api.postman_collection.json`](postman/recipes-api.postman_collection.json), start the server, then choose *Run collection*. It holds 26 requests in two folders:

- `1 · CRUD`: create two recipes, list, filter, search, read, replace, update, delete
- `2 · Validation and errors`: missing fields, invalid values, malformed JSON, wrong content type, invalid and unknown ids, unknown route

Each request checks its status code. The ids of the created recipes are saved in collection variables, so the requests run in order without any copying. If your server is not on port 3000, change the `baseUrl` variable. The collection deletes what it creates.

**curl.** [`evidence/curl-transcript.md`](evidence/curl-transcript.md) holds 24 commands with their real output: the full CRUD cycle, a server restart showing that the data is still in the database, and 10 error cases. [`evidence/server-log.txt`](evidence/server-log.txt) is what the server printed during that run.

## Known limitations

- `search` and `cuisine` are used as a regular expression. Characters such as `.` and `*` keep their special meaning, and an invalid pattern such as `?search=(` answers `500 {"error":"Internal server error"}`. The server keeps running.
- Repeating a filter (`?search=a&search=b`) also answers `500`. Filters that are not recognised are ignored.
- There is no pagination: the list returns every match.
- There are no user accounts, so anyone who can reach the API can change the recipes.
