const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const fs = require('fs')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const path = require('path')

const saltRounds = 10
const prisma = new PrismaClient()

module.exports = {

    // Cadastro
    async createUser(req, res) {
        // console.log('createUser() started')

        var form_cadastro = new formidable.IncomingForm()

        form_cadastro.parse(req, async (err, fields, files) => {
            var type = 'user'
            var email = fields['email']
            
            const findUserByEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
            if (err) throw err
            if (findUserByEmail) {
                req.session.erro_cadastro = "Usuário já existe, tente outro email!"
                res.redirect('/cadastro')
            } else {
                var nomeimg = ""
                if (files.profilePic['originalFilename'].length != 0) {
                    var oldpathImg = files.profilePic.filepath
                    var hashImg = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
                    nomeimg = hashImg + '.' + files.profilePic.mimetype.split('/')[1]
                    var newpathImg = path.join(__dirname, '../../public/profilePics/', nomeimg)
                    fs.rename(oldpathImg, newpathImg, function (err) {
                        if (err) throw err
                    })
                }
                bcrypt.hash(fields['password'], saltRounds, async (err, hash) => {
                    await prisma.user.create({
                        data: {
                            name: fields['name'],
                            email: email,
                            bio: fields['bio'],
                            password: hash,
                            type: type,
                            profilePic: nomeimg,
                            certified: ''
                        }
                    })
                })
                req.session.sucesso_cadastro = "Usuário cadastrado com sucesso, faça o login!"
                res.redirect('/login')
            }
        })
    },

    // Login
    async verifyUser(req, res) {
        // console.log('verifyUser() started')
        
        var form_login = new formidable.IncomingForm()

        form_login.parse(req, async(err, fields, files) => {
            var email = fields['email']
            var password = fields['password']

            // console.log('Email:', email)
            const findUserByEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
            // console.log(findUserByEmail)
            if (err) throw err
            if (findUserByEmail) {
                const user_password = findUserByEmail.password
                // console.log(user_password)
                bcrypt.compare(password, user_password, function (err, result) {
                    // console.log('bcrypt iniciou')
                    if (err) throw err
                    if (result) {
                        req.session.loggedin       = true
                        req.session.userId         = findUserByEmail.id
                        req.session.userName       = findUserByEmail.name
                        req.session.userEmail      = findUserByEmail.email
                        req.session.userBio        = findUserByEmail.bio
                        req.session.userType       = findUserByEmail.type
                        req.session.userProfilePic = findUserByEmail.profilePic
                        req.session.sucesso_login  = req.session.userName + ", seja bem-vindo(a)!"
                        res.redirect('/home')
                    } else {
                        req.session.erro_login = "Email ou senha inválidos!"
                        res.redirect('/login')
                    }
                })
            } else {
                req.session.erro_login = "Email ou senha inválidos!"
                res.redirect('/login')
            }
        })  
    },

    async getUsers(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId,
                }
            })

            var userType = findUserById.type

            if (userType == "user") {
                var userName = findUserById.name
                var userEmail = findUserById.email
                var userBio = findUserById.bio
                var userProfilePic = findUserById.profilePic

                res.render('perfilUsuario', {
                    name: userName,
                    email: userEmail,
                    bio: userBio,
                    profilePic: userProfilePic,
                    userType: userType
                })
            } else {
                req.session.warning = "Acesso negado!"
                res.redirect('/home')
            }
        } 
    },

}