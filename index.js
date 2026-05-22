require('dotenv').config();

const fs = require('fs');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

function logEmbed(guild, title, description) {
  const channel = guild.channels.cache.get(config.logsChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  channel.send({ embeds: [embed] });
}

async function criarPainelWhitelist() {
  const canal = await client.channels.fetch(config.painelWhitelistChannelId).catch(() => null);
  if (!canal) return console.log('❌ Canal de painel whitelist não encontrado.');

  const mensagens = await canal.messages.fetch({ limit: 10 });

  const jaExiste = mensagens.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title?.includes('Whitelist')
  );

  if (jaExiste) return;

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

  await canal.send({ embeds: [embed], components: [row] });
  console.log('✅ Painel de whitelist criado.');
}

async function criarPainelTicket() {
  const canal = await client.channels.fetch(config.painelTicketChannelId).catch(() => null);
  if (!canal) return console.log('❌ Canal de painel ticket não encontrado.');

  const mensagens = await canal.messages.fetch({ limit: 10 });

  const jaExiste = mensagens.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title?.includes('Suporte')
  );

  if (jaExiste) return;

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎫 Suporte Cidade de Deus RP')
    .setDescription('Precisa de ajuda? Clique no botão abaixo para abrir um ticket com a staff.')
    .setFooter({ text: 'Cidade de Deus Roleplay' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('abrir_ticket')
      .setLabel('Abrir Ticket')
      .setStyle(ButtonStyle.Primary)
  );

  await canal.send({ embeds: [embed], components: [row] });
  console.log('✅ Painel de ticket criado.');
}

client.once('ready', async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);

  await criarPainelWhitelist();
  await criarPainelTicket();
});

client.on('guildMemberAdd', async member => {
  const role = member.guild.roles.cache.get(config.autoRoleId);
  if (role) await member.roles.add(role).catch(() => {});
  logEmbed(member.guild, '👋 Novo membro', `${member.user} entrou no servidor.`);
});

client.on('messageDelete', message => {
  if (!message.guild || message.author?.bot) return;
  logEmbed(
    message.guild,
    '🗑️ Mensagem apagada',
    `Autor: ${message.author}\nCanal: ${message.channel}\nMensagem: ${message.content || 'Sem conteúdo'}`
  );
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client, config);
  } catch (error) {
    console.error(error);
    message.reply('❌ Erro ao executar comando.');
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'abrir_ticket') {
      const guild = interaction.guild;

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: config.ticketCategoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: config.staffRoleId,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎫 Ticket aberto')
        .setDescription(`${interaction.user}, aguarde a staff te atender.`)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('fechar_ticket')
          .setLabel('Fechar Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });

      logEmbed(guild, '🎫 Ticket criado', `${interaction.user} abriu um ticket.`);
    }

    if (interaction.customId === 'fechar_ticket') {
      await interaction.reply('🔒 Ticket será fechado em 5 segundos.');
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.customId === 'abrir_whitelist') {
      const modal = new ModalBuilder()
        .setCustomId('form_whitelist')
        .setTitle('Whitelist Cidade de Deus RP');

      const nome = new TextInputBuilder()
        .setCustomId('nome')
        .setLabel('Nome e idade')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const rp = new TextInputBuilder()
        .setCustomId('rp')
        .setLabel('Explique o que é RP')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const historia = new TextInputBuilder()
        .setCustomId('historia')
        .setLabel('História do seu personagem')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome),
        new ActionRowBuilder().addComponents(rp),
        new ActionRowBuilder().addComponents(historia)
      );

      await interaction.showModal(modal);
    }

    if (interaction.customId.startsWith('aprovar_')) {
      const userId = interaction.customId.split('_')[1];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);

      if (member) {
        await member.roles.add(config.approvedRoleId).catch(() => {});
      }

      await interaction.update({ content: '✅ Whitelist aprovada.', components: [] });
      logEmbed(interaction.guild, '✅ Whitelist aprovada', `Usuário aprovado: <@${userId}>`);
    }

    if (interaction.customId.startsWith('reprovar_')) {
      const userId = interaction.customId.split('_')[1];
      await interaction.update({ content: '❌ Whitelist reprovada.', components: [] });
      logEmbed(interaction.guild, '❌ Whitelist reprovada', `Usuário reprovado: <@${userId}>`);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'form_whitelist') {
      const nome = interaction.fields.getTextInputValue('nome');
      const rp = interaction.fields.getTextInputValue('rp');
      const historia = interaction.fields.getTextInputValue('historia');

      const canal = interaction.guild.channels.cache.get(config.whitelistChannelId);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📋 Nova Whitelist')
        .addFields(
          { name: '👤 Usuário', value: `${interaction.user}` },
          { name: '📌 Nome/Idade', value: nome },
          { name: '🎭 O que é RP?', value: rp },
          { name: '📖 História', value: historia }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aprovar_${interaction.user.id}`)
          .setLabel('Aprovar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reprovar_${interaction.user.id}`)
          .setLabel('Reprovar')
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Sua whitelist foi enviada para análise.', ephemeral: true });
    }
  }
});

const token = process.env.TOKEN?.trim();

client.login(token);