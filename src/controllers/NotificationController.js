const { PrismaClient } = require('@prisma/client')
const dayjs = require('dayjs')

const prisma = new PrismaClient()

module.exports = {
    async createVaccineNotification(userId) {
        // console.log(userId)

        const currentDate = dayjs().startOf('day')


        const findUserPets = await prisma.pet.findMany({
            where: {
                userId: userId
            }
        });

        for (const userPet of findUserPets) {
            const findImmunizationControl = await prisma.immunizationControl.findMany({
                where: {
                    petId: userPet.id
                },
                include: {
                    pet: true,
                }
            });

            for (const immunizationControl of findImmunizationControl) {
                const repeatDate = dayjs(immunizationControl.vaccineRepeat, 'DD/MM/YYYY');
                const differenceInDays = (repeatDate.diff(currentDate, 'day') + 1);

                // console.log(repeatDate);

                if (differenceInDays === 7) {
                    // console.log(differenceInDays);
                    var petName     = immunizationControl.pet.name
                    var vaccineName = immunizationControl.vaccineName
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: `Faltam 7 dias para repetir a dose de ${vaccineName} para ${petName}`,
                        }
                    });
                }

                if (differenceInDays === 1) {
                    // console.log(differenceInDays);
                    var petName = immunizationControl.pet.name
                    var vaccineName = immunizationControl.vaccineName
                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: `Falta 1 dia para repetir a dose de ${vaccineName} para ${petName}`,
                        }
                    });
                }
            }
        }
    },

    async createMedicineNotification(userId) {
        const currentDate = dayjs().startOf('day')

        const findUserPets = await prisma.pet.findMany({
            where: {
                userId: userId
            }
        });

        for (const userPet of findUserPets) {
            const findMedicinesControl = await prisma.medicinesControl.findMany({
                where: {
                    petId: userPet.id
                },
                include: {
                    pet: true
                }
            });

            for (const medicinesControl of findMedicinesControl) {
                const repeatDate = dayjs(medicinesControl.medicineRepeat, 'DD/MM/YYYY');
                const differenceInDays = (repeatDate.diff(currentDate, 'day') + 1);

                // console.log(repeatDate);
                // console.log(differenceInDays);


                if (differenceInDays === 7) {
                    var petName = medicinesControl.pet.name
                    var medicineName = medicinesControl.medicineName

                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: `Faltam 7 dias para repetir a dose de ${medicineName} para ${petName}`,
                        }
                    });
                }

                if (differenceInDays === 1) {
                    var petName = medicinesControl.pet.name
                    var medicineName = medicinesControl.medicineName

                    await prisma.notification.create({
                        data: {
                            userId: userId,
                            message: `Falta 1 dia para repetir a dose de ${medicineName} para ${petName}`,
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

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('notificacoes', {
            userType: userType,
            profilePic: profilePic,
            notifications: findNotificationByUserId,
            counter: counter
        })
    },

    

};
