const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require('@discordjs/voice');

const ytdl = require('@distube/ytdl-core');

module.exports = {
  name: 'play',

  async execute(message, args) {

    const url = args[0];

    if (!url) {
      return message.reply('❌ Envie um link.');
    }

    const canal = message.member.voice.channel;

    if (!canal) {
      return message.reply('❌ Entre em uma call.');
    }

    try {

      const connection = joinVoiceChannel({
        channelId: canal.id,
        guildId: canal.guild.id,
        adapterCreator: canal.guild.voiceAdapterCreator
      });

      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });

      const resource = createAudioResource(stream);

      const player = createAudioPlayer();

      connection.subscribe(player);

      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => {

        message.reply('🎵 Música tocando.');
      });

      player.on('error', error => {

        console.log(error);

        message.reply('❌ Erro ao tocar música.');
      });

    } catch (err) {

      console.log(err);

      message.reply('❌ Não consegui tocar essa música.');
    }
  }
};