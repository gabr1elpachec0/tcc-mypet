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

            res.render('forum', { userType: userType, profilePic: profilePic, success_create_forum_message: success_create_forum_message })
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
            // var userName   = findUserById.name

            res.render('minhasMensagens', { userType: userType, profilePic: profilePic })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },


}