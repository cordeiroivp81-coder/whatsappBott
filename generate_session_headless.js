const { Client } = require('whatsapp-web.js');
const fs = require('fs-extra');
const qrcode = require('qrcode-terminal');

fs.ensureDirSync('./data');

const client = new Client({ puppeteer: { headless: false } }); // abre navegador real

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie o QR code no navegador!');
});

client.on('authenticated', session => {
    fs.writeJsonSync('./data/session.json', session, { spaces: 2 });
    console.log('✅ session.json criado com sucesso!');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('ready', () => {
    console.log('🤖 Bot pronto!');
});

client.initialize();