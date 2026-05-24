const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
  name: 'sorteio',

  async execute(message, args, client, config) {
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('❌ Você não tem permissão.');
    }

    const tempo = args[0];
    const premio = args.slice(1).join(' ');

    if (!tempo || !premio) {
      return message.reply('Use: !sorteio 10m prêmio');
    }

    const duracao = ms(tempo);
    if (!duracao) return message.reply('❌ Tempo inválido. Ex: 10m, 1h, 1d');

    const participantes = new Set();

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 SORTEIO')
      .setDescription(`🎁 Prêmio: **${premio}**\n⏰ Tempo: **${tempo}**\n\nClique no botão para participar!`)
      .setFooter({ text: 'Cidade de Deus Roleplay' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('participar_sorteio')
        .setLabel('Participar')
        .setEmoji('🎉')
        .setStyle(ButtonStyle.Success)
    );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: duracao });

    collector.on('collect', async interaction => {
      participantes.add(interaction.user.id);

      await interaction.reply({
        content: '✅ Você entrou no sorteio!',
        ephemeral: true
      });
    });

    collector.on('end', async () => {
      if (participantes.size === 0) {
        return message.channel.send('❌ Sorteio encerrado sem participantes.');
      }

      const lista = Array.from(participantes);
      const vencedor = lista[Math.floor(Math.random() * lista.length)];

      const embedFinal = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎉 SORTEIO ENCERRADO')
        .setDescription(`🎁 Prêmio: **${premio}**\n🏆 Vencedor: <@${vencedor}>`)
        .setTimestamp();

      await message.channel.send({ embeds: [embedFinal] });
    });
  }
};