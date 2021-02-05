if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: "mongodb+srv://higor:feijo@cluster0.o3zdl.mongodb.net/blogapp?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost:blogapp2"}
}