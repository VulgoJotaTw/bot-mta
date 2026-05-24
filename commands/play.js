const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  name: 'play',

  async execute(message, args) {
    const url = args[0];

    if (!url) return message.reply('Use: !play link_da_musica');

    const canalVoz = message.member.voice.channel;
    if (!canalVoz) return message.reply('❌ Entre em uma call primeiro.');

    const connection = joinVoiceChannel({
      channelId: canalVoz.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();

    try {
      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply('🎵 Tocando música agora.');
    } catch (error) {
      console.error(error);
      message.reply('❌ Não consegui tocar essa música.');
    }
  }
};