const express = require('express')
const usuarios = require('./controladores/usuarios')
const produtos = require('./controladores/produtos')
const {login} = require('./controladores/login')
const {vrfyLogin } = require('./middleware/vrfyLogin')


const roteador = express();

roteador.use(express.json())

//criar usuario
roteador.post('/usuario', usuarios.cadastrarUsuario)
//logar usuario
roteador.post('/login', login)
//Detalhar usuario
roteador.get('/usuario', vrfyLogin, usuarios.detalharUsuario)
//Atualizar usuario
roteador.put('/usuario', vrfyLogin, usuarios.atualizarUsuario)

//Listar produtos de usuario logado
roteador.get('/produtos', vrfyLogin, produtos.listarProdutos)
//Listar produto por id
roteador.get('/produtos/:id', vrfyLogin, produtos.listarProduto)
//cadastrar produto 
roteador.post('/produtos', vrfyLogin, produtos.cadastrarProduto)
//atualizar produto do usuario logado
roteador.put('/produtos/:id', vrfyLogin, produtos.atualizarProduto)
//deletar produtos do usuario logado
roteador.delete('/produtos/:id', vrfyLogin, produtos.deletarProduto)

module.exports = roteador;