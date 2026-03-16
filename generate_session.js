const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');

fs.ensureDirSync('./data'); // cria a pasta data se não existir

// Puppeteer com headless: false para abrir o navegador e mostrar QR code
const client = new Client({ puppeteer: { headless: false } });

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie este QR code com seu WhatsApp!');
});

client.on('authenticated', session => {
    fs.writeJsonSync('./data/session.json', session, { spaces: 2 });
    console.log('✅ session.json criado com sucesso!');
});

client.on('ready', () => {
    console.log('🤖 Bot conectado e pronto!');
});

client.initialize();