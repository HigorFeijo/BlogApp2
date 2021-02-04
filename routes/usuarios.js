const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const passport = require('passport')
const nodemailer = require('nodemailer')

router.get('/registrar', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registrar', (req, res) => {
    
    var erros = []

    !req.body.nome ? erros.push({text: 'Nome inválido'}) : false
    !req.body.email ? erros.push({text: 'Email inválido'}) : false
    !req.body.senha ? erros.push({text: 'Senha inválida'}) : false
    req.body.senha != req.body.senha2 ? erros.push({text: 'Senhas diferentes'}) : false

    if(erros.length > 0) {
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email})
        .then(usuario => {
            if(usuario){
                req.flash('error_msg', 'Esse email já está sendo usado')
                res.redirect('/usuarios/registrar')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if(err) {
                            req.flash('error_msg', 'Houve um erro interno')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save()
                        .then(() => {
                            req.flash('success_msg', 'Usuario criado com sucesso')
                            res.redirect('/')
                        })
                        .catch(err => {
                            req.flash('error_msg', 'Houve um erro ao criar conta')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })

            }
        })
        .catch(err => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect('/')
})

module.exports = router