const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')


const prisma = new PrismaClient()

module.exports = {

    // Create
    async createDonation(req, res) {
        // console.log('createDonation iniciou')
        var userId = req.session.userId
        // console.log(userId)

        var form_create_donation = new formidable.IncomingForm()

        form_create_donation.parse(req, async (err, fields, files) => {
            var petSpayed
            if (fields['spayed']) {
                petSpayed = true
            } else {
                petSpayed = false
            }
            // console.log(petSpayed)
            var petVaccinated
            if (fields['vaccinated']) {
                petVaccinated = true
            } else {
                petVaccinated = false
            }
            // console.log(petVaccinated)
            var oldpath = files.petPic.filepath
            var hash    = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
            var nomeimg = hash + '.' + files.petPic.mimetype.split('/')[1]
            var newpath = path.join(__dirname, '../../public/donationPics/', nomeimg)
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err
            })
            const createDonation = await prisma.donation.create({
                data: {
                    userId: userId,
                    petPic: nomeimg,
                    petName: fields['name'],
                    petDescription: fields['description'],
                    petType: fields['type'],
                    petGender: fields['gender'],
                    petSpayed: petSpayed,
                    petVaccinated: petVaccinated,
                    contact: "default"
                }
            })
            // console.log(createDonation)

            req.session.success_create_donation = "Doação criada com sucesso! Acesse-a em seu perfil na aba Minhas doações."
            res.redirect('/doacoes')
        })
    },

    // Create Donation Form
    async createDonationForm(req, res) {
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

        res.render('adicionarDoacao', { userType: userType, profilePic: profilePic, counter: counter })
    },

    // Read

    async getMyDonations(req, res) {
        if (req.session.loggedin == true) {
            var userId
            userId = req.session.userId

            const findDonationByUser = await prisma.donation.findMany({
                where: {
                    userId: userId,
                }
            })

            var success_update_donation
            var success_delete_donation

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic


            if (req.session.success_update_donation) {
                success_update_donation = req.session.success_update_donation
                req.session.success_update_donation = ""
            }

            if (req.session.success_delete_donation) {
                success_delete_donation = req.session.success_delete_donation
                req.session.success_delete_donation = ""
            }

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('minhasDoacoes', { 
                donations: findDonationByUser, 
                success_update_donation: success_update_donation, 
                success_delete_donation: success_delete_donation, 
                userType: userType, 
                profilePic: profilePic,
                counter: counter
            })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    async getAllDonations(req, res) {
        if (req.session.loggedin == true) {
            var success_create_donation
            var userId = req.session.userId

            if (req.session.success_create_donation) {
                success_create_donation = req.session.success_create_donation
                req.session.success_create_donation = ""
            }
            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            const findAllDonations = await prisma.donation.findMany({
                where: {
                    NOT: {
                        userId: userId
                    }
                }
            })

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('doacoes', { 
                donations: findAllDonations, 
                success_create_donation: success_create_donation, 
                userType: userType, 
                profilePic: profilePic,
                counter: counter
            })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    // Update
    async updateDonation(req, res) {
        var donationId = parseInt(req.params.id)

        var form_update_donation = new formidable.IncomingForm()
        var userId = req.session.userId

        // console.log(userId)

        form_update_donation.parse(req, async (err, fields, files) => {
            var petSpayed
            if (fields['spayed']) {
                petSpayed = true
            } else {
                petSpayed = false
            }
            // console.log(petSpayed)
            var petVaccinated
            if (fields['vaccinated']) {
                petVaccinated = true
            } else {
                petVaccinated = false
            }

            var oldpath = files.petPic.filepath
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
            var nomeimg = hash + '.' + files.petPic.mimetype.split('/')[1]
            var newpath = path.join(__dirname, '../../public/donationPics/', nomeimg)
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err
            })

            var petName = fields['name']
            var petDescription = fields['description']
            var petType = fields['type']
            var petGender = fields['gender']
            // console.log(petName, birthDate, petBreed, petSize, petType, petGender)


            await prisma.donation.update({
                where: {
                    id: donationId
                },
                data: {
                    userId: userId,
                    petName: petName,
                    petDescription: petDescription,
                    petPic: nomeimg,
                    petType: petType,
                    petSpayed: petSpayed,
                    petVaccinated: petVaccinated,
                    petGender: petGender,
                    contact: "default"
                }
            })
            req.session.success_update_donation = "Doação atualizada com sucesso!"
            res.redirect('/minhasDoacoes')
        })
    },

    async updateDonationForm(req, res) {
        var donationId = parseInt(req.params.id)
        var userId = req.session.userId

        const findDonationById = await prisma.donation.findUnique({
            where: {
                id: donationId
            }
        })

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

        res.render('editarDoacao', { 
            donation: [findDonationById], 
            userType: userType, 
            profilePic: profilePic,
            counter: counter
        })
    },

    // Delete
    async deleteDonation(req, res) {

        var donationId = parseInt(req.params.id)

        await prisma.donation.delete({
            where: {
                id: donationId
            }
        })
        req.session.success_delete_donation = "Doação excluída com sucesso!"
        res.redirect('/minhasDoacoes')
    }
}