const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'painel',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎫 Suporte Cidade de Deus RP')
      .setDescription('Clique no botão abaixo para abrir um ticket com a staff.')
      .setFooter({ text: 'Cidade de Deus Roleplay' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_ticket')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
};