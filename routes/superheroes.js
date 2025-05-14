const express = require('express');
const Superhero = require('../models/Superhero');
const auth = require('../middleware/auth');

const router = express.Router();

// Obtener todos (admin) o propios (user)
router.get('/', auth, async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const heroes = await Superhero.find(query);
    res.json(heroes);
});

// Crear superhéroe
router.post('/', auth, async (req, res) => {
    const hero = new Superhero({ ...req.body, owner: req.user.id });
    await hero.save();
    res.status(201).json(hero);
});

// Editar superhéroe
router.put('/:id', auth, async (req, res) => {
    const hero = await Superhero.findById(req.params.id);
    if (!hero) return res.status(404).json({ msg: 'No encontrado' });

    if (req.user.role !== 'admin' && hero.owner.toString() !== req.user.id)
        return res.status(403).json({ msg: 'No autorizado' });

    Object.assign(hero, req.body);
    await hero.save();
    res.json(hero);
});

// Eliminar superhéroe
router.delete('/:id', auth, async (req, res) => {
    const hero = await Superhero.findById(req.params.id);
    if (!hero) return res.status(404).json({ msg: 'No encontrado' });

    if (req.user.role !== 'admin' && hero.owner.toString() !== req.user.id)
        return res.status(403).json({ msg: 'No autorizado' });

    await hero.deleteOne();
    res.json({ msg: 'Eliminado' });
});

module.exports = router;
