import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputPath = path.resolve("docs/socket-architecture.pdf");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const doc = new PDFDocument({
  margin: 48,
  size: "A4",
  info: {
    Title: "Architecture Socket - APP2 Backend",
    Author: "APP2",
    Subject: "Explication de la couche Socket.IO",
  },
});

doc.pipe(fs.createWriteStream(outputPath));

const title = "APP2 Backend - Explication de la Partie Socket";
const dateStr = new Date().toISOString().slice(0, 10);

const h1 = (text) => {
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(16).text(text);
  doc.moveDown(0.3);
};

const h2 = (text) => {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(13).text(text);
  doc.moveDown(0.2);
};

const p = (text) => {
  doc.font("Helvetica").fontSize(11).text(text, { lineGap: 3 });
  doc.moveDown(0.2);
};

const bullet = (text) => {
  doc.font("Helvetica").fontSize(11).text(`- ${text}`, { indent: 10, lineGap: 2 });
};

doc.font("Helvetica-Bold").fontSize(20).text(title);
doc.moveDown(0.2);
doc.font("Helvetica").fontSize(10).text(`Date: ${dateStr}`);
doc.moveDown(1.0);

h1("1. Vue d'ensemble");
p("Le backend utilise Socket.IO pour gerer le temps reel. Les handlers sont separes par domaine metier, ce qui rend le code plus lisible et maintenable.");
bullet("userSocket.js: presence utilisateur (online/offline)");
bullet("chatSocket.js: messages de chat, reception, lecture, livraison");
bullet("itemSocket.js: abonnements et diffusion des changements de shop items");
bullet("videoSocket.js: mises a jour likes/views en live");

h1("2. Point d'entree Socket");
p("Le branchement principal est dans server.js. A chaque nouvelle connexion, le serveur enregistre les 4 handlers. Ainsi, chaque client recoit les events de tous les domaines sans dupliquer la logique.");
bullet("app.set('io', io) permet aux controllers REST d'emettre des events socket");
bullet("io.on('connection', socket => ...) branche user/chat/item/video");

h1("3. userSocket.js");
h2("Role");
p("Gerer la presence utilisateur en temps reel.");
h2("Events ecoutes");
bullet("user_connected: ajoute l'utilisateur dans onlineUsers, met a jour son statut en base, puis emet user_status_update:online");
bullet("disconnect: retire l'utilisateur de onlineUsers, met a jour status offline + lastSeen, puis emet user_status_update:offline");
h2("Event emis");
bullet("user_status_update { userId, status, socketId? }");

h1("4. chatSocket.js");
h2("Role");
p("Gerer les messages de chat et les etats delivered/read en temps reel.");
h2("Events ecoutes");
bullet("chat_join_room { sender, receiver }");
bullet("chat_get_messages { chatRoomId }");
bullet("chat_send_message { sender, receiver, message }");
bullet("chat_mark_delivered { messageId }");
bullet("chat_mark_read { messageId }");
h2("Events emis");
bullet("chat_new_message");
bullet("chat_message_received");
bullet("chat_message_delivered");
bullet("chat_message_read");
h2("Details techniques");
bullet("Utilise getRoomId(sender, receiver) pour un identifiant de room stable");
bullet("Utilise onlineUsers pour notifier directement le receiver connecte");

h1("5. itemSocket.js");
h2("Role");
p("Diffuser les changements de shop items (creation/suppression) et permettre l'abonnement par type d'item.");
h2("Events ecoutes");
bullet("item_subscribe { itemType }");
bullet("item_unsubscribe { itemType }");
bullet("item_created { itemType, ... }");
bullet("item_deleted { itemType, ... }");
h2("Events emis");
bullet("new_item (global)");
bullet("delete_item (global)");
bullet("item_created (room items:<itemType>)");
bullet("item_deleted (room items:<itemType>)");

h1("6. videoSocket.js");
h2("Role");
p("Diffuser en live les likes et les vues des videos.");
h2("Events ecoutes");
bullet("video_subscribe { videoId }");
bullet("video_unsubscribe { videoId }");
bullet("video_liked { videoId, likes }");
bullet("video_played { videoId, views }");
h2("Events emis");
bullet("video_like_updated (room video:<videoId>)");
bullet("video_views_updated (room video:<videoId>)");

h1("7. Bonnes pratiques d'utilisation (frontend)");
bullet("Se connecter au socket apres authentification");
bullet("S'abonner aux rooms necessaires (chat, item type, video id)");
bullet("Desabonner a la fermeture d'ecran");
bullet("Toujours traiter les callbacks success/error");
bullet("Ne pas faire confiance uniquement au socket: garder REST comme source de verite");

h1("8. Sequence type");
h2("A. Chat");
bullet("Client A et B: chat_join_room");
bullet("Client A: chat_send_message");
bullet("Serveur: persiste le message puis emit chat_new_message");
bullet("Client B: emit chat_mark_delivered puis chat_mark_read");
h2("B. Item");
bullet("Client: item_subscribe (itemType=avatar)");
bullet("REST create/delete item -> serveur emit new_item/delete_item");
bullet("Serveur socket relaie vers room items:avatar");

h1("9. Checklist de debug");
bullet("Verifier la connexion socket (event connection)");
bullet("Verifier le nom exact des events cote client/serveur");
bullet("Verifier les payloads requis (messageId, videoId, itemType...)");
bullet("Verifier les rooms (join/leave)");
bullet("Verifier les erreurs backend (logs serveur)");

doc.moveDown(1.2);
doc.font("Helvetica-Oblique").fontSize(9).text("Document genere automatiquement depuis le workspace APP2.");

doc.end();
