const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Superhero = require('../models/Superhero');
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    // Excluimos a los usuarios con el rol 'admin'
    const users = await User.find({ role: { $ne: 'admin' } });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Registro
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    await user.save();
    res.status(201).json({ msg: 'Usuario creado' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ msg: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // opcional: agregar expiración
  );

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
      // podés agregar más campos si querés
    }
  });
});


router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await Superhero.deleteMany({ owner: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({ msg: 'Usuario y sus superhéroes eliminados' });
  } catch (error) {
    console.error("❌ Error al eliminar usuario y sus héroes:", error);
    res.status(500).json({ msg: 'Error al eliminar el usuario' });
  }
});


module.exports = router;
