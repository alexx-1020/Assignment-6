# curl transcript — Recipes API

Every command below was **actually executed** and the output pasted unedited, except that
response headers are trimmed to the status line and JSON bodies are pretty-printed.

- Run on: 2026-11-09T20:08:25.558Z
- Node.js v24.22.2, MongoDB 8.2.6 (local instance), server started with `node server.js` on port 3000
- Ids are real MongoDB ObjectIds from this run, so yours will differ.

## Part 1 · CRUD (happy path)

### 1. Health check

```bash
curl -s -i localhost:3000/
```

```http
HTTP/1.1 200 OK

{
  "status": "ok"
}
```

### 2. Create a recipe

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mjaddara","cuisine":"Lebanese","difficulty":"easy","minutes":50,"servings":4,"vegetarian":true,"ingredients":["1 cup brown lentils","1/2 cup rice","3 onions","olive oil","salt"],"steps":["Boil the lentils for 15 minutes.","Add the rice and cook until soft.","Fry the onions until dark and serve on top."]}'
```

```http
HTTP/1.1 201 Created

{
  "title": "Mjaddara",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 50,
  "servings": 4,
  "vegetarian": true,
  "ingredients": [
    "1 cup brown lentils",
    "1/2 cup rice",
    "3 onions",
    "olive oil",
    "salt"
  ],
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

### 3. Create a second recipe with only the required fields (the rest get defaults)

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Shish Tawouk","cuisine":"Lebanese","minutes":35,"ingredients":["chicken breast","garlic","lemon","yogurt"]}'
```

```http
HTTP/1.1 201 Created

{
  "title": "Shish Tawouk",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 35,
  "servings": 1,
  "vegetarian": false,
  "ingredients": [
    "chicken breast",
    "garlic",
    "lemon",
    "yogurt"
  ],
  "steps": [],
  "_id": "6af22839fd32d043ac3077e2",
  "createdAt": "2026-11-09T20:08:25.628Z",
  "updatedAt": "2026-11-09T20:08:25.628Z",
  "__v": 0
}
```

### 4. List all recipes (newest first)

```bash
curl -s -i localhost:3000/api/recipes
```

```http
HTTP/1.1 200 OK

[
  {
    "_id": "6af22839fd32d043ac3077e2",
    "title": "Shish Tawouk",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 35,
    "servings": 1,
    "vegetarian": false,
    "ingredients": [
      "chicken breast",
      "garlic",
      "lemon",
      "yogurt"
    ],
    "steps": [],
    "createdAt": "2026-11-09T20:08:25.628Z",
    "updatedAt": "2026-11-09T20:08:25.628Z",
    "__v": 0
  },
  {
    "_id": "6af22839fd32d043ac3077e1",
    "title": "Mjaddara",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 50,
    "servings": 4,
    "vegetarian": true,
    "ingredients": [
      "1 cup brown lentils",
      "1/2 cup rice",
      "3 onions",
      "olive oil",
      "salt"
    ],
    "steps": [
      "Boil the lentils for 15 minutes.",
      "Add the rice and cook until soft.",
      "Fry the onions until dark and serve on top."
    ],
    "createdAt": "2026-11-09T20:08:25.614Z",
    "updatedAt": "2026-11-09T20:08:25.614Z",
    "__v": 0
  }
]
```

### 5. List with a filter: vegetarian only

```bash
curl -s -i 'localhost:3000/api/recipes?vegetarian=true'
```

```http
HTTP/1.1 200 OK

[
  {
    "_id": "6af22839fd32d043ac3077e1",
    "title": "Mjaddara",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 50,
    "servings": 4,
    "vegetarian": true,
    "ingredients": [
      "1 cup brown lentils",
      "1/2 cup rice",
      "3 onions",
      "olive oil",
      "salt"
    ],
    "steps": [
      "Boil the lentils for 15 minutes.",
      "Add the rice and cook until soft.",
      "Fry the onions until dark and serve on top."
    ],
    "createdAt": "2026-11-09T20:08:25.614Z",
    "updatedAt": "2026-11-09T20:08:25.614Z",
    "__v": 0
  }
]
```

### 6. Filters combine: Lebanese and not vegetarian

```bash
curl -s -i 'localhost:3000/api/recipes?cuisine=lebanese&vegetarian=false'
```

```http
HTTP/1.1 200 OK

[
  {
    "_id": "6af22839fd32d043ac3077e2",
    "title": "Shish Tawouk",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 35,
    "servings": 1,
    "vegetarian": false,
    "ingredients": [
      "chicken breast",
      "garlic",
      "lemon",
      "yogurt"
    ],
    "steps": [],
    "createdAt": "2026-11-09T20:08:25.628Z",
    "updatedAt": "2026-11-09T20:08:25.628Z",
    "__v": 0
  }
]
```

### 7. Search by title (case-insensitive)

```bash
curl -s -i 'localhost:3000/api/recipes?search=MJAD'
```

```http
HTTP/1.1 200 OK

[
  {
    "_id": "6af22839fd32d043ac3077e1",
    "title": "Mjaddara",
    "cuisine": "Lebanese",
    "difficulty": "easy",
    "minutes": 50,
    "servings": 4,
    "vegetarian": true,
    "ingredients": [
      "1 cup brown lentils",
      "1/2 cup rice",
      "3 onions",
      "olive oil",
      "salt"
    ],
    "steps": [
      "Boil the lentils for 15 minutes.",
      "Add the rice and cook until soft.",
      "Fry the onions until dark and serve on top."
    ],
    "createdAt": "2026-11-09T20:08:25.614Z",
    "updatedAt": "2026-11-09T20:08:25.614Z",
    "__v": 0
  }
]
```

### 8. Get one recipe

```bash
curl -s -i localhost:3000/api/recipes/6af22839fd32d043ac3077e1
```

```http
HTTP/1.1 200 OK

{
  "_id": "6af22839fd32d043ac3077e1",
  "title": "Mjaddara",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 50,
  "servings": 4,
  "vegetarian": true,
  "ingredients": [
    "1 cup brown lentils",
    "1/2 cup rice",
    "3 onions",
    "olive oil",
    "salt"
  ],
  "steps": [
    "Boil the lentils for 15 minutes.",
    "Add the rice and cook until soft.",
    "Fry the onions until dark and serve on top."
  ],
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.614Z",
  "__v": 0
}
```

### 9. Replace a recipe (PUT: fields left out go back to their defaults)

```bash
curl -s -i -X PUT localhost:3000/api/recipes/6af22839fd32d043ac3077e1 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mjaddara Hamra","cuisine":"Lebanese","difficulty":"medium","minutes":60,"ingredients":["1 cup brown lentils","1/2 cup bulgur","4 onions","olive oil"]}'
```

```http
HTTP/1.1 200 OK

{
  "_id": "6af22839fd32d043ac3077e1",
  "title": "Mjaddara Hamra",
  "cuisine": "Lebanese",
  "difficulty": "medium",
  "minutes": 60,
  "servings": 1,
  "vegetarian": false,
  "ingredients": [
    "1 cup brown lentils",
    "1/2 cup bulgur",
    "4 onions",
    "olive oil"
  ],
  "steps": [],
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.701Z",
  "__v": 0
}
```

### 10. Update part of a recipe (PATCH: only what you send changes)

```bash
curl -s -i -X PATCH localhost:3000/api/recipes/6af22839fd32d043ac3077e1 \
  -H 'Content-Type: application/json' \
  -d '{"servings":6,"vegetarian":true}'
```

```http
HTTP/1.1 200 OK

{
  "_id": "6af22839fd32d043ac3077e1",
  "title": "Mjaddara Hamra",
  "cuisine": "Lebanese",
  "difficulty": "medium",
  "minutes": 60,
  "servings": 6,
  "vegetarian": true,
  "ingredients": [
    "1 cup brown lentils",
    "1/2 cup bulgur",
    "4 onions",
    "olive oil"
  ],
  "steps": [],
  "createdAt": "2026-11-09T20:08:25.614Z",
  "updatedAt": "2026-11-09T20:08:25.716Z",
  "__v": 0
}
```

### 11. Delete a recipe

```bash
curl -s -i -X DELETE localhost:3000/api/recipes/6af22839fd32d043ac3077e1
```

```http
HTTP/1.1 204 No Content
```

### 12. Get the deleted recipe

```bash
curl -s -i localhost:3000/api/recipes/6af22839fd32d043ac3077e1
```

```http
HTTP/1.1 404 Not Found

{
  "error": "Recipe not found"
}
```

## Part 2 · Persistence: restart the server, the data is still there

> The server process was stopped (`SIGTERM`, same as Ctrl+C) and started again with `node server.js`.

### 13. The second recipe survived the restart

```bash
curl -s -i localhost:3000/api/recipes/6af22839fd32d043ac3077e2
```

```http
HTTP/1.1 200 OK

{
  "_id": "6af22839fd32d043ac3077e2",
  "title": "Shish Tawouk",
  "cuisine": "Lebanese",
  "difficulty": "easy",
  "minutes": 35,
  "servings": 1,
  "vegetarian": false,
  "ingredients": [
    "chicken breast",
    "garlic",
    "lemon",
    "yogurt"
  ],
  "steps": [],
  "createdAt": "2026-11-09T20:08:25.628Z",
  "updatedAt": "2026-11-09T20:08:25.628Z",
  "__v": 0
}
```

## Part 3 · Validation and errors

### 14. Missing required fields

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{}'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "problems": [
    "title is required",
    "cuisine is required",
    "minutes is required",
    "ingredients is required"
  ]
}
```

### 15. Invalid values (every problem reported at once)

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mystery stew","cuisine":"Unknown","difficulty":"extreme","minutes":-5,"vegetarian":"yes","ingredients":[]}'
```

```http
HTTP/1.1 400 Bad Request

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

### 16. NoSQL operator instead of a string

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":{"$gt":""},"cuisine":"Any","minutes":10,"ingredients":["water"]}'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "problems": [
    "title must be a non-empty string"
  ]
}
```

### 17. Malformed JSON

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title": "Broken JSON",'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Malformed JSON in request body"
}
```

