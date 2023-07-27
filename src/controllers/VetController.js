const { PrismaClient } = require('@prisma/client')
const formidable       = require('formidable')
const fs               = require('fs')
const crypto           = require('crypto')
const bcrypt           = require('bcrypt')
const path             = require('path')

const saltRounds = 10
const prisma     = new PrismaClient()

module.exports = {
    // Create
    async createVet(req, res) {

        var form = new formidable.IncomingForm()

        form.parse(req, async (err, fields, files) => {
            var type = 'vet'
            var email = fields['email']

            const findVetByEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
            if (err) throw err
            if (findVetByEmail) {
                req.session.erro_cadastro = "Usuário já existe, tente outro email!"
                res.redirect('/cadastro-vet')
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
                var oldpathCertified = files.certified.filepath
                var hashCertified = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
                var nomecertified = hashCertified + '.' + files.certified.mimetype.split('/')[1]
                var newpathCertified = path.join(__dirname, '../../public/vetCertifieds/', nomecertified)
                fs.rename(oldpathCertified, newpathCertified, function (err) {
                    if (err) throw err
                })
                bcrypt.hash(fields['password'], saltRounds, async (err, hash) => {
                    await prisma.user.create({
                        data: {
                            name: fields['name'],
                            email: fields['email'],
                            bio: fields['bio'],
                            password: hash,
                            type: type,
                            profilePic: nomeimg,
                            certified: nomecertified
                        }
                    })
                })
                req.session.sucesso_cadastro = 'Usuário cadastrado com sucesso, faça o login!'
                res.redirect('/login')
            }
        })
    },

    async getVets(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId,
                }
            })

            var userType = findUserById.type

            if (userType == "vet") {
                var userName = findUserById.name
                var userEmail = findUserById.email
                var userBio = findUserById.bio
                var userProfilePic = findUserById.profilePic

                res.render('meuPerfilVeterinario', {
                    name: userName,
                    email: userEmail,
                    bio: userBio,
                    profilePic: userProfilePic,
                    userType: userType,
                    id: userId
                })
        
            } else {
                req.session.warning = "Acesso negado!"
                res.redirect('/home')
            }
        }
    },

    async getAllVets(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId,
                }
            })

            var userType   = findUserById.type
            var profilePic = findUserById.profilePic

            const findAllVets = await prisma.user.findMany({
                where: {
                    type: 'vet'
                }
            })
            
            res.render('listaVeterinarios', {
                vets: findAllVets,
                userType: userType,
                profilePic: profilePic
            })

        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    async updateVetForm(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic


            res.render('editarPerfilVeterinario', {
                userType: userType,
                profilePic: profilePic,
                user: findUserById
            })
        }
    },

    async updateVet(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var form_update_user = new formidable.IncomingForm()

            form_update_user.parse(req, async (err, fields, files) => {
                var type = 'vet'
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
                var oldpathCertified = files.certified.filepath
                var hashCertified = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
                var nomecertified = hashCertified + '.' + files.certified.mimetype.split('/')[1]
                var newpathCertified = path.join(__dirname, '../../public/vetCertifieds/', nomecertified)
                fs.rename(oldpathCertified, newpathCertified, function (err) {
                    if (err) throw err
                })
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
                            certified: nomecertified
                        }
                    })
                })
                req.session.sucesso_cadastro = "Usuário atualizado com sucesso, faça o login!"
                res.redirect('/login')
            })
        }
    }

}