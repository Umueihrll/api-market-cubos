const {query} = require('../conexao')
const jwt = require('jsonwebtoken');
const password = require('../controladores/password')

//support function in the end.

const listarProdutos = async (req, res) => {
    const {categoria} = req.query;
    const id = supToken(req.headers)
    
    if (!categoria) {
        const qryUsuario =  'select * from usuarios where id = $1';
        const {rowCount:userCount} = await query(qryUsuario, [id])
        if (userCount > 0 ) {
            const qryProdutos = 'select * from produtos where usuario_id = $1'
            const {rows, rowCount: produtosCount} = await query(qryProdutos, [id])
            const produtos = []
            if (produtosCount > 0) {
                for (let itens of rows) {
                    produtos.push(itens)
                }
                return res.status(200).json(produtos)
            } else {
                res.status(200).json([])
            } 
        } else {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado'
            })
        }
    } else {
        const qryCategoria = 'select * from produtos where usuario_id = $1 and categoria ilike $2';
        const vrfyCategoria = await query(qryCategoria, [id, categoria]);
        const listaCategoria = []
        
        if (vrfyCategoria.rowCount > 0) {
            const {rows: produtosCategoria} = vrfyCategoria;
            for (let item of produtosCategoria) {
                listaCategoria.push(item)
            }
            res.status(200).json(listaCategoria)
        } else {
            res.status(200).json([])
        }
    }
}

const listarProduto = async (req, res) => {

    const id = req.params.id
    console.log(id)
    const idUsuario = supToken(req.headers)
    const qryProduto = 'select * from produtos where id = $1';
    const {rowCount} = await query(qryProduto, [id])
    const produtos = {}
    if (rowCount === 0) {
        return res.status(404).json({
            mensagem: `Produto com id ${id}, não encontrado.`
        })
    } else {
        const qryProdutoDoUsuario = 'select * from produtos where user_id = $1 and id = $2';
        const {rows, rowCount: produtoUsuarioCount} = await query(qryProdutoDoUsuario, [idUsuario, id])
        if (produtoUsuarioCount === 0) {
            return res.status(404).json({
                mensagem: `O usuário logado não tem permissão para acessar este produto.`
            })
        } else {
            produto = rows[0]
            return res.status(200).json({
            produto
        })
        }
    }
}

const cadastrarProduto = async (req, res) => {
    const userId = supToken(req.headers)
    const {nome, quantidade, categoria, preco, descricao, imagem} = req.body;
    if (!nome) {
        return res.status(400).json({
            mensagem: 'O nome do produto precisa ser informado.'
        })
    }
    if (!quantidade) {
        return res.status(400).json({
            mensagem: 'A quantidade do produto precisa ser informada.'
        })
    } else if(Number(quantidade) <= 0) {
        return res.status(400).json({
            mensagem: 'A quantidade do produto informado precisa ser maior que zero.'
        })
    }
    if (!preco) {
        return res.status(400).json({
            mensagem: 'O preço do produto precisa ser informado.'
        })
    } else if(Number(preco) <= 0) {
        return res.status(400).json({
            mensagem: 'O preço do produto precisa ser maior que zero'
        })
    }
    if (!descricao) {
        return res.status(400).json({
            mensagem: 'A descrição do produto precisa ser informada.'
        })
    }
    const qryCadastroProduto = 'insert into produtos (nome, quantidade, categoria, preco, descricao, imagem, usuario_id) values ($1, $2, $3, $4, $5, $6, $7)'
    const novoProduto = await query(qryCadastroProduto, [nome, quantidade, categoria?categoria:" |", preco, descricao, imagem?imagem:" |", userId]);
    if (novoProduto.rowCount !== 0 ) {
        return res.status(201).json()
    }

}

const atualizarProduto = async (req, res) => {
    const {nome, quantidade, categoria, preco, descricao, imagem} = req.body;
    const id = req.params.id;
    const userId = supToken(req.headers);
    
    const qryProduto = 'select * from produtos where id = $1;'
    const produto = await query(qryProduto, [id])
    if (produto.rowCount === 0) {
        return res.status(404).json({
            mensagem: `Produto com id ${id}, não encontrado.`
        })
    } else {
        const qryProdutoUsuario = 'select * from produtos where id = $1 and usuario_id = $2;';
        const produtoUsuario = await query(qryProdutoUsuario, [id, userId])
        if (produtoUsuario.rowCount === 0) {
            return res.status(403).json({
                mensagem: 'Usuário não permitido para modificar produto selecionado.'
            })
        } else {
            if (!nome) {
                return res.status(400).json({
                    mensagem: 'O nome do produto precisa ser informado.'
                })
            }
            if (!quantidade) {
                return res.status(400).json({
                    mensagem: 'A quantidade do produto precisa ser informada.'
                })
            } else if(Number(quantidade) <= 0) {
                return res.status(400).json({
                    mensagem: 'A quantidade do produto informado precisa ser maior que zero.'
                })
            }
            if (!preco) {
                return res.status(400).json({
                    mensagem: 'O preço do produto precisa ser informado.'
                })
            } else if(Number(preco) <= 0) {
                return res.status(400).json({
                    mensagem: 'O preço do produto precisa ser maior que zero'
                })
            }
            if (!descricao) {
                return res.status(400).json({
                    mensagem: 'A descrição do produto precisa ser informada.'
                })
            }

            const qryAtualizarProduto = 'update produtos set nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7;'
            const ProdutoAtualizado = await query(qryAtualizarProduto, [nome, quantidade, categoria?categoria:"|", preco, descricao, imagem?imagem:"|", id]);
            return res.status(200).json()
        }
    }
}

const deletarProduto = async (req, res) => {
    const id = req.params.id;
    const userId = supToken(req.headers);
    
    const qryProduto = 'select * from produtos where id = $1;'
    const produto = await query(qryProduto, [id])
    if (produto.rowCount === 0) {
        return res.status(404).json({
            mensagem: `Produto com id ${id}, não encontrado.`
        })
    } else {
        const qryProdutoUsuario = 'select * from produtos where id = $1 and usuario_id = $2;';
        const produtoUsuario = await query(qryProdutoUsuario, [id, userId])
        if (produtoUsuario.rowCount === 0) {
            return res.status(403).json({
                mensagem: 'Usuário não permitido para deletar produto selecionado.'
            })
        } else {
            const qryProdutoDel = 'delete from produtos where id = $1;'
            const ProdutoDel = await query(qryProdutoDel, [id])
            return res.status(200).json()
        }
    }
}

module.exports = {listarProdutos, listarProduto, cadastrarProduto, atualizarProduto, deletarProduto};

//support functions

function supToken(headers) {
    const {authorization} = headers;
    const token = authorization.replace('Bearer', "").trim();
    const { id } = jwt.verify(token, password)
    return id
}
