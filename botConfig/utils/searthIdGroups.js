//client.on("message", async (msg) => {
//   if (msg.from.endsWith("@g.us")) {
//     const chat = await msg.getChat();

//     const authorId = msg.author || msg.from;

//     const ehGrupoOficial = linksDosGrupos.some(
//       (grupo) => grupo.name === chat.name,
//     );

//     if (!ehGrupoOficial) {
//       return;
//     }

//     // if (chat.id._serialized === "120363427838237804@g.us") {
//     //   console.log("aqui EH o Porteiro", msg.from);
//     //   msg.reply("ENTRA NO GRUPO");
//     // }

//     if (chat.isGroup) {
//       console.log(`--- DADOS DO GRUPO ---`);
//       console.log(`Nome: ${chat.name}`);
//       console.log(`ID: ${chat.id._serialized}`);
//       console.log(`----------------------`);

//       // await msg.reply(`O ID deste grupo é: ${chat.id._serialized}`);
//     }
//   }
// });
