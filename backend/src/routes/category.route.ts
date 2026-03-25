import { Hono } from 'hono';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';

const categoryRouter = new Hono();

// GET /categories
categoryRouter.get('/', async (c) => {
    try {
        const allCategories = await db.select().from(categories);
        return c.json({ categories: allCategories }, 200);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return c.json({ message: 'Internal Server Error' }, 500);
    }
});

export default categoryRouter;
