import mongoose from 'mongoose';

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const DEFAULTS = { difficulty: 'easy', servings: 1, vegetarian: false, steps: [] };

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    cuisine: { type: String, required: true, trim: true, maxlength: 40 },
    difficulty: { type: String, default: DEFAULTS.difficulty },
    minutes: { type: Number, required: true },
    servings: { type: Number, default: DEFAULTS.servings },
    vegetarian: { type: Boolean, default: DEFAULTS.vegetarian },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Recipe = mongoose.model('Recipe', recipeSchema);
