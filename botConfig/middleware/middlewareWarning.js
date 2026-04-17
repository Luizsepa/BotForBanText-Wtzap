import fs from "fs/promises";
import dayjs from "dayjs";
import path from "path";
import { fileURLToPath } from "url";

import { dicordUrls, listNumsPermission } from "../config.js";
import { discordBan, discordWarnings } from "./middlewareDiscord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../db.json");

export async function postWarningByNum(contact) {
  const res = await fs.readFile(dbPath, "utf-8");

  let ObjDb = JSON.parse(res);

  const OnList = listNumsPermission.find((obj) => obj.num == contact.number);

  if (OnList) {
    return { message: "OnList" };
  }

  const [ban] = ObjDb.bans.filter((obj) => obj.num == contact.number);

  if (ban) {
    console.log(`${(ban.name, ban.num)} - BANIDO`);
    return { message: "Membro banido" };
  }

  const [exist] = ObjDb.warnings.filter((obj) => obj.num == contact.number);

  if (exist) {
    exist.warnings += 1;
    console.log("Exist:", exist);

    const warningsForDiscord = {
      name: exist.name,
      num: exist.num,
      warnings: exist.warnings,
      date: dayjs(new Date()).format("DD/MM/YYYY - HH:mm"),
    };

    await discordWarnings(warningsForDiscord);

    if (exist.warnings >= 5) {
      console.log(`Banindo ${(exist.name, exist.num)} por excesso de avisos.`);

      const banido = {
        name: exist.name,
        num: exist.num,
        date: dayjs(new Date()).format("DD/MM/YYYY - HH:mm"),
      };

      ObjDb.bans.push(banido);
      ObjDb.warnings = ObjDb.warnings.filter(
        (obj) => obj.num !== contact.number,
      );

      await discordBan(banido);

      await fs.writeFile(dbPath, JSON.stringify(ObjDb, null, 2));

      return { message: "Membro banido" };
    }

    await fs.writeFile(dbPath, JSON.stringify(ObjDb, null, 2));

    // console.log(exist);

    return exist;
  }

  const user = {
    name: contact.name,
    num: contact.number,
    warnings: 1,
  };

  ObjDb.warnings.push(user);

  await fs.writeFile(dbPath, JSON.stringify(ObjDb, null, 2));

  // console.log(res, ObjDb);

  return user;
}
