const jwt = require('jsonwebtoken');
const {query} = require('../conexao')
const password = require('../controladores/password')

const vrfyLogin = async (req, res, next) => {
    const { authorization } = req.headers;
    
    if (authorization === "Bearer") {
        return res.status(400).json({
            message: 'Token não informado.'
        })
    }
    if ( authorization !== undefined ) {
        const token = authorization.replace('Bearer', "").trim();
        const { id } = jwt.verify(token, password)

        if (!id) {
            return res.status(400).json({
                mensagem: 'Token inválido.'
            })
        }
        const qryUsuario = 'select * from usuarios where id = $1';
        const {rows, rowCount} = await query(qryUsuario, [id]);
        
        if(rowCount === 0 ){
            return res.status(404).json({
                message: "Usuário não encontrado."
            })
        }

    } else {
        res.status(400).json({
            mensagem: "Token inválido."
        })
    }
    

    next();
}

module.exports = {vrfyLogin}