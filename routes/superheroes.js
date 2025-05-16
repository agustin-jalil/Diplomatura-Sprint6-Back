const express = require('express');
const Superhero = require('../models/Superhero');
const auth = require('../middleware/auth');

const router = express.Router();


// ✅ RUTA PÚBLICA - Obtener todos los superhéroes
router.get('/', async (req, res) => {
    try {
        const heroes = await Superhero.find();
        res.json(heroes);
    } catch (err) {
        res.status(500).json({ msg: 'Error al obtener los superhéroes' });
    }
});

// ✅ RUTA PÚBLICA - Obtener superhéroe por ID
router.get('/:id', async (req, res) => {
  try {
    const hero = await Superhero.findById(req.params.id).populate('owner', 'username role'); 
    // 👆 Esto trae solo `username` y `role` del user

    if (!hero) return res.status(404).json({ msg: 'No encontrado' });
    res.json(hero);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener el superhéroe' });
  }
});

// 🔒 RUTA PROTEGIDA - Crear superhéroe (solo usuario autenticado)
router.post('/', auth, async (req, res) => {
  try {
    console.log("BODY RECIBIDO EN EL BACKEND:", req.body); // <--- agrega esto

    const { name, power, image } = req.body;

    const newHero = await Superhero.create({
      name,
      power,
      image,
      owner: req.user.id,
    });

    res.status(201).json(newHero);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating superhero' });
  }
});


// 🔒 RUTA PROTEGIDA - Editar superhéroe
router.put('/:id', auth, async (req, res) => {
  try {
    const hero = await Superhero.findById(req.params.id);
    if (!hero) return res.status(404).json({ msg: 'Superhéroe no encontrado' });

    // Verificar permisos
    if (req.user.role !== 'admin' && hero.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    // Actualización controlada
    const { name, power, image } = req.body;
    if (name !== undefined) hero.name = name;
    if (power !== undefined) hero.power = power;
    if (image !== undefined) hero.image = image;

    await hero.save();
    res.json(hero);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Error al editar el superhéroe' });
  }
});


// 🔒 RUTA PROTEGIDA - Eliminar superhéroe
router.delete('/:id', auth, async (req, res) => {
  try {
    const hero = await Superhero.findById(req.params.id);
    if (!hero) return res.status(404).json({ msg: 'Superhéroe no encontrado' });

    // Verificar permisos
    if (req.user.role !== 'admin' && hero.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'No autorizado' });
    }

    await hero.deleteOne();
    res.json({ msg: 'Superhéroe eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Error al eliminar el superhéroe' });
  }
});
module.exports = router;
