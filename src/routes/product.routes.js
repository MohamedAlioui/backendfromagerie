import express from 'express';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: 'Get all products' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        res.status(200).json({ message: `Get product ${req.params.id}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new product
router.post('/', async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        // TODO: Add validation
        res.status(201).json({ 
            message: 'Product created successfully',
            product: { name, description, price, category, stock }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        // TODO: Add validation
        res.status(200).json({ 
            message: `Product ${id} updated successfully`,
            product: { id, name, description, price, category, stock }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        res.status(200).json({ message: `Product ${id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        res.status(200).json({ 
            message: `Get products in category ${category}`,
            category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
