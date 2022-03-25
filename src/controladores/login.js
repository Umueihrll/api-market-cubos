const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {query} = require('../conexao')
const password = require('./password')



const login = async (req, res) => {
    const {email, senha} = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            message: 'usuario ou senha não informados.'
        })
    }
    
    const qryVrfyEmail = 'select * from usuarios where email = $1';
    const {rows, rowCount} = await query(qryVrfyEmail, [email]);

    if (rowCount === 0) {
        return res.status(404).json({
            message: 'E-mail não encontrado'
        })
    }

    const usuario = rows[0]
    const {senha: senhaUsuario, ...dadosUsuario} = usuario;
    
    const vrfySenha = await bcrypt.compare(senha, senhaUsuario)
    
    if (!vrfySenha) {
        return res.status(401).json({
            message: 'E-mail e/ou senha não confere.'
        })
    }

    const token = jwt.sign({id: dadosUsuario.id}, password, {expiresIn: '1d'})
    return res.status(200).json({
        token
    })

}

module.exports = {login};