import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import pkgqr from "qrcode-terminal";
const { qrcode } = pkgqr;
import { postWarningByNum } from "./middleware/middlewareWarning.js";

import { nomeDoGrupo } from "./config.js";

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Escaneie o QR Code acima com seu WhatsApp:");
});

client.on("ready", () => {
  console.log("O Bot está online e pronto!");
});

client.on("message", async (msg) => {
  if (msg.from.endsWith("@g.us")) {
    const chat = await msg.getChat();

    if (chat.name != nomeDoGrupo) {
      return;
    }

    if (msg.type === "chat") {
      const contact = await msg.getContact();

      const authorId = msg.author || msg.from;

      try {
        await msg.delete(true);
        console.log(
          `Mensagem de ${contact.pushname} deletada por violar as regras.`,
        );
      } catch (deleteErr) {
        console.error(
          "Não foi possível apagar a mensagem. O bot é admin?",
          deleteErr,
        );
      }

      try {
        const contact = await msg.getContact();

        const res = await postWarningByNum(contact.number.toString());

        if (res.message === "Membro banido") {
          await chat.removeParticipants([authorId]);
          await client.sendMessage(
            authorId,
            `*NOTIFICAÇÃO DE REMOÇÃO* ❌

Olá, informamos que você atingiu o limite máximo de avisos (*5/5*) no grupo *${chat.name}*.

Devido ao descumprimento das regras de convivência, sua conta foi removida automaticamente pelo sistema.`,
          );
          const mensagemGrupo = [
            `📢 *AVISO DA ADMINISTRAÇÃO*`,
            `--------------------------------------------`,
            `Um usuário foi removido por não seguir a regra de *interação exclusiva via áudio*.`,
            ``,
            `Respeite as diretrizes para manter a harmonia do grupo.`,
            `_Monitoramento Automático Ativo_`,
          ].join("\n");

          // Para enviar no grupo logo após o banimento:
          await client.sendMessage(msg.from, mensagemGrupo);
          return;
        }

        if (res.message == "OnList") {
          console.log("Mensagem de Administrador...");
          return;
        }

        await client.sendMessage(
          authorId,
          `*SISTEMA DE MONITORAMENTO AUTOMÁTICO* 🤖

Olá, *${contact.pushname || "Participante"}*! 

Identificamos o envio de uma mensagem de texto no grupo *${chat.name}*. 
Conforme as regras, a interação permitida é exclusivamente através de áudios (assobios).

⚠️ *AVISO:* ${res.warnings}/5
_Evite novas mensagens de texto para não ser removido automaticamente._`,
        );

        console.log(`Resposta enviada no privado para ${contact.pushname}`);
      } catch (err) {
        console.error("Erro ao enviar mensagem no privado:", err);
      }
    }
  }
});

client.initialize();
