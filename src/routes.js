const { Router } = require('express')
const UserController = require('./controllers/UserController')
const VetController = require('./controllers/VetController')
const PetController = require('./controllers/PetController')
const DonationController = require('./controllers/DonationController')
const PostController = require('./controllers/PostController')
const HomeController = require('./controllers/HomeController')
const ForumController = require('./controllers/ForumController')

const router = Router()

// Views



// Home
router.get('/home', HomeController.getHome)

// User Views
router.get('/cadastro', function (req, res) {
    var erro_cadastro
    if (req.session.erro_cadastro) {
        erro_cadastro = req.session.erro_cadastro
        req.session.erro_cadastro = ""
    }
    res.render('cadastro', { erro_cadastro: erro_cadastro })
})

router.get('/cadastro-vet', function (req, res) {
    var erro_cadastro
    if (req.session.erro_cadastro) {
        erro_cadastro = req.session.erro_cadastro
        req.session.erro_cadastro = ""
    }
    res.render('cadastro-vet', { erro_cadastro: erro_cadastro })
})

router.get('/login', function (req, res) {
    var sucesso_cadastro
    var erro_login
    var erro

    if (req.session.sucesso_cadastro) {
        sucesso_cadastro = req.session.sucesso_cadastro
        req.session.sucesso_cadastro = ""
    }

    if (req.session.erro_login) {
        erro_login = req.session.erro_login
        req.session.erro_login = ""
    }

    if (req.session.erro) {
        erro = req.session.erro
        req.session.erro = ""
    }

    res.render('login', 
    { 
        sucesso_cadastro: sucesso_cadastro, 
        erro_login: erro_login,
        erro: erro
        
    })
})

router.get('/logout', function(req, res) {
    if (req.session.loggedin == true) {
        req.session.loggedin = false
        req.session.warning = "Você se desconectou da plataforma, faça o login!"
        res.redirect('/home')
    } else {
        req.session.warning = "Você não está logado!"
        res.redirect('/home')
    }
})

router.get('/user-profile', UserController.getUsers)
router.get('/vet-profile', VetController.getVets)

router.get('/editarPerfil', function (req, res) {
    res.render('editarPerfil')
})

router.get('/selecionarPet', PetController.getSelectPetForm)

// Blog routes
router.get('/blog', PostController.getAllPosts)
router.get('/minhasPublicacoes', PostController.getMyPosts)
router.get('/post-update/:id', PostController.updatePostForm)
router.post('/post-update/:id', PostController.updatePost)
router.post('/post', PostController.createPost)
router.get('/post-create', PostController.createPostForm)
router.get('/post-delete/:id', PostController.deletePost)

// Forum
router.get('/forum', ForumController.getAllForumMessages)
router.get('/adicionarMensagemForum', ForumController.createForumMessageForm)
router.get('/minhasMensagens', ForumController.getMyForumMessages)
router.post('/adicionarMensagemForum', ForumController.createForumMessage)
router.get('/forumMessage-update/:id', ForumController.getUpdateForm)
router.post('/forumMessage-update/:id', ForumController.updateForumMessage)
router.get('/forumMessage-delete/:id', ForumController.deleteForumMessage)

// Pets e Carteira Digital
router.get('/carteiraDigital/:id', PetController.getDigitalCard)

router.get('/adicionarControleImunizacao/:id', PetController.getImmunizationControlForm)
router.post('/adicionarControleImunizacao/:id', PetController.createImmunizationControl)

router.get('/adicionarControlePeso/:id', PetController.getWeightControlForm)
router.post('/adicionarControlePeso/:id', PetController.createWeightControl)

router.get('/adicionarControleMedicamentos/:id', PetController.getMedicinesControlForm)
router.post('/adicionarControleMedicamentos/:id', PetController.createMedicinesControl)

router.get('/listarControlePeso/:id', PetController.getWeightControl)
router.get('/listarControleMedicamentos/:id', PetController.getMedicinesControl)

// Veterinários
router.get('/listaVeterinarios', VetController.getAllVets)
router.get('/profile/:id', UserController.getProfile)

// Controllers

// User Controller
router.post('/user-create', UserController.createUser)
router.post('/user-login', UserController.verifyUser)

// Vet Controller
router.post('/vet', VetController.createVet)


//Pets Controller
router.post('/pet-create', PetController.createPet)
router.get('/pets', PetController.getMyPets)
router.get('/pet-update/:id', PetController.updatePetForm)
router.post('/pet-update/:id', PetController.updatePet)
router.get('/pet-delete/:id', PetController.deletePet)
router.get('/adicionarPet', PetController.createPetForm)
// Os navegadores geralmente só são capazes de enviar solicitações GET e POST diretamente através do formulário HTML.
// Por esse motivo não usei router.delete

// Donation routes
router.get('/doacoes', DonationController.getAllDonations)
router.post('/donation', DonationController.createDonation)
router.get('/adicionarDoacao', DonationController.createDonationForm) 
router.get('/minhasDoacoes', DonationController.getMyDonations)
router.get('/donation-update/:id', DonationController.updateDonationForm)
router.post('/donation-update/:id', DonationController.updateDonation)
router.get('/donation-delete/:id', DonationController.deleteDonation)


module.exports = router