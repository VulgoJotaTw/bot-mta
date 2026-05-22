module.exports = {
  name: 'clear',
  async execute(message, args, client, config) {
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('❌ Você não tem permissão.');
    }

    const quantidade = parseInt(args[0]);
    if (!quantidade || quantidade < 1 || quantidade > 100) {
      return message.reply('Use: !clear 10');
    }

    await message.channel.bulkDelete(quantidade, true);
    message.channel.send(`✅ ${quantidade} mensagens apagadas.`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 3000);
    });
  }
};