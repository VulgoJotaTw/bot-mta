const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'whitelist',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📋 Whitelist Cidade de Deus RP')
      .setDescription('Clique no botão abaixo para iniciar sua whitelist.')
      .setFooter({ text: 'Boa sorte!' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('abrir_whitelist')
        .setLabel('Fazer Whitelist')
        .setStyle(ButtonStyle.Success)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
};