-- CreateTable
CREATE TABLE `DownloadLog` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `objectKey` VARCHAR(512) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DownloadLog_userId_idx`(`userId`),
    INDEX `DownloadLog_createdAt_idx`(`createdAt`),
    INDEX `DownloadLog_objectKey_idx`(`objectKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DownloadLog` ADD CONSTRAINT `DownloadLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
