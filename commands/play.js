const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require('@discordjs/voice');

const play = require('play-dl');

module.exports = {
  name: 'play',

  async execute(message, args) {
    const url = args[0];

    if (!url) return message.reply('❌ Use: !play link_do_youtube');

    const canalVoz = message.member.voice.channel;
    if (!canalVoz) return message.reply('❌ Entre em uma call primeiro.');

    try {
      const connection = joinVoiceChannel({
        channelId: canalVoz.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play
        }
      });

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => {
        message.reply('🎵 Tocando música agora.');
      });

      player.on('error', error => {
        console.error('Erro no player:', error);
        message.reply('❌ Erro ao tocar música.');
      });

    } catch (error) {
      console.error('Erro no play:', error);
      message.reply('❌ Não consegui tocar essa música.');
    }
  }
};