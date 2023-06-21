const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')

const prisma = new PrismaClient()

module.exports = {

    // Create Forum Message Form
    async createForumMessageForm(req, res) {
        var userId = req.session.userId

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType   = findUserById.type
        var profilePic = findUserById.profilePic

        res.render('adicionarMensagemForum', { userType: userType, profilePic: profilePic })
    },
    
    // Create Forum Message

    async createForumMessage(req, res) {
        var userId = req.session.userId

        var form_create_forum_message = new formidable.IncomingForm()

        form_create_forum_message.parse(req, async (err, fields, files) => {
            const createForumMessage = await prisma.forumMessage.create({
                data: {
                    userId: userId,
                    title: fields['title'],
                    description: fields['description']
                }
            })
            // console.log(createPost)

            req.session.success_create_forum_message = "Mensagem criada com sucesso!"
            res.redirect('/forum')
        })
    },


    async getAllForumMessages(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            var userType   = findUserById.type
            var profilePic = findUserById.profilePic
            // var userName   = findUserById.name
            var success_create_forum_message

            if (req.session.success_create_forum_message) {
                success_create_forum_message = req.session.success_create_forum_message
                req.session.success_create_forum_message = ""
            }

            const findAllMessages = await prisma.forumMessage.findMany({
                include: {
                    forumMessageAuthor: true
                }
            })

            res.render('forum', { messages: findAllMessages, userType: userType, profilePic: profilePic, success_create_forum_message: success_create_forum_message })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    async getMyForumMessages(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            var userType = findUserById.type
            var profilePic = findUserById.profilePic
            var success_update_forum_message 
            var success_delete_forum_message 


            const findMyForumMessages = await prisma.forumMessage.findMany({
                where: {
                    userId: userId
                },
                include: {
                    forumMessageAuthor: true
                }
            })

            if (req.session.success_update_forum_message) {
                success_update_forum_message = req.session.success_update_forum_message
                req.session.success_update_forum_message = ""
            }
            if (req.session.success_delete_pet) {
                success_delete_forum_message = req.session.success_delete_pet
                req.session.success_delete_pet = ""
            }

            res.render('minhasMensagens', { messages: findMyForumMessages, userType: userType, profilePic: profilePic, success_update_forum_message: success_update_forum_message, success_delete_forum_message: success_delete_forum_message })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    async getUpdateForm(req, res) {
        var forumMessageId = parseInt(req.params.id)
        var userId = req.session.userId

        const findForumMessageById = await prisma.forumMessage.findUnique({
            where: {
                id: forumMessageId
            }
        })

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        res.render('editarMensagemForum', { message: [findForumMessageById], userType: userType, profilePic: profilePic })
    },

    async updateForumMessage(req, res) {
        var userId = req.session.userId
        var forumMessageId = parseInt(req.params.id)

        var form_update_forum_message = new formidable.IncomingForm()

        form_update_forum_message.parse(req, async (err, fields, files) => {
            const updateForumMessage = await prisma.forumMessage.update({
                where: {
                    id: forumMessageId
                },
                data: {
                    userId: userId,
                    title: fields['title'],
                    description: fields['description']
                }
            })
            // console.log(updateForumMessage)

            req.session.success_update_forum_message = "Mensagem atualizada com sucesso!"
            res.redirect('/minhasMensagens')
        })
    },

    async deleteForumMessage(req, res) {
        var forumMessageId = parseInt(req.params.id)

        await prisma.forumMessage.delete({
            where: {
                id: forumMessageId
            }
        })
        req.session.success_delete_pet = "Mensagem excluída com sucesso!"
        res.redirect('/minhasMensagens')
    }
}