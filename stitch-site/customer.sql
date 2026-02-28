-- Manual Migration for Customer Table (Bypassing Prisma OOM)
USE dbs15269470;

CREATE TABLE IF NOT EXISTS Customer (
    id VARCHAR(191) NOT NULL,
    email VARCHAR(191) NOT NULL,
    firstName VARCHAR(191),
    lastName VARCHAR(191),
    address VARCHAR(191),
    city VARCHAR(191),
    country VARCHAR(191),
    stripeId VARCHAR(191),
    licenseKey VARCHAR(191) NOT NULL,
    purchasedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL,
    
    UNIQUE INDEX Customer_email_key(email),
    UNIQUE INDEX Customer_stripeId_key(stripeId),
    UNIQUE INDEX Customer_licenseKey_key(licenseKey),
    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
