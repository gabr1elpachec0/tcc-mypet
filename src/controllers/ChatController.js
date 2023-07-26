const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);

const prisma = new PrismaClient()

module.exports = {
    

    // Get Chat
    async getChat(req, res) {
        var success_message;

        if (req.session.success_message) {
            success_message = req.session.success_message;
            req.session.success_message = "";
        }

        if (req.session.loggedin == true) {
            var senderUserId = req.session.userId;
            var recipientUserId = parseInt(req.params.id);

            const findSenderUserById = await prisma.user.findUnique({
                where: {
                    id: senderUserId,
                },
            });

            const findRecipientUserById = await prisma.user.findUnique({
                where: {
                    id: recipientUserId,
                },
            });

            const allMessages = await prisma.chat.findMany({
                where: {
                    OR: [
                        {
                            sentMessageId: senderUserId,
                            receivedMessageId: recipientUserId,
                        },
                        {
                            sentMessageId: recipientUserId,
                            receivedMessageId: senderUserId,
                        },
                    ],
                },
                orderBy: {
                    created_at: 'asc', // Ordena todas as mensagens pelo horário de criação em ordem decrescente
                },
            });

            var userType = findSenderUserById.type;
            var profilePic = findSenderUserById.profilePic;
            var recipientProfilePic = findRecipientUserById.profilePic;

            const formattedMessages = allMessages.map((message) => ({
                ...message,
                created_at: dayjs(message.created_at).format('DD/MM/YYYY HH:mm:ss'),
            }));

            if (senderUserId == recipientUserId) {
                req.session.warning = "Acesso inválido";
                res.redirect('/home');
            } else {
                res.render('chat', {
                    userType: userType,
                    profilePic: profilePic,
                    recipientProfilePic: recipientProfilePic,
                    success_message: success_message,
                    recipientId: recipientUserId,
                    allMessages: formattedMessages,
                    senderUserId: senderUserId
                });
            }
        } else {
            req.session.erro = "Faça login para acessar esse serviço!";
            res.redirect('/login');
        }
    },



    async createMessage(req, res) {
        var form_create_message = new formidable.IncomingForm()

        form_create_message.parse(req, async(err, fields, files) => {
            var senderUserId = req.session.userId
            var recipientUserId = parseInt(req.params.id)

            const createMessage = await prisma.chat.create({
                data: {
                    sentMessageId: senderUserId,
                    receivedMessageId: recipientUserId,
                    message: fields['message']
                }
            })

            req.session.success_message = "Mensagem enviada!"
            res.redirect(`/chat/${recipientUserId}`)
        })

    },

    async getChats(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            
            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            const getChats = await prisma.chat.findMany({
                where: {
                    sentMessageId: userId,
                },
                include: {
                    receivedMessage: true
                }
            })

            // console.log(getChats)

            res.render('conversas', {
                userType: userType,
                profilePic: profilePic,
                chats: getChats
            })
        
        }
    }
}