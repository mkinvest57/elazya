const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Connecting to DB...');
    try {
        const count = await prisma.customer.count();
        console.log('Prisma Connected. Customer count:', count);
    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
