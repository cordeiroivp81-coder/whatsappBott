require("dotenv").config();

const fs = require("fs");
const express = require("express");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const axios = require("axios");

console.log("🚀 Iniciando BOT CRM WhatsApp...");

/* servidor */
const app = express();
const PORT = process.env.PORT || 3000;

/* link pagamento */
const linkPagamento = process.env.LINK_PAGAMENTO || "https://seulink.com";

let qrImage = "";

/* página QR */
app.get("/", (req, res) => {

  if (qrImage === "") {

    res.send("⏳ Aguardando QR Code...");

  } else {

    res.send(`
      <h2>Escaneie o QR Code</h2>
      <img src="${qrImage}" width="300"/>
    `);

  }

});

app.listen(PORT, () => {

  console.log("🌐 Servidor rodando na porta " + PORT);

});

/* evitar resposta repetida */
const ultimaResposta = {};

/* normalizar texto */
function normalizar(texto){

  return texto
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .replace(/[.,]/g,"")
  .trim()

}

/* buscar resposta produto.txt */

function buscarResposta(pergunta){

  if(!fs.existsSync("./produto.txt")) return null

  const texto = fs.readFileSync("./produto.txt","utf8")

  const frases = texto.split("\n")

  const palavrasPergunta = pergunta
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .split(" ")

  for(let frase of frases){

    const fraseLimpa = frase
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")

    for(let palavra of palavrasPergunta){

      if(palavra.length > 3 && fraseLimpa.includes(palavra)){

        return frase

      }

    }

  }

  return null

}

/* enviar mídia */

async function enviarMidia(message,caminho){

  try{

    if(!fs.existsSync(caminho)) return

    const media = MessageMedia.fromFilePath(caminho)

    await message.reply(media)

  }

  catch(erro){

    console.log("erro enviando midia",erro.message)

  }

}

/* cliente whatsapp */

let client

function iniciarCliente(){

client = new Client({

authStrategy:new LocalAuth({clientId:"crm_bot"}),

puppeteer:{
headless:true,
args:[
"--no-sandbox",
"--disable-setuid-sandbox",
"--disable-dev-shm-usage",
"--disable-gpu"
]
}

})

/* QR CODE */

client.on("qr",async(qr)=>{

console.log("📱 Escaneie o QR Code abaixo")

qrcodeTerminal.generate(qr,{small:true})

qrImage = await QRCode.toDataURL(qr)

})

/* conectado */

client.on("ready",()=>{

console.log("✅ WhatsApp conectado e pronto")

})

/* reconectar se cair */

client.on("disconnected",(motivo)=>{

console.log("⚠️ WhatsApp desconectado:",motivo)

client.destroy()

setTimeout(()=>{

iniciarCliente()

},5000)

})

/* mensagens */

client.on("message_create", async (message) => {

if (message.fromMe) return

const texto = normalizar(message.body || "")

const contato = await message.getContact()

const nome = contato.pushname || "cliente"

console.log("📩 mensagem:",texto,"| de:",message.from)

/* SAUDAÇÕES */

const saudacoes = [
"oi",
"ola",
"olá",
"bom dia",
"boa tarde",
"boa noite"
]

if(saudacoes.some(s=>texto.includes(normalizar(s)))){

const resposta = `Olá 👋

Tudo bem?

Seja bem vindo ${nome}

Posso te ajudar com informações sobre o produto 🙂`

if(ultimaResposta[message.from] !== resposta){

await message.reply(resposta)

ultimaResposta[message.from] = resposta

}

return

}

/* INTERESSE DO CLIENTE */

const palavrasInteresse = [

"valor",
"preco",
"preço",
"pix",
"comprar",
"quero comprar",
"como comprar",
"onde comprar",
"link",
"pagamento"

]

if(palavrasInteresse.some(p=>texto.includes(normalizar(p)))){

let respostaTexto=""

if(texto.includes("valor") || texto.includes("preco") || texto.includes("preço")){

respostaTexto=`O produto custa R$97 🙂

Garanta o seu aqui:

${linkPagamento}`

}

else if(texto.includes("pix")){

respostaTexto=`Você pode pagar por PIX ou cartão 🙂

Garanta seu pedido aqui:

${linkPagamento}`

}

else{

respostaTexto=`Perfeito 🙂

Você pode fazer o pedido diretamente neste link:

${linkPagamento}`

}

if(ultimaResposta[message.from] !== respostaTexto){

await message.reply(respostaTexto)

ultimaResposta[message.from] = respostaTexto

}

/* PROVA SOCIAL */

await enviarMidia(message,"./media/produto.jpg")

await enviarMidia(message,"./media/produto.mp4")

await enviarMidia(message,"./media/produto.mp3")

return

}

/* resposta produto.txt */

const resposta = buscarResposta(texto)

if(resposta){

if(ultimaResposta[message.from] === resposta){

return

}

await message.reply(resposta)

ultimaResposta[message.from] = resposta

}

else{

const respostaPadrao=`O produto custa R$97 🙂

Garanta o seu aqui:

${linkPagamento}`

if(ultimaResposta[message.from] === respostaPadrao){

return

}

await message.reply(respostaPadrao)

ultimaResposta[message.from] = respostaPadrao

}

})

console.log("🔄 Inicializando WhatsApp...")

client.initialize()

}

/* iniciar bot */

iniciarCliente()

/* manter online railway */

function manterOnline(){

const url = process.env.APP_URL || `http://localhost:${PORT}`

setInterval(async()=>{

try{

await axios.get(url)

console.log("🔄 ping keep-alive")

}

catch(erro){

console.log("erro ping",erro.message)

}

},5*60*1000)

}

manterOnline()