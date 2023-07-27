const { Router } = require('express')
const UserController = require('./controllers/UserController')
const VetController = require('./controllers/VetController')
const PetController = require('./controllers/PetController')
const DonationController = require('./controllers/DonationController')
const PostController = require('./controllers/PostController')
const HomeController = require('./controllers/HomeController')
const ForumController = require('./controllers/ForumController')
const ChatController = require('./controllers/ChatController')
const NotificationController = require('./controllers/NotificationController')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


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

router.get('/logout', async function (req, res) {
    var userId = req.session.userId;
    if (req.session.loggedin == true) {
        req.session.loggedin = false;
        req.session.warning = "Você se desconectou da plataforma, faça o login!";
        try {
            await prisma.notification.deleteMany({
                where: {
                    userId: userId
                }
            });
            res.redirect('/home');
        } catch (error) {
            // Tratar erros, se necessário
            console.error(error);
            res.status(500).send("Ocorreu um erro ao fazer logout.");
        }
    } else {
        req.session.warning = "Você não está logado!";
        res.redirect('/home');
    }
});

router.get('/conversas', ChatController.getChats)

router.get('/user-profile', UserController.getUsers)
router.get('/vet-profile', VetController.getVets)

router.get('/user-update/:id', UserController.updateUserForm)
router.post('/user-update/:id', UserController.updateUser)

router.get('/vet-update/:id', VetController.updateVetForm)
router.post('/vet-update/:id', VetController.updateVet)


router.get('/selecionarPet', PetController.getSelectPetForm)

// Notifications
router.get('/notifications', NotificationController.listNotifications)

// Blog routes
router.get('/blog', PostController.getAllPosts)
router.get('/minhasPublicacoes', PostController.getMyPosts)
router.get('/post-update/:id', PostController.updatePostForm)
router.post('/post-update/:id', PostController.updatePost)
router.post('/post', PostController.createPost)
router.get('/post-create', PostController.createPostForm)
router.get('/post-delete/:id', PostController.deletePost)
router.get('/post-comment/:id', PostController.getCommentForm)
router.post('/post-comment/:id', PostController.comment)
router.get('/post-comments/:id', PostController.getAllComments)
router.get('/post-like/:id', PostController.like)

// Forum
router.get('/forum', ForumController.getAllForumMessages)
router.get('/adicionarMensagemForum', ForumController.createForumMessageForm)
router.get('/minhasMensagens', ForumController.getMyForumMessages)
router.post('/adicionarMensagemForum', ForumController.createForumMessage)
router.get('/forumMessage-update/:id', ForumController.getUpdateForm)
router.post('/forumMessage-update/:id', ForumController.updateForumMessage)
router.get('/forumMessage-delete/:id', ForumController.deleteForumMessage)
router.get('/responderMensagemForum/:id', ForumController.getMessageResponseForm)
router.post('/responderMensagemForum/:id', ForumController.createForumMessageResponse)
router.get('/verRespostasMensagemForum/:id', ForumController.getForumMessagesReplies)
router.get('/minhasRespostas', ForumController.getMyForumReplies)
router.get('/forumReply-update/:id', ForumController.getUpdateForumReplyForm)
router.post('/forumReply-update/:id', ForumController.updateForumReply)
router.get('/forumReply-delete/:id', ForumController.deleteForumReply)

// Pets e Carteira Digital
router.get('/carteiraDigital/:id', PetController.getDigitalCard)
router.get('/gerarCarteiraDigital/:id', PetController.generateDigitalCard)

router.get('/adicionarControleImunizacao/:id', PetController.getImmunizationControlForm)
router.post('/adicionarControleImunizacao/:id', PetController.createImmunizationControl)
router.get('/immunizationControl-update/:id', PetController.getUpdateImmunizationControlForm)
router.post('/immunizationControl-update/:id', PetController.updateImmunizationControl)
router.get('/immunizationControl-delete/:id', PetController.deleteImmunizationControl)

router.get('/adicionarControlePeso/:id', PetController.getWeightControlForm)
router.post('/adicionarControlePeso/:id', PetController.createWeightControl)
router.get('/weightControl-update/:id', PetController.getUpdateWeigthControlForm)
router.post('/weightControl-update/:id', PetController.updateWeightControl)
router.get('/weightControl-delete/:id', PetController.deleteWeightControl)

router.get('/adicionarControleMedicamentos/:id', PetController.getMedicinesControlForm)
router.post('/adicionarControleMedicamentos/:id', PetController.createMedicinesControl)
router.get('/medicinesControl-update/:id', PetController.getUpdateMedicinesControlForm)
router.post('/medicinesControl-update/:id', PetController.updateMedicinesControl)
router.get('/medicinesControl-delete/:id', PetController.deleteMedicineControl)

router.get('/listarControlePeso/:id', PetController.getWeightControl)
router.get('/listarControleMedicamentos/:id', PetController.getMedicinesControl)

// Veterinários
router.get('/listaVeterinarios', VetController.getAllVets)

router.get('/profile/:id', UserController.getProfile)
router.get('/user-posts/:id', UserController.getUserPosts)
router.get('/user-donations/:id', UserController.getUserDonations)
router.get('/user-messages/:id', UserController.getUserForumMessages)

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

// Chat
router.get('/chat/:id', ChatController.getChat)
router.post('/chat/:id', ChatController.createMessage)

module.exports = router