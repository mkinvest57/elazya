import { execa } from 'execa';
import chalk from 'chalk';

const AGENTS = [
    { id: 'facturation', name: 'Facturation Auto', expected: 'Facture' },
    { id: 'onboarding-client', name: 'Onboarding Client', expected: 'Brouillon' },
    { id: 'linkedin-digest', name: 'LinkedIn Digest', expected: 'Matinée' },
    { id: 'qualification', name: 'Qualification Leads', expected: 'Score' },
    { id: 'routine-matinale', name: 'Routine Matinale', expected: 'Brief' },
    { id: 'crm-prospect', name: 'CRM Prospect', expected: 'Contacts' },
    { id: 'devis-express', name: 'Devis Express', expected: 'Devis' },
    { id: 'email-intelligent', name: 'Email Intelligent', expected: 'Inbox' },
    { id: 'compta-export', name: 'Compta Export', expected: 'Export' },
    { id: 'content-linkedin', name: 'Content Auto LinkedIn', expected: 'posts' },
];

async function run() {
    console.log(chalk.bold.blue('\n🚀 Lancement des tests globaux des 10 agents Elazya 🚀\n'));

    let allPassed = true;

    for (const agent of AGENTS) {
        process.stdout.write(`Testing ${chalk.bold(agent.name)}... `);
        try {
            // We use cargo run to execute a specific test CLI command (we will add it to main.rs)
            await execa('cargo', ['run', '--', '--test-agent', agent.id], {
                cwd: './src-tauri',
            });

            console.log(chalk.green('✅ PASS'));
        } catch (error) {
            console.log(chalk.red('❌ FAIL') + `\n${error.message}`);
            allPassed = false;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n----------------------------------------');
    if (allPassed) {
        console.log(chalk.bold.green('🎉 TOUS LES 10 AGENTS PASSENT !'));
    } else {
        console.log(chalk.bold.red('🚨 Certains agents ont échoué. Vérifiez les logs.'));
        process.exit(1);
    }
}

run();
