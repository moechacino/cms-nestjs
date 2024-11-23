/*
  Warnings:

  - You are about to alter the column `category_id` on the `articles` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `category_id` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - The primary key for the `files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `file_id` on the `files` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - The primary key for the `labels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `label_id` on the `labels` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - The primary key for the `labels_on_articles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `label_id` on the `labels_on_articles` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.

*/
-- DropForeignKey
ALTER TABLE `articles` DROP FOREIGN KEY `articles_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `labels_on_articles` DROP FOREIGN KEY `labels_on_articles_label_id_fkey`;

-- AlterTable
ALTER TABLE `articles` MODIFY `category_id` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `categories` DROP PRIMARY KEY,
    MODIFY `category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`category_id`);

-- AlterTable
ALTER TABLE `files` DROP PRIMARY KEY,
    MODIFY `file_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`file_id`);

-- AlterTable
ALTER TABLE `labels` DROP PRIMARY KEY,
    MODIFY `label_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`label_id`);

-- AlterTable
ALTER TABLE `labels_on_articles` DROP PRIMARY KEY,
    MODIFY `label_id` INTEGER UNSIGNED NOT NULL,
    ADD PRIMARY KEY (`label_id`, `article_id`);

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `labels_on_articles` ADD CONSTRAINT `labels_on_articles_label_id_fkey` FOREIGN KEY (`label_id`) REFERENCES `labels`(`label_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
