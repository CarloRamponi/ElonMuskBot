const fs = require('fs');
const Telegraf = require('telegraf');
const JsonDB = require('node-json-db').JsonDB;

//const bot = new Telegraf(); //file bot_token should contain the telegram bot token provided by bot father
const bot_token = process.env.BOT_TOKEN;
const bot = new Telegraf(bot_token); //file bot_token should contain the telegram bot token provided by bot father

var db = new JsonDB("db", true, true);

bot.on("text", (ctx) => {
  if(ctx.message.from.id === 364820222 || ctx.message.from.id === 851284972 /*|| ctx.message.from.id === 117485384*/) {
    if(isCensured(ctx.message.from.id)) {
      ctx.deleteMessage();
    } else {
      if(ctx.message.text.toLocaleLowerCase().includes("tesla")) {
        var num = getNumOfTeslaAndIncrement(ctx.message.from.id);
        if(num <= 3) {
          if(num === 1) {
            ctx.reply("Stai ben attento! Se pronuncerai la parola proibita per più di 3 volte orribili cose succederanno!")
          } else {
            ctx.reply("Auch! Hai pronunciato la parola proibita per ben " + num + " volte! Manca poco!");
          }
        } else {
          ctx.reply("\"Uomo avvisato, mezzo salvato\"\nSei sottoposto a censura per 10m");
          censura(ctx.message.from.id);
        }
      }
    }
  }
})

bot.startPolling();

function getNumOfTeslaAndIncrement(id) {
  var tesla = 1;
  try {
    var data = db.getData("/users/"+id+"/tesla");
    tesla = data + 1;
    db.push("/users/"+id+"/tesla", tesla);
  } catch(e) {
    db.push("/users/"+id+"/tesla", 1);
  }
  return tesla;
}

function censura(id) {
  db.push("/users/"+id+"/censura", Date.now());
  db.push("/users/"+id+"/tesla", 0);
}

function isCensured(id) {
  try {
    var data = db.getData("/users/"+id+"/censura");
    if(Date.now() - data < 10*60*1000) { //10m
      return true;
    }
  } catch (e) {
    db.push("/users/"+id+"/censura", 0);
  }
  return false;
}
