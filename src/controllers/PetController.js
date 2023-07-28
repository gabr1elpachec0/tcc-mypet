const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { name } = require('ejs');
dayjs.extend(localizedFormat);

const prisma = new PrismaClient()
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { now } = require('moment/moment');
// const os = require('os');

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
        req.session.success_create_pet = "Pet adicionado com sucesso!"
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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('adicionarPet', { userType: userType, profilePic: profilePic, counter: counter })
    },

    // Read
    async getMyPets(req, res) {
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
            var success_create_pet
            var success_update_pet
            var success_delete_pet

            if (req.session.success_create_pet) {
                success_create_pet = req.session.success_create_pet
                req.session.success_create_pet = ""
            }

            if (req.session.success_update_pet) {
                success_update_pet = req.session.success_update_pet
                req.session.success_update_pet = ""
            }
            
            if (req.session.success_delete_pet) {
                success_delete_pet = req.session.success_delete_pet
                req.session.success_delete_pet = ""
            }

            // Adicionar um dia, pois estava diminuindo um dia durante a listagem
            const formattedPets = findPetByUser.map((pet) => ({
                ...pet,
                birthDate: dayjs(pet.birthDate).add(1, 'day').format('DD/MM/YYYY'),
            }))

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('pets', { 
                pets: formattedPets, 
                userType: userType, 
                profilePic: profilePic, 
                success_create_pet: success_create_pet, 
                success_update_pet: success_update_pet, 
                success_delete_pet: success_delete_pet,
                counter: counter
            })
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
            req.session.success_update_pet = "Pet atualizado com sucesso!"
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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('editarPet', { pet: [findPetById], userType: userType, profilePic: profilePic, counter: counter })
    },

    // Delete
    async deletePet(req, res) {

        var petId = parseInt(req.params.id)

        await prisma.pet.delete({
            where: {
                id: petId
            }
        })
        req.session.success_update_pet = "Pet excluído com sucesso!"
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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('selecionarPet', {
            userType: userType,
            profilePic: profilePic,
            userPets: userPets,
            counter: counter
        })
    },

    async getDigitalCard(req, res) {
        var userId = req.session.userId
        var petId  = parseInt(req.params.id)
        var success_create_immunization_control
        var success_create_weight_control
        var success_create_medicines_control
        var success_download 

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
            }
        })
        
        if (req.session.success_create_immunization_control) {
            success_create_immunization_control = req.session.success_create_immunization_control
            req.session.success_create_immunization_control = ""
        }

        if (req.session.success_create_weight_control) {
            success_create_weight_control = req.session.success_create_weight_control
            req.session.success_create_weight_control = ""
        }

        if (req.session.success_create_medicines_control) {
            success_create_medicines_control = req.session.success_create_medicines_control
            req.session.success_create_medicines_control = ""
        }

        if (req.session.success_download) {
            success_download = req.session.success_download
            req.session.success_download = ""
        }

        var userType   = findUserById.type
        var profilePic = findUserById.profilePic

        const findImmunizationControl = await prisma.ImmunizationControl.findMany({
            where: {
                petId: petId
            }
        })

        const formattedImmunizationControl = findImmunizationControl.map((pet) => ({
            ...pet,
            date: dayjs(pet.date).add(1, 'day').format('DD/MM/YYYY'),
            vaccineRepeat: dayjs(pet.vaccineRepeat).add(1, 'day').format('DD/MM/YYYY')
        }))

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('carteiraDigital', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            immunizationControl: formattedImmunizationControl,
            success_create_immunization_control: success_create_immunization_control,
            success_create_weight_control: success_create_weight_control,
            success_create_medicines_control: success_create_medicines_control,
            success_download: success_download,
            counter: counter

        })
    },

    async getImmunizationControlForm(req, res) {
        var userId = req.session.userId
        var petId  = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
            }
        })

        var userType   = findUserById.type
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

        res.render('adicionarControleImunizacao', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            counter: counter
        })
    },

    async createImmunizationControl(req, res) {
        var petId = parseInt(req.params.id)

        var form_create_immunization_control = new formidable.IncomingForm()

        form_create_immunization_control.parse(req, async(err, fields, files) => {
            var vaccineDate = fields['date']
            var repeatDate  = fields['repeatDate']

            const createImmunizationControl = await prisma.immunizationControl.create({
                data: {
                    petId: petId,
                    vaccineName: fields['vaccineName'],
                    date: new Date(vaccineDate),
                    vetName: fields['vetName'],
                    vaccineRepeat: new Date(repeatDate)
                }
            })

            req.session.success_create_immunization_control = "Controle de imunização criado com sucesso!"
            res.redirect(`/carteiraDigital/${petId}`)
        })
    },

    async getWeightControlForm(req, res) {
        var userId = req.session.userId
        var petId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
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

        res.render('adicionarControlePeso', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            counter: counter
        })
    },

    async createWeightControl(req, res) {
        var petId = parseInt(req.params.id)

        var form_create_weight_control = new formidable.IncomingForm()

        form_create_weight_control.parse(req, async (err, fields, files) => {
            var weightDate = fields['weightDate']
            var weight = fields['weight']

            const createWeightControl = await prisma.weightControl.create({
                data: {
                    petId: petId,
                    weight: parseInt(weight),
                    weightDate: new Date(weightDate)
                }
            })

            req.session.success_create_weight_control = "Controle de peso criado com sucesso!"
            res.redirect(`/carteiraDigital/${petId}`)
        })
    },

    async getMedicinesControlForm(req, res) {
        var userId = req.session.userId
        var petId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
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

        res.render('adicionarControleMedicamentos', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            counter: counter
        })
    },

    async createMedicinesControl(req, res) {
        var petId = parseInt(req.params.id)

        var form_create_medicines_control = new formidable.IncomingForm()

        form_create_medicines_control.parse(req, async (err, fields, files) => {
            var medicineDate   = fields['medicineDate']
            var medicineRepeat = fields['medicineRepeat']

            const createMedicinesControl = await prisma.medicinesControl.create({
                data: {
                    petId: petId,
                    medicineCategory: fields['medicineCategory'],
                    medicineName: fields['medicineName'],
                    medicineDate: new Date(medicineDate),
                    medicineRepeat: new Date(medicineRepeat)
                }
            })

            req.session.success_create_medicines_control = "Controle de medicamentos criado com sucesso!"
            res.redirect(`/carteiraDigital/${petId}`)
        })
    },

    async getWeightControl(req, res) {
        var userId = req.session.userId
        var petId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findWeightControl = await prisma.weightControl.findMany({
            where: {
                petId: petId
            }
        })

        const formattedWeightControl = findWeightControl.map((pet) => ({
            ...pet,
            weightDate: dayjs(pet.weightDate).add(1, 'day').format('DD/MM/YYYY'),
        }))

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('listarControlePeso', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            weightControl: formattedWeightControl,
            counter: counter
        })
    },

    async getMedicinesControl(req, res) {
        var userId = req.session.userId
        var petId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const findPetById = await prisma.pet.findUnique({
            where: {
                id: petId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findMedicinesControl = await prisma.medicinesControl.findMany({
            where: {
                petId: petId
            }
        })

        const formattedMedicinesControl = findMedicinesControl.map((pet) => ({
            ...pet,
            medicineDate: dayjs(pet.medicineDate).add(1, 'day').format('DD/MM/YYYY'),
            medicineRepeat: dayjs(pet.medicineRepeat).add(1, 'day').format('DD/MM/YYYY'),
        }))

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('listarControleMedicamentos', {
            userType: userType,
            profilePic: profilePic,
            pet: [findPetById],
            medicinesControl: formattedMedicinesControl,
            counter: counter
        })
    },

    async generateDigitalCard(req, res) {
        if (req.session.loggedin == true) {
            var petId = parseInt(req.params.id)

            const findPetById = await prisma.pet.findUnique({
                where: {
                    id: petId
                }
            })

            const findImmunizationControl = await prisma.immunizationControl.findMany({
                where: {
                    petId: petId
                }
            })

            const findMedicinesControl = await prisma.medicinesControl.findMany({
                where: {
                    petId: petId
                }
            })

            const findWeightControl = await prisma.weightControl.findMany({
                where: {
                    petId: petId
                }
            })

            const formattedImmunizationControl = findImmunizationControl.map((pet) => ({
                ...pet,
                date: dayjs(pet.date).add(1, 'day').format('DD/MM/YYYY'),
                vaccineRepeat: dayjs(pet.vaccineRepeat).add(1, 'day').format('DD/MM/YYYY')
            }))

            const formattedMedicinesControl = findMedicinesControl.map((pet) => ({
                ...pet,
                medicineDate: dayjs(pet.medicineDate).add(1, 'day').format('DD/MM/YYYY'),
                medicineRepeat: dayjs(pet.medicineRepeat).add(1, 'day').format('DD/MM/YYYY'),
            }))

            const formattedWeightControl = findWeightControl.map((pet) => ({
                ...pet,
                weightDate: dayjs(pet.weightDate).add(1, 'day').format('DD/MM/YYYY'),
            }))

            var petName = findPetById.name

            const doc = new PDFDocument()

            // ...
            var path_pdf = path.join(__dirname, '../../public/pdfs/', `carteira_digital${petId}.pdf`)
            console.log(path_pdf)
            const stream = fs.createWriteStream(path.join(__dirname, '../../public/pdfs/', `carteira_digital_${petId}.pdf`));
            // var newpathImg = path.join(__dirname, '../../public/profilePics/', nomeimg)

            // Configuração do cabeçalho do documento PDF

            doc
                .fontSize(20)
                .text(`Carteira digital do(a) ${petName}`)
                .moveDown();

            // Exemplo de adição de dados a uma tabela
            doc
                .fontSize(14)
                .text('Controle de Imunização', { bold: true })
                .moveDown();

            formattedImmunizationControl.forEach(function (immunizationControl) {
                doc
                    .fontSize(12)
                    .text('Vacina: ' + immunizationControl.vaccineName)
                    .text('Data: ' + immunizationControl.date)
                    .text('Veterinário que aplicou: ' + immunizationControl.vetName)
                    .text('Repetir em: ' + immunizationControl.vaccineRepeat)
                    .moveDown();
            })

            doc
                .fontSize(14)
                .text('Controle de Peso', { bold: true })
                .moveDown();

            formattedWeightControl.forEach(function (weightControl) {
                doc
                    .fontSize(12)
                    .text('Peso: ' + weightControl.weight)
                    .text('Data: ' + weightControl.weightDate)
                    .moveDown();
            })

            doc
                .fontSize(14)
                .text('Controle de Medicamentos', { bold: true })
                .moveDown();

            formattedMedicinesControl.forEach(function (medicineControl) {
                doc
                    .fontSize(12)
                    .text('Categoria: ' + medicineControl.medicineCategory)
                    .text('Nome: ' + medicineControl.medicineName)
                    .text('Data: ' + medicineControl.medicineDate)
                    .text('Repetir em: ' + medicineControl.medicineRepeat)
                    .moveDown();
            })

            // Finalize e salve o documento PDF
            doc.pipe(stream);
            doc.end();

            // Envie o arquivo PDF gerado como resposta
            stream.on('finish', () => {
                res.download('public/pdfs/' + `carteira_digital_${petId}.pdf`);
            });

            // req.session.success_download = "Download da carteira digital realizado com sucesso!"

            //res.redirect(`/carteiraDigital/${petId}`)
        }
    },

    async getUpdateImmunizationControlForm(req, res) {
        var immunizationControlId = parseInt(req.params.id)
        var userId = req.session.userId

        const findImmunizationControlById = await prisma.immunizationControl.findUnique({
            where: {
                id: immunizationControlId
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

        res.render('editarControleImunizacao', { 
            immunizationControl: [findImmunizationControlById], 
            userType: userType, 
            profilePic: profilePic,
            counter: counter
        })
    },

    async updateImmunizationControl(req, res) {
        var immunizationControlId = parseInt(req.params.id)

        var form_update_immunization_control = new formidable.IncomingForm()

        // console.log(userId)

        form_update_immunization_control.parse(req, async (err, fields, files) => {

            await prisma.immunizationControl.update({
                where: {
                    id: immunizationControlId
                },
                data: {
                    vaccineName: fields['vaccineName'],
                    date: new Date(fields['date']),
                    vetName: fields['vetName'],
                    vaccineRepeat: new Date(fields['repeatDate'])
                }
            })
            req.session.success_update_pet = "Registro no controle de imunização atualizado com sucesso!"
            res.redirect('/pets')
        })
    },

    async deleteImmunizationControl(req, res) {
        var immunizationControlId = parseInt(req.params.id)

        await prisma.immunizationControl.delete({
            where: {
                id: immunizationControlId
            }
        })

        req.session.success_update_pet = "Registro no controle de imunização excluído com sucesso!"
        res.redirect('/pets')

    },

    async getUpdateMedicinesControlForm(req, res) {
        var medicineControlId = parseInt(req.params.id)
        var userId = req.session.userId

        const findMedicinesControlById = await prisma.medicinesControl.findUnique({
            where: {
                id: medicineControlId
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

        res.render('editarControleMedicamentos', {
            medicinesControl: [findMedicinesControlById],
            userType: userType,
            profilePic: profilePic,
            counter: counter
        })
    },

    async updateMedicinesControl(req, res) {
        var medicineControlId = parseInt(req.params.id)

        var form_update_medicines_control = new formidable.IncomingForm()

        // console.log(userId)

        form_update_medicines_control.parse(req, async (err, fields, files) => {

            await prisma.medicinesControl.update({
                where: {
                    id: medicineControlId
                },
                data: {
                    medicineCategory: fields['medicineCategory'],
                    medicineDate: new Date(fields['medicineDate']),
                    medicineName: fields['medicineName'],
                    medicineRepeat: new Date(fields['medicineRepeat'])
                }
            })
            req.session.success_update_pet = "Registro no controle de medicamentos atualizado com sucesso!"
            res.redirect('/pets')
        })
    },

    async deleteMedicineControl(req, res) {
        var medicineControlId = parseInt(req.params.id)

        await prisma.medicinesControl.delete({
            where: {
                id: medicineControlId
            }
        })

        req.session.success_update_pet = "Registro no controle de medicamentos excluído com sucesso!"
        res.redirect('/pets')

    },

    async getUpdateWeigthControlForm(req, res) {
        var weightControlId = parseInt(req.params.id)
        var userId = req.session.userId

        const findWeightControlById = await prisma.weightControl.findUnique({
            where: {
                id: weightControlId
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

        res.render('editarControlePeso', {
            weightControl: [findWeightControlById],
            userType: userType,
            profilePic: profilePic,
            counter: counter
        })
    },

    async updateWeightControl(req, res) {
        var weightControlId = parseInt(req.params.id)

        var form_update_weight_control = new formidable.IncomingForm()

        // console.log(userId)

        form_update_weight_control.parse(req, async (err, fields, files) => {

            await prisma.weightControl.update({
                where: {
                    id: weightControlId
                },
                data: {
                    weight: parseInt(fields['weight']),
                    weightDate: new Date(fields['weightDate'])
                }
            })
            req.session.success_update_pet = "Registro no controle de peso atualizado com sucesso!"
            res.redirect('/pets')
        })
    },

    async deleteWeightControl(req, res) {
        var weightControlId = parseInt(req.params.id)

        await prisma.weightControl.delete({
            where: {
                id: weightControlId
            }
        })

        req.session.success_update_pet = "Registro no controle de peso excluído com sucesso!"
        res.redirect('/pets')

    },

}