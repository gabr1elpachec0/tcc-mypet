const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { name } = require('ejs');
dayjs.extend(localizedFormat);

const prisma = new PrismaClient()

module.exports = {
    // Create
    async createPet(req, res) {
        // console.log('createPet iniciou')
        var form_cadastro = new formidable.IncomingForm()
        var userId
        if(req.session.userId) {
            userId = req.session.userId
        }

        // console.log(userId)

        form_cadastro.parse(req, async (err, fields, files) => {
            var petName   = fields['name']
            var birthDate = fields['birthDate']
            var petBreed  = fields['petBreed']
            var petSize   = fields['petSize']
            var petType   = fields['petType']
            var petGender = fields['petGender']

            // console.log(petName, birthDate, petBreed, petSize, petType, petGender)

            await prisma.pet.create({
                data: {
                    name: petName,
                    userId: userId,
                    birthDate: new Date(birthDate),
                    breed: petBreed,
                    size: petSize,
                    type: petType,
                    gender: petGender
                }
            })
        })
        res.redirect('/pets')
        // console.log('Pet criado!')
    },

    // Create Pet Form

    async createPetForm(req, res) {
        var userId = req.session.userId

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        res.render('adicionarPet', { userType: userType, profilePic: profilePic })
    },

    // Read
    async getPets(req, res) {
        if (req.session.loggedin == true) {
            var userId
            userId = req.session.userId

            const findPetByUser = await prisma.pet.findMany({
                where: {
                    userId: userId,
                }
            })
            // console.log(findPetByUser)

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            // Adicionar um dia, pois estava diminuindo um dia durante a listagem
            const formattedPets = findPetByUser.map((pet) => ({
                ...pet,
                birthDate: dayjs(pet.birthDate).add(1, 'day').format('DD/MM/YYYY'),
            }))

            res.render('pets', { pets: formattedPets, userType: userType, profilePic: profilePic })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    // Update
    async updatePet(req, res) {
        var petId = parseInt(req.params.id)

        var form_update = new formidable.IncomingForm()
        var userId
        if (req.session.userId) {
            userId = req.session.userId
        }

        // console.log(userId)

        form_update.parse(req, async (err, fields, files) => {
            var petName = fields['name']
            var birthDate = fields['birthDate']
            var petBreed = fields['petBreed']
            var petSize = fields['petSize']
            var petType = fields['petType']
            var petGender = fields['petGender']
            // console.log(petName, birthDate, petBreed, petSize, petType, petGender)

            await prisma.pet.update({
                where: {
                    id: petId
                },
                data: {
                    name: petName,
                    userId: userId,
                    birthDate: new Date(birthDate),
                    breed: petBreed,
                    size: petSize,
                    type: petType,
                    gender: petGender
                }
            })
            res.redirect('/pets')
        })
    },

    async updatePetForm (req, res) {
        var petId = parseInt(req.params.id)
        var userId = req.session.userId

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
            }
        })

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        res.render('editarPet', { pet: [findPetById], userType: userType, profilePic: profilePic })
    },

    // Delete
    async deletePet(req, res) {

        var petId = parseInt(req.params.id)

        await prisma.pet.delete({
            where: {
                id: petId
            }
        })
        res.redirect('/pets')
    },

    // View Select Pet

    async getSelectPetForm(req, res) {
        var userId = req.session.userId

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetByUser = await prisma.pet.findMany({
            where: {
                userId: userId
            }
        })

        var userType   = findUserById.type
        var profilePic = findUserById.profilePic
        var userPets   = findPetByUser.map((pet) => {
            return {
                petName: pet.name,
                petId: pet.id
            }
        })

        res.render('selecionarPet', {
            userType: userType,
            profilePic: profilePic,
            userPets: userPets
        })
    }
}