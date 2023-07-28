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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('adicionarMensagemForum', { userType: userType, profilePic: profilePic, counter: counter })
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
            var warning
            var success_create_forum_message_response

            if (req.session.success_create_forum_message) {
                success_create_forum_message = req.session.success_create_forum_message
                req.session.success_create_forum_message = ""
            }

            if (req.session.warning) {
                warning = req.session.warning
                req.session.warning = ""
            }

            if (req.session.success_create_forum_message_response) {
                success_create_forum_message_response = req.session.success_create_forum_message_response
                req.session.success_create_forum_message_response = ""
            }

            const findAllMessages = await prisma.forumMessage.findMany({
                include: {
                    forumMessageAuthor: true
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

            res.render('forum', { 
                messages: findAllMessages, 
                userType: userType, 
                profilePic: profilePic, 
                success_create_forum_message: success_create_forum_message, 
                success_create_forum_message_response: success_create_forum_message_response,
                warning: warning,
                counter: counter
            })
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

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('minhasMensagens', { messages: findMyForumMessages, userType: userType, profilePic: profilePic, success_update_forum_message: success_update_forum_message, success_delete_forum_message: success_delete_forum_message, counter: counter })
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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('editarMensagemForum', { message: [findForumMessageById], userType: userType, profilePic: profilePic, counter: counter })
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
    },

    async getMessageResponseForm(req, res) {
        var userId = req.session.userId
        var messageId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType   = findUserById.type
        var profilePic = findUserById.profilePic

        const findMessage = await prisma.forumMessage.findUnique({
            where: {
                id: messageId
            },
            include: {
                forumMessageAuthor: true
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

        if (userType == "vet") {
            res.render('responderMensagemForum', {
                userType: userType,
                profilePic: profilePic,
                message: findMessage,
                counter: counter
            })
        } else {
            req.session.warning = "Você não tem permissão para responder à dúvida!"
            res.redirect('/forum')
        }
    },

    async createForumMessageResponse(req, res) {
        var messageId = parseInt(req.params.id)
        var userId    = req.session.userId

        var form_create_forum_message_response = new formidable.IncomingForm()

        form_create_forum_message_response.parse(req, async (err, fields, files) => {
            const createForumMessageResponse = await prisma.forumReply.create({
                data: {
                    forumMessageId: messageId,
                    userId: userId,
                    description: fields['resposta']
                }
            }) 

            req.session.success_create_forum_message_response = "Resposta adicionada com sucesso!"
            res.redirect('/forum')
        })

    },

    async getForumMessagesReplies(req, res) {
        var messageId = parseInt(req.params.id)
        var userId    = req.session.userId

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findForumMessagesReplies = await prisma.forumReply.findMany({
            where: {
                forumMessageId: messageId
            },
            include: {
                forumReplyAuthor: true
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

        res.render('verRespostasMensagemForum', {
            replies: findForumMessagesReplies,
            userType: userType,
            profilePic: profilePic,
            counter: counter
        })
    },

    async getMyForumReplies(req, res) {
        var userId = req.session.userId
        var success_update_forum_message
        var success_delete_forum_message


        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findMyForumReplies = await prisma.forumReply.findMany({
            where: {
                userId: userId
            },
            include: {
                forumMessage: true,
            }
        })

        if (req.session.success_update_forum_message) {
            success_update_forum_message = req.session.success_update_forum_message
            req.session.success_update_forum_message = ""
        }

        if (req.session.success_delete_forum_message) {
            success_delete_forum_message = req.session.success_delete_forum_message
            req.session.success_delete_forum_message = ""
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

        res.render('minhasRespostas', {
            userType: userType,
            profilePic: profilePic,
            replies: findMyForumReplies,
            success_update_forum_message: success_update_forum_message,
            success_delete_forum_message: success_delete_forum_message,
            counter: counter
        })
    },

    async getUpdateForumReplyForm(req, res) {
        var userId = req.session.userId
        var replyId = parseInt(req.params.id)

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findForumReply = await prisma.forumReply.findUnique({
            where: {
                id: replyId
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

        res.render('editarRespostaForum', {
            userType: userType,
            profilePic: profilePic,
            reply: findForumReply,
            counter: counter
        })
    },

    async updateForumReply(req, res) {
        var replyId = parseInt(req.params.id)

        var form_update_forum_reply = new formidable.IncomingForm()

        form_update_forum_reply.parse(req, async (err, fields, files) => {
            await prisma.forumReply.update({
                where: {
                    id: replyId
                },
                data: {
                    description: fields['description'] 
                }
            })

            req.session.success_update_forum_message = "Resposta atualizada com sucesso!"
            res.redirect('/minhasRespostas')
        })

    },

    async deleteForumReply(req, res) {
        var replyId = parseInt(req.params.id)

        await prisma.forumReply.delete({
            where: {
                id: replyId
            }
        })

        req.session.success_delete_forum_message = "Resposta excluída com sucesso!"
        res.redirect('/minhasRespostas')
    }
}