const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'anuncio',

  async execute(message, args, client, config) {
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('❌ Você não tem permissão.');
    }

    const texto = args.join(' ');

    if (!texto) {
      return message.reply('Use: !anuncio sua mensagem');
    }

    const mencoesRoles = message.mentions.roles.map(role => role.id);
    const mencionaEveryone = message.mentions.everyone;

    const contentMencoes = [
      mencionaEveryone ? '@everyone' : '',
      ...message.mentions.roles.map(role => `<@&${role.id}>`)
    ].filter(Boolean).join(' ');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📢 Anúncio Oficial')
      .setDescription(texto)
      .setFooter({ text: 'Cidade de Deus Roleplay' })
      .setTimestamp();

    await message.channel.send({
      content: contentMencoes || null,
      embeds: [embed],
      allowedMentions: {
        parse: mencionaEveryone ? ['everyone'] : [],
        roles: mencoesRoles
      }
    });

    message.delete().catch(() => {});
  }
};