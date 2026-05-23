const { EmbedBuilder } = require('discord.js');
const Gamedig = require('gamedig');

module.exports = {
  name: 'status',

  async execute(message, args, client, config) {

    try {

      const state = await Gamedig.query({
        type: 'mta',
        host: config.mtaIp,
        port: config.mtaPort
      });

      const playersOnline = state.players?.length || 0;
      const maxPlayers = state.maxplayers || '?';

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🟢 CIDADE DE DEUS ROLEPLAY')
        .setDescription('Servidor online e funcionando.')
        .addFields(
          {
            name: '👥 Players Online',
            value: `${playersOnline}/${maxPlayers}`,
            inline: true
          },
          {
            name: '📌 IP',
            value: `mtasa://${config.mtaIp}:${config.mtaPort}`,
            inline: true
          },
          {
            name: '🎮 Status',
            value: 'Online',
            inline: true
          }
        )
        .setFooter({ text: 'Cidade de Deus Roleplay' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (error) {

      console.error(error);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔴 CIDADE DE DEUS ROLEPLAY')
        .setDescription('Não consegui consultar o servidor MTA.')
        .addFields(
          {
            name: '📌 IP',
            value: `mtasa://${config.mtaIp}:${config.mtaPort}`
          },
          {
            name: '⚠️ Status',
            value: 'Offline ou indisponível'
          }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    }
  }
};