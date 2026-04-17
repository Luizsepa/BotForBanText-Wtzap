import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import pkgqr from "qrcode-terminal";
const { qrcode, generate } = pkgqr;
import { postWarningByNum } from "./middleware/middlewareWarning.js";

import { isLinux, linksDosGrupos } from "./config.js";

console.log(isLinux ? "ESTA NO LINUX" : "WINDOWS");

const puppeteerOptions = isLinux
  ? {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    }
  : {};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: puppeteerOptions,
});

client.on("qr", (qr) => {
  console.log(
    "Escaneie o QR Code abaixo com seu WhatsApp: (ou gere o codigo)",
    qr,
  );
  generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("O Bot está online e pronto!");
});

client.on("message", async (msg) => {
  if (msg.from.endsWith("@g.us")) {
    const chat = await msg.getChat();

    const ehGrupoOficial = linksDosGrupos.some(
      (grupo) => grupo.name === chat.name,
    );

    if (!ehGrupoOficial) {
      return;
    }

    if (msg.type === "chat") {
      const contact = await msg.getContact();

      const authorId = msg.author || msg.from;

      try {
        const contact = await msg.getContact();
        const res = await postWarningByNum(contact);

        if (res.message == "OnList") {
          console.log("Mensagem de Administrador...");
          return;
        }

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

        if (res.message === "Membro banido") {
          await chat.removeParticipants([authorId]);
          await client.sendMessage(
            authorId,
            `*NOTIFICAÇÃO DE REMOÇÃO* ❌

Olá, informamos que você atingiu o limite máximo de avisos (*5/5*) no grupo *${chat.name}*.

Devido ao descumprimento das regras de convivência, sua conta foi removida automaticamente pelo sistema.`,
          );
          // const mensagemGrupo = [
          //   `📢 *AVISO DA ADMINISTRAÇÃO*`,
          //   `--------------------------------------------`,
          //   `Um usuário foi removido por não seguir a regra de *interação exclusiva via áudio*.`,
          //   ``,
          //   `Respeite as diretrizes para manter a harmonia do grupo.`,
          //   `_Monitoramento Automático Ativo_`,
          // ].join("\n");

          // // Para enviar no grupo logo após o banimento:
          // await client.sendMessage(msg.from, mensagemGrupo);
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

client.on("group_join", async (notification) => {
  if (notification.chatId === "120363427838237804@g.us") {
    const chat = await notification.getChat();
    const contact = await client.getContactById(notification.recipientIds[0]);

    console.log(`[Portaria] ${contact.pushname || "Usuário"} entrou.`);

    setTimeout(async () => {
      try {
        let grupoPraEnviar = {
          nomeDoGrupo: "",
          linkParaEnviar: "",
        };

        for (const grupo of linksDosGrupos) {
          const grupoChat = await client.getChatById(grupo.id);
          if (grupoChat.participants.length < 1000) {
            grupoPraEnviar.nomeDoGrupo = grupo.name;
            grupoPraEnviar.linkParaEnviar = grupo.link;
            break;
          }
        }

        if (!grupoPraEnviar.linkParaEnviar) {
          console.log("Aviso: Todos os grupos estão lotados!");
          await chat.sendMessage(
            "No momento, todos nossos grupos estao lotados, estamos trabalhando nisso",
          );
          return;
        }

        await chat.sendMessage(
          `Olá, @${contact.id.user}! 👋\n\n` +
            `Bem-vindo à nossa comunidade! Este grupo é apenas para recepção.\n\n` +
            `👉 *ENTRE NO GRUPO OFICIAL:* \n` +
            `📍 *${grupoPraEnviar.nomeDoGrupo}*\n` +
            `🔗 ${grupoPraEnviar.linkParaEnviar}\n\n` +
            `⚠️ *Importante:* Leia as regras no grupo principal.\n\n` +
            `🧹 *Aviso de Fluxo:* Para liberarmos espaço para novos membros, você será removido(a) desta portaria em 60 segundos. O link acima continuará disponível para você!`,
          { mentions: [contact.id._serialized] },
        );

        setTimeout(async () => {
          try {
            await chat.removeParticipants([contact.id._serialized]);
            // console.log(`${contact.name} foi removido por Fluxo`);
          } catch (err) {
            console.log("Não consegui remover, talvez já tenha saído.");
          }
        }, 60000);
      } catch (error) {
        console.error("Erro interno no porteiro de remover a pessoa:", error);
      }
    }, 1000);
  }
});

client.initialize();
