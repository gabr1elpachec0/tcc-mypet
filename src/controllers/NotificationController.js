const { PrismaClient } = require('@prisma/client')
const dayjs = require('dayjs')

const prisma = new PrismaClient()

module.exports = {
    async createVaccineNotification(userId) {
        // console.log(userId)

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
                const repeatDate = dayjs(immunizationControl.vaccineRepeat, 'DD/MM/YYYY');
                const differenceInDays = (repeatDate.diff(dayjs(), 'day') + 1);

                // console.log(repeatDate);
                // console.log(differenceInDays);

                if (differenceInDays == 7) {
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: "Você precisa vacinar seu pet daqui a 7 dias!",
                        }
                    });
                }
            }
        }
    },

    async createMedicineNotification(userId) {
        const findUserPets = await prisma.pet.findMany({
            where: {
                userId: userId
            }
        });

        for (const userPet of findUserPets) {
            const findMedicinesControl = await prisma.medicinesControl.findMany({
                where: {
                    petId: userPet.id
                }
            });

            for (const medicinesControl of findMedicinesControl) {
                const repeatDate = dayjs(medicinesControl.medicineRepeat, 'DD/MM/YYYY');
                const differenceInDays = (repeatDate.diff(dayjs(), 'day') + 1);

                // console.log(repeatDate);
                // console.log(differenceInDays);

                if (differenceInDays == 7) {
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: "Você precisa dar remédio ao seu pet daqui a 7 dias!",
                        }
                    });
                }
            }
        }

    },


    async listNotifications(req, res) {
        var userId = req.session.userId;

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
