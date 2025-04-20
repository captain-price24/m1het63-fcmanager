const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const TAKIM_ROLLERI = {
  'Galatasaray': '1362862336762839271',
  'Fenerbahçe': '1362862336762839272',
  'Beşiktaş': '1362862336737542303',
  'Trabzonspor': '1362862336737542302',
  'Başakşehir': '1362862336737542301',
  'Alanyaspor': '1362862336737542300',
  'Eyüpspor': '1362862336737542299',
  'Adanademirspor': '1362862336737542298',
  'Kayserispor': '1362862336737542297',
  'Rizespor': '1362862336737542295',
  'Gaziantep': '1362862336737542294',
  'Göztepe': '1362862336716705861',
  'Hatayspor': '1362862336716705860',
  'Kasımpaşa': '1362862336716705859',
  'Samsunspor': '1362862336716705858',
  'Sivasspor': '1362862336716705857',
  'Antalyaspor': '1362862336716705856',
  'Konyaspor': '1362862336762839273'
};

const TAKIM_KANALLARI = {
  'Galatasaray': '1363198586703184012',
  'Fenerbahçe': '1363198600854638905',
  'Beşiktaş': '1363198609419538673',
  'Trabzonspor': '1363198616973476132',
  'Konyaspor': '1363198648816500747',
  'Başakşehir': '1363198717821194270',
  'Gaziantep': '1363198734195884152',
  'Sivasspor': '1363198748150464662',
  'Eyüpspor': '1363198760171208874',
  'Bodrumspor': '1363198777112002752',
  'Rizespor': '1363198790244368424',
  'Kayserispor': '1363198889548709968',
  'Alanyaspor': '1363198906623590560',
  'Kasımpaşa': '1363198924357242921',
  'Hatayspor': '1363198945894858842',
  'Göztepe': '1363198976932970708',
  'Samsunspor': '1363199037687333135',
  'Adanademirspor': '1363199108424142978',
  'Antalyaspor': '1363199431557648415'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kapbildiri')
    .setDescription('KAP bildirimi oluşturur')
    .addStringOption(option => option.setName('oyuncu').setDescription('Oyuncu İsmi').setRequired(true))
    .addStringOption(option => option.setName('bonservis').setDescription('Verilen Bonservis (€)').setRequired(true))
    .addStringOption(option => option.setName('maas').setDescription('Ödenen Maaş (€)').setRequired(true))
    .addStringOption(option => option.setName('yil').setDescription('Yıl').setRequired(true))
    .addStringOption(option => option.setName('ozel_madde').setDescription('Özel Madde').setRequired(true))
    .addStringOption(option => option.setName('serbest_bedel').setDescription('Serbest Kalma Bedeli (€)').setRequired(true))
    .addStringOption(option => option.setName('eski_takim').setDescription('Eski Takımı').setRequired(true)),
    
  async execute(interaction) {
    try {
      // 1. Kullanıcının takım rolünü bul
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const userTeam = Object.keys(TAKIM_ROLLERI).find(takim => 
        member.roles.cache.has(TAKIM_ROLLERI[takim])
      );

      if (!userTeam) {
        return interaction.reply({
          content: '❌ Hiçbir takım rolünüz bulunmuyor!',
          ephemeral: true
        });
      }

      // 2. Embed oluştur
      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('📢 YENİ KAP BİLDİRİMİ 📢')
        .setDescription('` Kap Formu `')
        .addFields(
          { name: '***Oyuncu İsmi:***', value: interaction.options.getString('oyuncu') },
          { name: '***Verilen Bonservis:***', value: interaction.options.getString('bonservis') + ' €' },
          { name: '***Ödenen Maaş:***', value: interaction.options.getString('maas') + ' €' },
          { name: '***Yıl:***', value: interaction.options.getString('yil') },
          { name: '***Özel Madde:***', value: interaction.options.getString('ozel_madde') },
          { name: '***Serbest Kalma Bedeli:***', value: interaction.options.getString('serbest_bedel') + ' €' },
          { name: '***Eski Takımı:***', value: interaction.options.getString('eski_takim') },
          { name: '***Yeni Takımı:***', value: userTeam }
        )
        .setFooter({ 
          text: `Bildirimi gönderen: ${interaction.user.tag} (ID: ${interaction.user.id})`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      // 3. Ana KAP kanalına gönder
      const kapChannel = interaction.guild.channels.cache.get('1362862340311089359');
      if (!kapChannel) throw new Error('KAP kanalı bulunamadı!');
      
      await kapChannel.send({ embeds: [embed] });

      // 4. Takım kanalına gönder
      const teamChannelId = TAKIM_KANALLARI[userTeam];
      if (teamChannelId) {
        const teamChannel = interaction.guild.channels.cache.get(teamChannelId);
        if (teamChannel) {
          await teamChannel.send({ embeds: [embed] });
        }
      }

      // 5. Onay mesajı
      await interaction.reply({
        content: `✅ KAP bildirimi başarıyla gönderildi! (${userTeam} kanalına yönlendirildi)`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Hata:', error);
      await interaction.reply({
        content: `❌ Hata: ${error.message}`,
        ephemeral: true
      });
    }
  }
};