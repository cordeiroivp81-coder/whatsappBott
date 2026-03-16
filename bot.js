// ------------------- bot.js -------------------
// Importa as bibliotecas necessárias
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa o cliente WhatsApp usando LocalAuth
// LocalAuth salva a sessão automaticamente, então você não precisa de session.json
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot_crm" }),
});

// Evento para mostrar QR code na primeira vez que rodar
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie este QR code com seu WhatsApp!');
});

// Evento quando o bot estiver pronto
client.on('ready', () => {
    console.log('🤖 Bot conectado e pronto! Ele irá rodar 24h automaticamente.');
});

// Evento para receber mensagens
client.on('message', message => {
    console.log(`Mensagem de ${message.from}: ${message.body}`);
    // Resposta automática para mensagens que contenham "oi"
    if(message.body.toLowerCase().includes('oi')){
        message.reply('Olá! Eu sou seu assistente de vendas 🤖');
    }
});

// Inicializa o cliente
client.initialize();
// ------------------- fim do bot.js -------------------