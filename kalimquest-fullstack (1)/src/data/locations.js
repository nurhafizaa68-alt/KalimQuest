const w = (ar, latin, id, emoji, o = {}) => ({ ar, latin, id, emoji, ...o });
const H = { tpl:'هَذَا {}', tplF:'هَذِهِ {}', tr:'Ini {}.' };
const LIKE = { tpl:'أُحِبُّ {}', tr:'Saya suka {}.' };

export const locations = [
  { id:'fruit-garden', title:'Fruit Garden', arabic:'حَدِيقَةُ الْفَوَاكِهِ', subtitle:'Kebun Buah', emoji:'🍎', color:'peach', intro:'Ayo kenali buah-buahan dalam Bahasa Arab!', ...H, words:[
    w('تُفَّاحٌ','tuffāḥun','Apel','🍎'), w('مَوْزٌ','mawzun','Pisang','🍌'), w('بُرْتُقَالٌ','burtuqālun','Jeruk','🍊'),
    w('فَرَاوِلَةٌ','farāwilatun','Stroberi','🍓',{g:'f'}), w('عِنَبٌ','‘inabun','Anggur','🍇'), w('بِطِّيخٌ','biṭṭīkhun','Semangka','🍉'),
    w('مَانْجَا','mānjā','Mangga','🥭',{g:'f'}), w('أَنَانَاسٌ','ananāsun','Nanas','🍍'), w('لَيْمُونٌ','laymūnun','Lemon','🍋'), w('طَمَاطِمٌ','thamaatim','Tomat','🍅')] },
  { id:'hobby-park', title:'Hobby', arabic:'هِوَايَتِي', subtitle:'Hobi', emoji:'🛝', color:'mint', intro:'Temukan kegiatan seru yang kamu sukai!', ...LIKE, words:[
    w('الْقِرَاءَةُ','alqirā’atu','Membaca','📚',{f:'الْقِرَاءَةَ'}), w('الْكِتَابَةُ','alkitābatu','Menulis','✍️',{f:'الْكِتَابَةَ'}),
    w('الرَّسْمُ','arrasmu','Menggambar','🎨',{f:'الرَّسْمَ'}), w('السِّبَاحَةُ','assibāḥatu','Berenang','🏊',{f:'السِّبَاحَةَ'}),
    w('الْغِنَاءُ','alghinā’u','Bernyanyi','🎤',{f:'الْغِنَاءَ'}), w('الطَّبْخُ','aṭṭabkhu','Memasak','🍳',{f:'الطَّبْخَ'}),
    w('الرَّكْضُ','arrakḍu','Berlari','🏃',{f:'الرَّكْضَ'}), w('اللَّعِبُ','allaʻibu','Bermain','⚽',{f:'اللَّعِبَ'}),
    w('الْمَشْيُ','almashyu','Berjalan','🚶',{f:'الْمَشْيَ'}), w('الْقَفْزُ','alqafzu','Melompat','🤸',{f:'الْقَفْزَ'})] },
  { id:'school-corner', title:'School Corner', arabic:'مَدْرَسَتِي', subtitle:'Sudut Sekolah', emoji:'🏫', color:'lavender', intro:'Cari benda-benda yang ada di kelas!', ...H, words:[
    w('كِتَابٌ','kitābun','Buku','📘'), w('قَلَمٌ','qalamun','Pena','🖊️'), w('حَقِيبَةٌ','ḥaqībatun','Tas','🎒',{g:'f'}),
    w('سَبُّورَةٌ','sabbūratun','Papan tulis','🧑‍🏫',{g:'f'}), w('دَفْتَرٌ','daftarun','Buku tulis','📓'), w('مِسْطَرَةٌ','misṭaratun','Penggaris','📏',{g:'f'}),
    w('مِمْحَاةٌ','mimḥātun','Penghapus','🧽',{g:'f'}), w('كُرْسِيٌّ','kursiyyun','Kursi','🪑'), w('مِقَصٌّ','miqaṣṣun','Gunting','✂️'), w('بَابٌ','bābun','Pintu','🚪')] },
  { id:'family-house', title:'Family House', arabic:'أُسْرَتِي', subtitle:'Rumah Keluarga', emoji:'🏡', color:'sky', intro:'Kenalkan anggota keluargamu!', tpl:'هَذَا {}', tplF:'هَذِهِ {}', tr:'Ini {}ku.', words:[
    w('أَبٌ','abun','Ayah','👨',{f:'أَبِي'}), w('أُمٌّ','ummun','Ibu','👩',{g:'f',f:'أُمِّي'}), w('أَخٌ','akhun','Saudara laki-laki','👦',{f:'أَخِي'}),
    w('أُخْتٌ','ukhtun','Saudara perempuan','👧',{g:'f',f:'أُخْتِي'}), w('جَدٌّ','jaddun','Kakek','👴',{f:'جَدِّي'}), w('جَدَّةٌ','jaddatun','Nenek','👵',{g:'f',f:'جَدَّتِي'}),
    w('عَمٌّ','‘ammun','Paman','🧔',{f:'عَمِّي'}), w('عَمَّةٌ','‘ammatun','Bibi','👩‍🦰',{g:'f',f:'عَمَّتِي'}),
    w('بَيْتٌ','baytun','Rumah','🏠',{f:'بَيْتِي'}), w('طِفْلٌ','ṭiflun','Bayi','👶',{t:'Ini bayi.'})] },
  { id:'food-street', title:'Food Street', arabic:'الطَّعَامُ', subtitle:'Jalan Makanan', emoji:'🍜', color:'yellow', intro:'Yuk, pesan makanan dalam Bahasa Arab!', ...LIKE, words:[
    w('خُبْزٌ','khubzun','Roti','🍞',{f:'الْخُبْزَ'}), w('أَرُزٌّ','aruzzun','Nasi','🍚',{f:'الْأَرُزَّ'}), w('سَمَكٌ','samakun','Ikan','🐟',{f:'السَّمَكَ'}),
    w('مَاءٌ','mā’un','Air','💧',{f:'الْمَاءَ'}), w('لَبَنٌ','labanun','Susu','🥛',{f:'اللَّبَنَ'}), w('بَيْضٌ','baydun','Telur','🥚',{f:'الْبَيْضَ'}),
    w('جُبْنٌ','jubnun','Keju','🧀',{f:'الْجُبْنَ'}), w('دَجَاجٌ','dajājun','Ayam','🍗',{f:'الدَّجَاجَ'}),
    w('لَحْمٌ','laḥmun','Daging','🥩',{f:'اللَّحْمَ'}), w('عَصِيرٌ','‘aṣīrun','Jus','🧃',{f:'الْعَصِيرَ'})] }
];
