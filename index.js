require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;
const serverIP = process.env.SERVER_IP;
const bedrockPort = process.env.BEDROCK_PORT;
const statusChannelId = process.env.STATUS_CHANNEL;

let statusMessage = null;

// ================= READY =================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // تحديث كل 6 ثواني (أثبت من 3 ثواني عشان ما يحصلش rate limit)
  setInterval(updateStatus, 6000);
});

// ================= IP COMMAND =================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "ip") {
    try {
      const res = await axios.get(`https://api.mcsrvstat.us/2/${serverIP}`);

      const online = res.data?.online ? "🟢 Online" : "🔴 Offline";
      const players = res.data?.players?.online || 0;
      const max = res.data?.players?.max || 0;

      const embed = new EmbedBuilder()
        .setTitle("~ AURA MC SERVER")
        .setColor("#00ffcc")
        .setDescription(
`||================||

## 🧩 Java Edition IP
\`\`\`
${serverIP}
\`\`\`

||================||

## 📟 Bedrock Edition IP
\`\`\`
${serverIP}
Port: ${bedrockPort}
\`\`\`

||================||

• الحالة | Status
${online}

• اللاعبين | Players
🌐 ${players}/${max}

• الإصدار | Version
🔧 1.8 - 1.21.11`
        );

      message.reply({ embeds: [embed] });

    } catch (err) {
      console.log(err);
      message.reply("❌ السيرفر فيه مشكلة أو Offline");
    }
  }
});

// ================= STATUS SYSTEM =================
async function updateStatus() {
  try {
    const res = await axios.get(`https://api.mcsrvstat.us/2/${serverIP}`);

    const online = res.data?.online ? "🟢 Online" : "🔴 Offline";
    const players = res.data?.players?.online || 0;
    const max = res.data?.players?.max || 0;

    const channel = await client.channels.fetch(statusChannelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("~ AURA MC SERVER")
      .setColor(res.data?.online ? "#00ffcc" : "#ff0000")
      .setDescription(
`||================||

## 🧩 Java Edition IP
\`\`\`
${serverIP}
\`\`\`

||================||

## 📟 Bedrock Edition IP
\`\`\`
${serverIP}
Port: ${bedrockPort}
\`\`\`

||================||

• الحالة | Status
${online}

• اللاعبين | Players
🌐 ${players}/${max}

• الإصدار | Version
🔧 1.8 - 1.21.11`
      );

    if (!statusMessage) {
      statusMessage = await channel.send({ embeds: [embed] });
    } else {
      await statusMessage.edit({ embeds: [embed] });
    }

  } catch (err) {
    console.log("Status update error:", err.message);
  }
}

// ================= LOGIN =================
client.login(TOKEN);