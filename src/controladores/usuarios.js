const {query, pool} = require('../conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const password = require('../controladores/password')

const cadastrarUsuario = async (req, res) => {
    
    const {nome, nome_loja, email, senha} = req.body;

    if (!nome) {
        return res.status(400).json({
            mensagem: 'O campo nome precisa ser informado.'
        })
    }
    if (!nome_loja) {
        return res.status(400).json({
            mensagem: 'O campo nome_loja precisa ser informado.'
        })
    }
    if (!email) {
        return res.status(400).json({
            mensagem: 'O campo email precisa ser informado.'
        })
    }
    if (!senha) {
        return res.status(400).json({
            mensagem: 'O campo senha precisa ser informado.'
        })
    }

    const queryConsutaEmail = 'select * from usuarios where email = $1';
    const {rowCount: consultaEmail} = await query(queryConsutaEmail, [email])

    if (consultaEmail > 0) {
        return res.status(400).json({
            message: 'E-mail informado já existe no banco de dados.'
        })
    }
    const senhaCrpt = await bcrypt.hash(senha, 10);
    const queryCadastro = 'insert into usuarios (nome, email, senha, nome_loja) values ($1, $2, $3, $4)'
    const novoUsuario = await query(queryCadastro, [nome, email, senhaCrpt, nome_loja])

    if (novoUsuario.rowCount !== 0) {
        return res.status(201).json()
    }

}

const detalharUsuario = async (req, res) => {
    
    
    const qryUsuario = 'select * from usuarios where id = $1';
    const { rows } = await query(qryUsuario, [supToken(req.headers)]);//vide support functions

    const usuario = rows[0];
    const {senha, ...dadosUsuario} = usuario

    return res.status(200).json({
        usuario: dadosUsuario
    })
}

const atualizarUsuario = async (req, res) => {
    
    const id = supToken(req.headers)
    const {nome, email, senha, nome_loja} = req.body;
    
    if (!nome) {
        return res.status(400).json({
            mensagem: 'O campo nome precisa ser informado.'
        })
    }
    if (!nome_loja) {
        return res.status(400).json({
            mensagem: 'O campo nome_loja precisa ser informado.'
        })
    }
    if (!email) {
        return res.status(400).json({
            mensagem: 'O campo email precisa ser informado.'
        })
    }
    if (!senha) {
        return res.status(400).json({
            mensagem: 'O campo senha precisa ser informado.'
        })
    }

    const queryVrfyEmail = 'select * from usuarios where email = $1';
    const {rowCount: emailRowCount} = await query(queryVrfyEmail, [email])
    
    const qryUsuario = 'select * from usuarios where id = $1';
    const {rows} = await query(qryUsuario, [id]) 
    const usuario = rows[0]
    
    
    if (emailRowCount > 0 && usuario.email !== email) {
        return res.status(400).json({
            mensagem: "E-mail já cadastrado no banco de dados"
        })
    }
    const senhaCrpt = await bcrypt.hash(senha, 10)
    const qryAtualizar = 'update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5'
    const usuarioAtualizado = await query(qryAtualizar, [nome, email, senhaCrpt, nome_loja, id])
    return res.status(200).json()
}


//support functions

function supToken(headers) {
    const {authorization} = headers;
    const token = authorization.replace('Bearer', "").trim();
    const { id } = jwt.verify(token, password)
    return id
}

module.exports = { cadastrarUsuario, detalharUsuario, atualizarUsuario}