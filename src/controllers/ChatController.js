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

            const findMyMessages = await prisma.chat.findMany({
                where: {
                    sentMessageId: senderUserId,
                    receivedMessageId: recipientUserId,
                },
                orderBy: {
                    created_at: 'asc', // Ordena as mensagens do remetente pelo horário de criação em ordem ascendente
                },
            });

            const findRecipientMessages = await prisma.chat.findMany({
                where: {
                    sentMessageId: recipientUserId,
                    receivedMessageId: senderUserId,
                },
                orderBy: {
                    created_at: 'asc', // Ordena as mensagens do destinatário pelo horário de criação em ordem ascendente
                },
            });

            var userType = findSenderUserById.type;
            var profilePic = findSenderUserById.profilePic;
            var recipientProfilePic = findRecipientUserById.profilePic;

            const formattedMyMessagesDate = findMyMessages.map((message) => ({
                ...message,
                created_at: dayjs(message.created_at).add(1, 'day').format('DD/MM/YYYY HH:mm'),
            }));

            const formattedRecipientMessagesDate = findRecipientMessages.map((message) => ({
                ...message,
                created_at: dayjs(message.created_at).add(1, 'day').format('DD/MM/YYYY HH:mm'),
            }));

            res.render('chat', {
                userType: userType,
                profilePic: profilePic,
                recipientProfilePic: recipientProfilePic,
                success_message: success_message,
                recipientId: recipientUserId,
                myMessages: formattedMyMessagesDate,
                recipientMessages: formattedRecipientMessagesDate,
            });
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
}