import express from 'express';
import mongoose from 'mongoose';
import { Recipe, DEFAULTS } from '../models/Recipe.js';
import { FIELDS, validateRecipe } from '../validation/recipe.js';

const router = express.Router();

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

function recipeFields(body) {
  const data = {};
  FIELDS.forEach(field => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  if (data.ingredients) data.ingredients = data.ingredients.map(item => item.trim());
  if (data.steps) data.steps = data.steps.map(item => item.trim());
  return data;
}

function sendError(res, err) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

router.get('/', async (req, res) => {
  try {
    const { search, cuisine, difficulty, vegetarian } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search.trim(), $options: 'i' };
    if (cuisine) filter.cuisine = { $regex: cuisine.trim(), $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (vegetarian === 'true') filter.vegetarian = true;
    if (vegetarian === 'false') filter.vegetarian = false;
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/:id', checkId, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/', async (req, res) => {
  const problems = validateRecipe(req.body, false);
  if (problems.length > 0) {
    return res.status(400).json({ error: 'Validation failed', problems });
  }
  try {
    const recipe = await Recipe.create(recipeFields(req.body));
    res.status(201).json(recipe);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/:id', checkId, async (req, res) => {
  const problems = validateRecipe(req.body, false);
  if (problems.length > 0) {
    return res.status(400).json({ error: 'Validation failed', problems });
  }
  try {
    const data = { ...DEFAULTS, ...recipeFields(req.body) };
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/:id', checkId, async (req, res) => {
  const problems = validateRecipe(req.body, true);
  if (problems.length > 0) {
    return res.status(400).json({ error: 'Validation failed', problems });
  }
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, recipeFields(req.body), { returnDocument: 'after', runValidators: true });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/:id', checkId, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.sendStatus(204);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
