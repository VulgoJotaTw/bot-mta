const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'anuncio',
  async execute(message, args, client, config) {
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('❌ Você não tem permissão.');
    }

    const texto = args.join(' ');
    if (!texto) return message.reply('Use: !anuncio sua mensagem');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📢 Anúncio Oficial')
      .setDescription(texto)
      .setFooter({ text: 'Cidade de Deus Roleplay' })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
    message.delete().catch(() => {});
  }
};