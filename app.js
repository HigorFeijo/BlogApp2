const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const bodyParser = require('body-parser')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const admin = require('./routes/admin')
const mongoose = require('mongoose')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuarios')
const passport = require('passport')
require('./config/auth')(passport)

app.use(session({
    secret: 'blogapp2',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

mongoose.connect('mongodb://localhost/blogapp2', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.engine('handlebars', handlebars({defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars)}))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'})
    .then(postagens => {
        res.render('index', {postagens: postagens})
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
    })
})

app.get('/postagem/:pag/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).populate('categoria')
    .then(postagem => {
        if(postagem) {
            res.render('postagem/index', {postagem: postagem, pag: Number(req.params.pag)})
        }else{
            req.flash("error_msg", 'Essa postagem não existe')
            res.redirect('/')
        }
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
    Categoria.find()
    .then(categorias => {
        res.render('categorias/index', {categorias: categorias})
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug})
    .then(categoria => {
        if(categoria){
            Postagem.find({categoria: categoria._id})
            .then(postagens => {
                res.render('categorias/postagens', {postagens: postagens, categoria:categoria})
            })
            .catch(err => {
                req.flash('error_msg', 'Houve um erro inetrno')
                res.redirect('/categorias')
            })
        }else{
            req.flash('error_msg', 'Essa categoria não existe')
        }
    })
    .catch(err => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/categorias')
    })
})

app.use("/admin", admin)
app.use('/usuarios', usuarios)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('Server ligado')
})