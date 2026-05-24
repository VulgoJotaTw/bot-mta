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
  ButtonStyle
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

  channel.send({ embeds: [embed] }).catch(() => {});
}

async function criarPainelWhitelist() {

  const canal = await client.channels.fetch(config.painelWhitelistChannelId).catch(() => null);

  if (!canal) return console.log('❌ Canal whitelist não encontrado.');

  const mensagens = await canal.messages.fetch({ limit: 20 }).catch(() => null);

  const jaExiste = mensagens.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title?.includes('Whitelist')
  );

  if (jaExiste) {
    await jaExiste.delete().catch(() => {});
  }

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

  await canal.send({
    embeds: [embed],
    components: [row]
  });

  console.log('✅ Painel whitelist criado.');
}

async function criarPainelTicket() {

  const canal = await client.channels.fetch(config.painelTicketChannelId).catch(() => null);

  if (!canal) return console.log('❌ Canal ticket não encontrado.');

  const mensagens = await canal.messages.fetch({ limit: 20 }).catch(() => null);

  const jaExiste = mensagens.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title?.includes('Central de Atendimento')
  );

  if (jaExiste) {
    await jaExiste.delete().catch(() => {});
  }

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎫 Central de Atendimento')
    .setDescription(`
🎫 Suporte
🚨 Denúncia
💰 Compras
🐞 Reportar Bug
    `)
    .setFooter({ text: 'Cidade de Deus Roleplay' });

  const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId('ticket_suporte')
      .setLabel('Suporte')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('ticket_denuncia')
      .setLabel('Denúncia')
      .setEmoji('🚨')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('ticket_compras')
      .setLabel('Compras')
      .setEmoji('💰')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('ticket_bug')
      .setLabel('Bug')
      .setEmoji('🐞')
      .setStyle(ButtonStyle.Secondary)
  );

  await canal.send({
    embeds: [embed],
    components: [row]
  });

  console.log('✅ Painel ticket criado.');
}

client.once('ready', async () => {

  console.log(`✅ Bot online como ${client.user.tag}`);

  await criarPainelWhitelist();
  await criarPainelTicket();
});

