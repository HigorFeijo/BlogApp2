const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        required: true,
        default: Date.now()
    },
    posts: {
        type: Number,
        required: true,
        default: 0
    }
})

mongoose.model('categorias', Categoria)