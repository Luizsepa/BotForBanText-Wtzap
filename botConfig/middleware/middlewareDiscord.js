import { dicordUrls } from "../config.js";
export async function discordBan(banido) {
  try {
    await fetch(dicordUrls.urlWebhook.BotBan, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: null,
        embeds: [
          {
            title: "🔨 Ação de Moderador Automático",
            description:
              "Um usuário foi removido automaticamente por descumprir as regras do grupo.",
            color: 13311,
            fields: [
              {
                name: "Nome:",
                value: banido.name,
              },
              {
                name: "Número:",
                value: banido.num,
              },
              {
                name: "Data:",
                value: banido.date,
              },
            ],
            footer: {
              text: "Bans Assobios Unicesumar",
              icon_url: dicordUrls.urlImageFooter,
            },
            timestamp: new Date(),
          },
        ],
        attachments: [],
      }),
    });
  } catch (error) {
    console.log(error);
  }
}
export async function discordWarnings(user) {
  try {
    await fetch(dicordUrls.urlWebhook.BotWarnings, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: null,
        embeds: [
          {
            title: "🔨 Ação de Moderador Automático",
            description: "Um usuário tomou Warning.",
            color: 12716297,
            fields: [
              {
                name: "Nome:",
                value: user.name,
              },
              {
                name: "Número:",
                value: user.num,
              },
              {
                name: "Warnings:",
                value: user.warnings,
              },
              {
                name: "Data:",
                value: user.date,
              },
            ],
            footer: {
              text: "Bans Assobios Unicesumar",
              icon_url: dicordUrls.urlImageFooter,
            },
            timestamp: new Date(),
          },
        ],
        attachments: [],
      }),
    });
  } catch (error) {
    console.log(error);
  }
}
