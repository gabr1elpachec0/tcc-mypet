-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `profilePic` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `certified` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `petPic` VARCHAR(191) NOT NULL,
    `petName` VARCHAR(191) NOT NULL,
    `petDescription` VARCHAR(191) NOT NULL,
    `petType` VARCHAR(191) NOT NULL,
    `petGender` VARCHAR(191) NOT NULL,
    `petSpayed` BOOLEAN NOT NULL DEFAULT false,
    `petVaccinated` BOOLEAN NOT NULL DEFAULT false,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `contact` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `pic` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `like` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumReply` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `forumMessageId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sentMessageId` INTEGER NOT NULL,
    `receivedMessageId` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `breed` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImmunizationControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `petId` INTEGER NOT NULL,
    `vaccineName` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `vetName` VARCHAR(191) NOT NULL,
    `vaccineRepeat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeightControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `petId` INTEGER NOT NULL,
    `weight` INTEGER NOT NULL,
    `weightDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicinesControl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `petId` INTEGER NOT NULL,
    `medicineCategory` VARCHAR(191) NOT NULL,
    `medicineName` VARCHAR(191) NOT NULL,
    `medicineDate` DATETIME(3) NOT NULL,
    `medicineRepeat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostComment` ADD CONSTRAINT `PostComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostComment` ADD CONSTRAINT `PostComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumMessage` ADD CONSTRAINT `ForumMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumReply` ADD CONSTRAINT `ForumReply_forumMessageId_fkey` FOREIGN KEY (`forumMessageId`) REFERENCES `ForumMessage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumReply` ADD CONSTRAINT `ForumReply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_sentMessageId_fkey` FOREIGN KEY (`sentMessageId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_receivedMessageId_fkey` FOREIGN KEY (`receivedMessageId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImmunizationControl` ADD CONSTRAINT `ImmunizationControl_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeightControl` ADD CONSTRAINT `WeightControl_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicinesControl` ADD CONSTRAINT `MedicinesControl_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
