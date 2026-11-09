import { DIFFICULTIES } from '../models/Recipe.js';

export const FIELDS = ['title', 'cuisine', 'difficulty', 'minutes', 'servings', 'vegetarian', 'ingredients', 'steps'];
const REQUIRED = ['title', 'cuisine', 'minutes', 'ingredients'];

function checkText(name, value, max, problems) {
  if (typeof value !== 'string' || !value.trim()) {
    problems.push(`${name} must be a non-empty string`);
  } else if (value.trim().length > max) {
    problems.push(`${name} must be at most ${max} characters`);
  }
}

function checkWholeNumber(name, value, min, max, problems) {
  if (typeof value !== 'number' || value % 1 !== 0 || value < min || value > max) {
    problems.push(`${name} must be a whole number from ${min} to ${max}`);
  }
}

function checkList(name, value, minItems, maxItems, maxLength, problems) {
  if (!Array.isArray(value)) {
    problems.push(`${name} must be an array of strings`);
  } else if (value.length < minItems || value.length > maxItems) {
    problems.push(`${name} must have ${minItems} to ${maxItems} items`);
  } else if (value.filter(item => typeof item !== 'string' || !item.trim() || item.trim().length > maxLength).length > 0) {
    problems.push(`each item in ${name} must be a non-empty string of at most ${maxLength} characters`);
  }
}

export function validateRecipe(body, partial) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Request body must be a JSON object (send Content-Type: application/json)'];
  }

  const problems = [];
  const { title, cuisine, difficulty, minutes, servings, vegetarian, ingredients, steps } = body;

  if (partial) {
    if (FIELDS.filter(field => body[field] !== undefined).length === 0) {
      problems.push(`Send at least one field to update: ${FIELDS.join(', ')}`);
    }
  } else {
    REQUIRED.forEach(field => {
      if (body[field] === undefined) problems.push(`${field} is required`);
    });
  }

  if (title !== undefined) checkText('title', title, 100, problems);
  if (cuisine !== undefined) checkText('cuisine', cuisine, 40, problems);
  if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) {
    problems.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }
  if (minutes !== undefined) checkWholeNumber('minutes', minutes, 1, 1440, problems);
  if (servings !== undefined) checkWholeNumber('servings', servings, 1, 100, problems);
  if (vegetarian !== undefined && typeof vegetarian !== 'boolean') {
    problems.push('vegetarian must be true or false');
  }
  if (ingredients !== undefined) checkList('ingredients', ingredients, 1, 50, 80, problems);
  if (steps !== undefined) checkList('steps', steps, 0, 30, 500, problems);

  return problems;
}
