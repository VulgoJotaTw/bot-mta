module.exports = {
  name: 'punir',
  async execute(message, args, client, config) {
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('❌ Você não tem permissão.');
    }

    const user = message.mentions.members.first();
    const motivo = args.slice(1).join(' ') || 'Sem motivo informado';

    if (!user) return message.reply('Use: !punir @usuario motivo');

    await user.timeout(10 * 60 * 1000, motivo).catch(() => {
      return message.reply('❌ Não consegui punir esse usuário.');
    });

    message.channel.send(`⚠️ ${user} foi punido por 10 minutos.\nMotivo: ${motivo}`);
  }
};