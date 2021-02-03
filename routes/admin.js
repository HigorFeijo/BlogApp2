const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({data: 'desc'})
    .then(categorias => {
        res.render('admin/categorias', {categorias: categorias})
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro')
        res.render('admin/categorias')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/novacategoria')
})

router.post('/categorias/add', eAdmin, (req, res) => {

    const erros = []

    !req.body.nome ? erros.push({text: 'Nome inválido'}) : false
    !req.body.slug ? erros.push({text: 'Slug inválido'}) : false

    if(erros.length > 0) {
        res.render('admin/novacategoria', {erros: erros, dados: req.body})
    }else{
        Categoria.findOne({slug: req.body.slug})
        .then(categoria => {
            if(categoria){
                req.flash('error_msg', 'Esse slug já está sendo usado')
                res.redirect('/admin/categorias/add')
            }else{
                const novaCategoria = {
                    nome: req.body.nome,
                    slug: req.body.slug
                }
        
                Categoria(novaCategoria).save()
                .then(() => {
                    req.flash('success_msg', 'Categoria criada com sucesso')
                    res.redirect('/admin/categorias')
                })
                .catch(err => {
                    req.flash('error_msg', 'Houve um erro ao criar a categoria')
                    req.redirect('/admin/categorias')
                })
            }
        })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin/categorias/add')
        })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findById(req.params.id)
    .then(categoria => {
        if(!categoria){
            req.flash('error_msg', 'Essa categoria não existe')
            res.redirect('/admin/categorias')
        }else{
            res.render('admin/editcategoria', {categoria: categoria})
        }
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {

    const erros = []

    !req.body.nome ? erros.push({text: 'Nome inválido'}) : false
    !req.body.slug ? erros.push({text: 'Slug inválido'}) : false

    if(erros.length > 0){
        res.render('admin/editcategoria', {erros: erros})
    }else{
        Categoria.findById(req.body.id)
        .then(categoria => {
            if(!categoria){
                req.flash('error_msg', 'Essa categoria não existe')
                res.redirect('/admin/categorias')
            }else{
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug
                categoria.save()
                .then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso')
                    res.redirect('/admin/categorias')
                })
                .catch(err => {
                    req.flash('error_msg', 'Erro ao editar categoria')
                    res.redirect('/admin/categorias')
                })
            }
        })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin/categorias')
        })
    }
})

router.get('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.params.id})
    .then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro ao deletar categoria')
        res.redirect('/admin/categorias')
    })
})


router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'})
    .then(postagens => {
        res.render('admin/postagens', {postagens: postagens})
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find()
    .then(categorias => {
        res.render('admin/novapostagem', {categorias: categorias})
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/admin/postagens/add')
    })
})

router.post('/postagens/add', eAdmin, (req, res) => {

    const erros = []

    !req.body.titulo ? erros.push({text: 'Título inválido'}) : false
    !req.body.slug ? erros.push({text: 'Slug inválido'}) : false
    !req.body.descricao ? erros.push({text: 'Descrição inválida'}) : false
    req.body.categoria == 0 ? erros.push({text: 'Registre uma categoria'}) : false
    !req.body.conteudo ? erros.push({text: 'Conteúdo inválido'}) : false
    
    if(erros.length > 0) {
        res.render('admin/novapostagem', {erros: erros, dados: req.body})
    }else{
        Postagem.findOne({slug: req.body.slug})
        .then(postagem => {
            if(postagem){
                req.flash('error_msg', 'Esse slug já está sendo usado')
                res.redirect('/admin/postagens/add')
            }else{
                const novaPostagem = {
                    titulo: req.body.titulo,
                    slug: req.body.slug,
                    descricao: req.body.descricao,
                    categoria: req.body.categoria,
                    conteudo: req.body.conteudo
                }

                Postagem(novaPostagem).save()
                .then(() => {
                    req.flash('success_msg', 'Postado com sucesso')
                    res.redirect('/admin/postagens')
                })
                .catch(err => {
                    req.flash('error_msg', 'Houve um erro ao postar')
                    res.redirect('/admin/postagens')
                })
            }
        })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin/postagens/add')
        })
    }

})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findById(req.params.id)
    .then(postagem => {
        if(!postagem){
            req.flash('error_msg', 'Essa postagem não existe')
            res.redirect('/admin/postagens')
        }else{
            Categoria.find()
            .then(categorias => {
                res.render('admin/editpostagem', {postagem: postagem, categorias: categorias})
            })
        }
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/postagens')
    }) 
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findById(req.body.id)
    .then(postagem => {
        if(!postagem){
            req.flash('error_msg', 'Essa postagem não existe')
        }else{
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.categoria = req.body.categoria
            postagem.conteudo = req.body.conteudo
    
            postagem.save()
            .then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso')
                res.redirect('/admin/postagens')
            })
            .catch(err => {
                req.flash('error_msg', 'Erro ao editar postagem')
                res.redirect('/admin/postagens')
            })
        }
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id})
    .then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    })
    .catch(err => {
        req.flash('error_msg', 'Erro ao deletar postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router