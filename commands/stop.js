module.exports = {
  name: 'stop',

  async execute(message) {
    const connection = message.guild.members.me.voice.channel;

    if (!connection) {
      return message.reply('❌ Não estou em uma call.');
    }

    message.guild.members.me.voice.disconnect();
    message.reply('⏹️ Música parada.');
  }
};