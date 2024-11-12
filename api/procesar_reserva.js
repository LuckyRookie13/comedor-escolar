const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

const workbook = xlsx.readFile(path.join(__dirname, 'correos_permitidos.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const emailsAllowed = xlsx.utils.sheet_to_json(sheet).map(row => row.email);

app.post('/api/procesar_reserva', (req, res) => {
  const { nombre, curso, email, horario } = req.body;
  
  if (!emailsAllowed.includes(email)) {
    return res.redirect('/ayuda.html');
  }

  const query = `INSERT INTO reservas (nombre, curso, email, horario) VALUES ($1, $2, $3, $4)`;
  pool.query(query, [nombre, curso, email, horario], (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Reserva guardada exitosamente!' });
  });
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
