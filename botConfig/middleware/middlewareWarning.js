import fs from "fs/promises";
import { json } from "stream/consumers";
import dayjs from "dayjs";

import { dicordUrls, listNumsPermission } from "../config.js";

const mensagemDiscord = {
  content: null,
  embeds: [
    {
      title: "🔨 Ação de Moderador Automático",
      description:
        "Um usuário foi removido automaticamente por descumprir as regras do grupo.",
      color: 13311,
      fields: [
        {
          name: "Número:",
          value: "a",
          inline: true,
        },
        {
          name: "Data:",
          value: "a",
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
};

export async function postWarningByNum(num) {
  const res = await fs.readFile(
    "C:/code/BotAssobio/botConfig/db.json",
    "utf-8",
  );

  let ObjDb = JSON.parse(res);

  const OnList = listNumsPermission.find((obj) => obj.num == num);
  if (OnList) {
    return { message: "OnList" };
  }

  const [ban] = ObjDb.bans.filter((obj) => obj.num == num);

  if (ban) {
    console.log(`${ban.num} - BANIDO`);
    return { message: "Membro banido" };
  }

  const [exist] = ObjDb.warnings.filter((obj) => obj.num == num);

  if (exist) {
    exist.warnings += 1;
    console.log(exist);

    if (exist.warnings >= 5) {
      console.log(`Banindo ${num} por excesso de avisos.`);

      const banido = {
        num: exist.num,
        date: dayjs(new Date()).format("DD/MM/YYYY - HH:mm"),
      };

      ObjDb.bans.push(banido);
      ObjDb.warnings = ObjDb.warnings.filter((obj) => obj.num !== num);
      await fetch(dicordUrls.urlWebhook, {
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
                  name: "Número:",
                  value: banido.num,
                  inline: true,
                },
                {
                  name: "Data:",
                  value: banido.date,
                  inline: true,
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

      await fs.writeFile(
        "C:/code/BotAssobio/botConfig/db.json",
        JSON.stringify(ObjDb, null, 2),
      );

      return { message: "Membro banido" };
    }

    await fs.writeFile(
      "C:/code/BotAssobio/botConfig/db.json",
      JSON.stringify(ObjDb, null, 2),
    );

    // console.log(exist);

    return exist;
  }

  const user = {
    num: num,
    warnings: 1,
  };

  ObjDb.warnings.push(user);

  await fs.writeFile(
    "C:/code/BotAssobio/botConfig/db.json",
    JSON.stringify(ObjDb, null, 2),
  );

  // console.log(res, ObjDb);

  return user;
}

async function test(num) {
  const res = await postWarningByNum(num);
}