client.on('guildMemberAdd', async member => {

  const role = member.guild.roles.cache.get(config.autoRoleId);

  if (role) {
    await member.roles.add(role).catch(() => {});
  }

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

function getTicketData(customId) {

  if (customId === 'ticket_suporte') {
    return {
      categoria: config.ticketSuporteCategoryId,
      titulo: '🎫 Suporte',
      descricao: 'Descreva sua dúvida ou problema.',
      nome: 'suporte'
    };
  }

  if (customId === 'ticket_denuncia') {
    return {
      categoria: config.ticketDenunciaCategoryId,
      titulo: '🚨 Denúncia',
      descricao: 'Envie provas da denúncia.',
      nome: 'denuncia'
    };
  }

  if (customId === 'ticket_compras') {
    return {
      categoria: config.ticketComprasCategoryId,
      titulo: '💰 Compras',
      descricao: 'Informe o produto desejado.',
      nome: 'compras'
    };
  }

  if (customId === 'ticket_bug') {
    return {
      categoria: config.ticketBugCategoryId,
      titulo: '🐞 Reportar Bug',
      descricao: 'Explique o bug encontrado.',
      nome: 'bug'
    };
  }

  return null;
}

client.on('interactionCreate', async interaction => {

  if (!interaction.isButton()) return;

  const ticketData = getTicketData(interaction.customId);

  if (ticketData) {

    const guild = interaction.guild;

    const canal = await guild.channels.create({
      name: `${ticketData.nome}-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: ticketData.categoria,

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
      .setTitle(ticketData.titulo)
      .setDescription(`${interaction.user}\n\n${ticketData.descricao}`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('fechar_ticket')
        .setLabel('Fechar Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });

    logEmbed(guild, '🎫 Ticket criado', `${interaction.user} abriu um ticket.`);
  }

  if (interaction.customId === 'fechar_ticket') {

    await interaction.reply('🔒 Ticket será fechado em 5 segundos.');

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }

  if (interaction.customId === 'abrir_whitelist') {

    const guild = interaction.guild;

    const canal = await guild.channels.create({
      name: `whitelist-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: config.whitelistCategoryId,

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

    await interaction.reply({
      content: `✅ Sua whitelist foi criada: ${canal}`,
      ephemeral: true
    });

    const perguntas = [
      '👤 Qual seu nome e idade?',
      '🚫 O que é SAV?',
      '🔫 O que é RDM?',
      '🚗 O que é VDM?',
      '🌐 O que é CL?',
      '🏄 O que é Surf?',
      '🚘 O que é Car Jacking?',
      '🌑 O que é Dark RP?',
      '🛡️ Quais são as zonas safe?',
      '🎭 O que é Power Gaming?',
      '🧠 O que é Meta Gaming?',
      '📖 Conte a história do seu personagem.'
    ];

    const respostas = [];

    for (const pergunta of perguntas) {

      const embedPergunta = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📋 Whitelist Cidade de Deus RP')
        .setDescription(pergunta)
        .setFooter({ text: 'Você tem 5 minutos para responder.' });

      await canal.send({ embeds: [embedPergunta] });

      const coletor = canal.createMessageCollector({
        filter: m => m.author.id === interaction.user.id,
        max: 1,
        time: 300000
      });

      const resposta = await new Promise(resolve => {

        coletor.on('collect', m => {
          resolve(m.content);
        });

        coletor.on('end', collected => {
          if (collected.size === 0) {
            resolve('❌ Não respondeu.');
          }
        });
      });

      respostas.push({
        pergunta,
        resposta
      });
    }

    const canalStaff = await guild.channels.fetch(config.whitelistChannelId).catch(() => null);

    if (!canalStaff) {
      return canal.send('❌ Canal de análise não encontrado.');
    }

    const embedFinal = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📋 Nova Whitelist')
      .setDescription(`Usuário: ${interaction.user}`)
      .setTimestamp();

    respostas.forEach(r => {

      embedFinal.addFields({
        name: r.pergunta,
        value: r.resposta.slice(0, 1024)
      });
    });

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`aprovar_${interaction.user.id}_${canal.id}`)
        .setLabel('Aprovar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`reprovar_${interaction.user.id}_${canal.id}`)
        .setLabel('Reprovar')
        .setStyle(ButtonStyle.Danger)
    );

    await canalStaff.send({
      embeds: [embedFinal],
      components: [row]
    });

    await canal.send('✅ Sua whitelist foi enviada para análise da staff.');
  }

  if (interaction.customId.startsWith('aprovar_')) {

    const parts = interaction.customId.split('_');

    const userId = parts[1];
    const canalWhitelistId = parts[2];

    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    if (member) {

      await member.roles.add(config.approvedRoleId).catch(() => {});

      const cargoSemWL = interaction.guild.roles.cache.get(config.semWhitelistRoleId);

      if (cargoSemWL && member.roles.cache.has(cargoSemWL.id)) {
        await member.roles.remove(cargoSemWL).catch(() => {});
      }

      await member.send(
        '✅ Parabéns! Sua whitelist foi aprovada na Cidade de Deus Roleplay.'
      ).catch(() => {});
    }

    await interaction.update({
      content: '✅ Whitelist aprovada.',
      components: []
    });

    const canalWhitelist = interaction.guild.channels.cache.get(canalWhitelistId);

    if (canalWhitelist) {

      setTimeout(() => {
        canalWhitelist.delete().catch(() => {});
      }, 5000);
    }

    logEmbed(interaction.guild, '✅ Whitelist aprovada', `Usuário aprovado: <@${userId}>`);
  }

  if (interaction.customId.startsWith('reprovar_')) {

    const parts = interaction.customId.split('_');

    const userId = parts[1];
    const canalWhitelistId = parts[2];

    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    if (member) {

      await member.send(
        '❌ Sua whitelist foi reprovada na Cidade de Deus Roleplay. Revise as regras e tente novamente.'
      ).catch(() => {});
    }

    await interaction.update({
      content: '❌ Whitelist reprovada.',
      components: []
    });

    const canalWhitelist = interaction.guild.channels.cache.get(canalWhitelistId);

    if (canalWhitelist) {

      setTimeout(() => {
        canalWhitelist.delete().catch(() => {});
      }, 5000);
    }

    logEmbed(interaction.guild, '❌ Whitelist reprovada', `Usuário reprovado: <@${userId}>`);
  }
});

const token = process.env.TOKEN?.trim();

client.login(token);