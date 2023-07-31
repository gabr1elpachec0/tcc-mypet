const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const fs = require('fs')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const path = require('path')
const { profile } = require('console')
const NotificationController = require('./NotificationController')

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
        var form_login = new formidable.IncomingForm()

        form_login.parse(req, async (err, fields, files) => {
            var email = fields['email']
            var password = fields['password']

            const findUserByEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })

            if (err) throw err
            if (findUserByEmail) {
                const user_password = findUserByEmail.password
                bcrypt.compare(password, user_password, async function (err, result) {
                    if (err) throw err
                    if (result) {
                        req.session.loggedin = true
                        req.session.userId = findUserByEmail.id
                        req.session.userName = findUserByEmail.name
                        req.session.userEmail = findUserByEmail.email
                        req.session.userBio = findUserByEmail.bio
                        req.session.userType = findUserByEmail.type
                        req.session.userProfilePic = findUserByEmail.profilePic
                        var userName = findUserByEmail.name
                        var userId = req.session.userId
                        req.session.sucesso_login = userName + ', seja bem-vindo(a)!'

                        // Cria as notificações
                        await NotificationController.createVaccineNotification(userId)
                        await NotificationController.createMedicineNotification(userId)

                        // Redireciona para a página inicial após a criação das notificações
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

                var counter = 0

                const findNotificationsByUserId = await prisma.notification.findMany({
                    where: {
                        userId: userId
                    }
                })

                findNotificationsByUserId.forEach(function (notification) {
                    counter += 1
                })

                res.render('meuPerfilUsuario', {
                    name: userName,
                    email: userEmail,
                    bio: userBio,
                    profilePic: userProfilePic,
                    userType: userType,
                    id: userId,
                    counter: counter
                })
            } else {
                req.session.warning = "Acesso negado!"
                res.redirect('/home')
            }
        } 
    },

    async getProfile(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var profileId = parseInt(req.params.id)

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId,
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            const findProfileById = await prisma.user.findUnique({
                where: {
                    id: profileId
                }
            })

            var profileUserVetName
            var profileUserVetPic
            var profileUserVetBio
            var profileUserVetId
            
            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            if (findProfileById.type == "user") {
                profileUserVetId = findProfileById.id
                profileUserVetName = findProfileById.name
                profileUserVetPic  = findProfileById.profilePic
                profileUserVetBio  = findProfileById.bio

                res.render('perfilUsuario', {
                    userType: userType,
                    profilePic: profilePic,
                    profileId: profileUserVetId,
                    profileUserVetName: profileUserVetName,
                    profileUserVetBio: profileUserVetBio,
                    profileUserVetPic: profileUserVetPic,
                    counter: counter
                })
            }
            if (findProfileById.type == "vet") {
                profileUserVetId = findProfileById.id
                profileUserVetName = findProfileById.name
                profileUserVetPic = findProfileById.profilePic
                profileUserVetBio = findProfileById.bio
                profileUserCertified = findProfileById.certified,

                res.render('perfilVeterinario', {
                    userType: userType,
                    profilePic: profilePic,
                    profileId: profileUserVetId,
                    profileUserVetName: profileUserVetName,
                    profileUserVetBio: profileUserVetBio,
                    profileUserVetPic: profileUserVetPic,
                    profileUserCertified: profileUserCertified,
                    counter: counter

                })
            }
        } else {
            req.session.warning = "Acesso negado!"
            res.redirect('/home')
        }
    },

    async updateUserForm(req, res) {
        if(req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            
            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })


            res.render('editarPerfil', {
                userType: userType,
                profilePic: profilePic,
                user: findUserById,
                counter: counter
            })
        }
    },

    async updateUser(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var form_update_user = new formidable.IncomingForm()

            form_update_user.parse(req, async (err, fields, files) => {
                var type = 'user'
                var email = fields['userEmail']
                
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
                bcrypt.hash(fields['userPassword'], saltRounds, async (err, hash) => {
                    await prisma.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            name: fields['userName'],
                            email: email,
                            bio: fields['userBio'],
                            password: hash,
                            type: type,
                            profilePic: nomeimg,
                            certified: ''
                        }
                    })
                })
                req.session.sucesso_cadastro = "Usuário atualizado com sucesso, faça o login!"
                res.redirect('/login')
            })            
        }
    },

}