### 18. Body sent as text/plain instead of JSON

```bash
curl -s -i -X POST localhost:3000/api/recipes \
  -H 'Content-Type: text/plain' \
  -d '{"title":"Toast"}'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "problems": [
    "Request body must be a JSON object (send Content-Type: application/json)"
  ]
}
```

### 19. Invalid id format

```bash
curl -s -i localhost:3000/api/recipes/abc
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Invalid id"
}
```

### 20. Valid id format, but no such recipe

```bash
curl -s -i localhost:3000/api/recipes/507f1f77bcf86cd799439011
```

```http
HTTP/1.1 404 Not Found

{
  "error": "Recipe not found"
}
```

### 21. PUT without every required field

```bash
curl -s -i -X PUT localhost:3000/api/recipes/6af22839fd32d043ac3077e2 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Only a title"}'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "problems": [
    "cuisine is required",
    "minutes is required",
    "ingredients is required"
  ]
}
```

### 22. PATCH with nothing to update

```bash
curl -s -i -X PATCH localhost:3000/api/recipes/6af22839fd32d043ac3077e2 \
  -H 'Content-Type: application/json' \
  -d '{}'
```

```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "problems": [
    "Send at least one field to update: title, cuisine, difficulty, minutes, servings, vegetarian, ingredients, steps"
  ]
}
```

### 23. Unknown route

```bash
curl -s -i localhost:3000/api/nope
```

```http
HTTP/1.1 404 Not Found

{
  "error": "Not found"
}
```

### 24. Clean up

```bash
curl -s -i -X DELETE localhost:3000/api/recipes/6af22839fd32d043ac3077e2
```

```http
HTTP/1.1 204 No Content
```

