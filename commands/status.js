const { EmbedBuilder } = require('discord.js');
const Gamedig = require('gamedig');

module.exports = {
  name: 'status',
  async execute(message, args, client, config) {
    try {
      const state = await Gamedig.query({
        type: 'mtasa',
        host: config.mtaIp,
        port: config.mtaPort
      });

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🟢 Servidor Online')
        .addFields(
          { name: '🎮 Nome', value: state.name || 'Cidade de Deus RP' },
          { name: '👥 Players', value: `${state.players.length}/${state.maxplayers || '?'}` },
          { name: '📌 IP', value: `mtasa://${config.mtaIp}:${config.mtaPort}` }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔴 Servidor Offline')
        .setDescription('Não consegui consultar o servidor MTA no momento.')
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};