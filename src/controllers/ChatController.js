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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

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
                    senderUserId: senderUserId,
                    counter: counter
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
            var userId = req.session.userId;

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });

            var userType = findUserById.type;
            var profilePic = findUserById.profilePic;

            const allChats = await prisma.chat.findMany({
                where: {
                    OR: [
                        { sentMessageId: userId },
                        { receivedMessageId: userId },
                    ],
                },
                include: {
                    sentMessage: true,
                    receivedMessage: true,
                },
            });

            const uniqueChats = {}; // Objeto para armazenar as conversas distintas

            // Adicionar as mensagens ao objeto de conversas distintas
            allChats.forEach(chat => {
                if (chat.sentMessageId === userId) {
                    const recipientId = chat.receivedMessageId;
                    if (!uniqueChats[recipientId]) {
                        uniqueChats[recipientId] = chat.receivedMessage;
                    }
                } else if (chat.receivedMessageId === userId) {
                    const senderId = chat.sentMessageId;
                    if (!uniqueChats[senderId]) {
                        uniqueChats[senderId] = chat.sentMessage;
                    }
                }
            });

            /* Percorro cada mensagem enviada e verifico se o id da pessoa que enviou ou recebeu a mensagem já está 
            na lista uniqueChats ou não. Se estiver, ele passa para a outra mensagem e não adiciona. Se não estiver ele adiciona
            e assim, não adicionará mais, mantendo o requisito estabelecido, ou seja, não repetindo os ids das conversas. 
            Após isso, os valores de dentro desse objeto serão passados para um array. */

            // Converter o objeto de conversas distintas em uma matriz
            const chatsArray = Object.values(uniqueChats);
            // console.log(chatsArray)

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('conversas', {
                userType: userType,
                profilePic: profilePic,
                chats: chatsArray,
                counter: counter
            });
        }
    }

}