const express = require('express');
const roteador = require('./rotas')
const app = express();

app.use(express.json());

// rotas
app.use(roteador)


module.exports = app;