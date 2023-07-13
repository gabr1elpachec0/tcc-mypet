const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
    async createVaccineNotification(userId) {
        const dateNow = new Date();

        const findUserPets = await prisma.pet.findMany({
            where: {
                userId: userId
            }
        });

        for (const userPet of findUserPets) {
            const findImmunizationControl = await prisma.immunizationControl.findMany({
                where: {
                    petId: userPet.id
                }
            });

            for (const immunizationControl of findImmunizationControl) {
                const repeatDate = immunizationControl.vaccineRepeat;

                const diffInDays = Math.floor((repeatDate - dateNow) / (1000 * 60 * 60 * 24));
                if (diffInDays === 7) {
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: "Você precisa vacinar seu pet daqui a 7 dias!"
                        }
                    });
                }
            }
        }
    },

    async listNotifications(userId) {
        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        const userType = findUserById.type;
        const profilePic = findUserById.profilePic;

        const findNotificationByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        });

        res.render('notificacoes', {
            userType: userType,
            profilePic: profilePic,
            notifications: findNotificationByUserId
        })
    }
};
