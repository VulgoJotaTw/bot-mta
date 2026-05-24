const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'stop',

  async execute(message) {

    const connection = getVoiceConnection(message.guild.id);

    if (!connection) {
      return message.reply('❌ Não estou em call.');
    }

    connection.destroy();

    message.reply('⏹️ Música parada.');
  }
};