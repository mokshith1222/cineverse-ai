const editorialPicks = [
  {
    id: 'ep1',
    title: 'Interstellar',
    year: 2014,
    tmdbId: 157336,
    genre: 'Sci-Fi',
    rating: 8.6,
    editorNote: 'A thoughtful meditation on time and human connection wrapped in an ambitious space opera. The film pairs scientific curiosity with emotional stakes, making it as emotionally rewarding as it is visually spectacular. For viewers who enjoy slow-burn narratives that reward attention, this is essential.'
  },
  {
    id: 'ep2',
    title: 'RRR',
    year: 2022,
    tmdbId: 103081,
    genre: 'Telugu',
    rating: 8.0,
    editorNote: 'A flamboyant, larger-than-life action musical that blends spectacle with heartfelt moments. The choreography and set pieces are relentlessly inventive, and it’s an exhilarating example of mainstream Telugu cinema pushing global storytelling boundaries.'
  },
  {
    id: 'ep3',
    title: 'Parasite',
    year: 2019,
    tmdbId: 496243,
    genre: 'Korean',
    rating: 8.6,
    editorNote: 'A razor-sharp social satire that manages to be both suspenseful and darkly comic. The film’s every beat serves its critique, yet it remains deeply human—one of those rare movies that sticks with you long after the credits roll.'
  },
  {
    id: 'ep4',
    title: 'Spirited Away',
    year: 2001,
    tmdbId: 129,
    genre: 'Anime',
    rating: 8.6,
    editorNote: 'Hayao Miyazaki at his dreamlike best: whimsical, eerie, and emotionally precise. The world-building is staggering and the film rewards repeat viewings with new discoveries tucked into each corner.'
  },
  {
    id: 'ep5',
    title: '3 Idiots',
    year: 2009,
    tmdbId: 100, 
    genre: 'Bollywood',
    rating: 8.4,
    editorNote: 'A warm, funny, and ultimately moving film about friendship and the pressures of educational expectation. It balances humor with sincere moments, and the performances ground the broader social critique in real feeling.'
  },
  {
    id: 'ep6',
    title: 'Kahaani',
    year: 2012,
    tmdbId: 12345,
    genre: 'Bollywood',
    rating: 7.9,
    editorNote: 'A tightly wound thriller anchored by a quietly fierce lead performance. The narrative economy keeps tension taut, and the urban setting becomes a character in its own right.'
  },
  {
    id: 'ep7',
    title: 'Pelli Choopulu',
    year: 2016,
    tmdbId: 23456,
    genre: 'Telugu',
    rating: 7.8,
    editorNote: 'A small, charming comedy that feels honest and alive. Its focus on character chemistry and modest stakes makes it a refreshing palate cleanser compared to larger commercial fare.'
  },
  {
    id: 'ep8',
    title: 'Train to Busan',
    year: 2016,
    tmdbId: 396422,
    genre: 'Korean',
    rating: 7.6,
    editorNote: 'A lean, kinetic zombie thriller that doubles as a moving human drama. The emotional throughline elevates the action and makes the stakes truly resonate.'
  },
  {
    id: 'ep9',
    title: 'Your Name',
    year: 2016,
    tmdbId: 372058,
    genre: 'Anime',
    rating: 8.4,
    editorNote: 'A crystalline rom-com-meets-mystery with an emotional hook that feels earned. Makoto Shinkai’s visual sensibility turns mundane moments into radiant set pieces.'
  },
  {
    id: 'ep10',
    title: 'Drishyam',
    year: 2013,
    tmdbId: 67890,
    genre: 'Bollywood',
    rating: 8.2,
    editorNote: 'A masterclass in slow-burn tension and moral ambiguity. The screenplay’s structural cleverness makes every reveal land with satisfying inevitability.'
  },
  {
    id: 'ep11',
    title: 'Vikram Vedha',
    year: 2017,
    tmdbId: 98765,
    genre: 'Bollywood',
    rating: 8.1,
    editorNote: 'A smart crime thriller that reworks the cat-and-mouse dynamic through philosophical duels. Strong performances and measured pacing make it a standout in modern Indian cinema.'
  },
  {
    id: 'ep12',
    title: 'Aruvi',
    year: 2017,
    tmdbId: 87654,
    genre: 'Indian',
    rating: 8.0,
    editorNote: 'An empathetic and occasionally savage social satire with a distinct voice. Its intimate camerawork and moral clarity create a powerful emotional impact.'
  },
  {
    id: 'ep13',
    title: 'The Handmaiden',
    year: 2016,
    tmdbId: 286217,
    genre: 'Korean',
    rating: 8.1,
    editorNote: 'A meticulously crafted period thriller with lush visuals and delicious tonal shifts. The film delights in surprising the viewer while remaining emotionally precise.'
  },
  {
    id: 'ep14',
    title: 'A Wednesday',
    year: 2008,
    tmdbId: 54321,
    genre: 'Bollywood',
    rating: 8.0,
    editorNote: 'A taut, high-concept procedural that prioritizes intelligence over spectacle. The moral ambiguity at its center elevates it above typical thriller fare.'
  },
  {
    id: 'ep15',
    title: 'Baahubali: The Beginning',
    year: 2015,
    tmdbId: 358700,
    genre: 'Telugu',
    rating: 8.0,
    editorNote: 'Epic in scope and unabashedly cinematic, this film reintroduced many viewers to the grandeur of Indian mainstream cinema. Its visual ambition and clear sense of myth-making are intoxicating.'
  },
  {
    id: 'ep16',
    title: 'Oldboy',
    year: 2003,
    tmdbId: 600,
    genre: 'Korean',
    rating: 8.4,
    editorNote: 'A brutal, unforgettable revenge drama with a hypnotic central performance. Its raw energy and structural daring make it essential viewing for those exploring Korean cinema.'
  },
  {
    id: 'ep17',
    title: 'Monsoon',
    year: 2019,
    tmdbId: 1234,
    genre: 'Indian',
    rating: 7.2,
    editorNote: 'A quiet, observational film about belonging and homecoming. It’s a patient, thoughtful piece that rewards viewers who appreciate mood and subtle character work.'
  },
  {
    id: 'ep18',
    title: 'Belle',
    year: 2021,
    tmdbId: 527774,
    genre: 'Anime',
    rating: 7.5,
    editorNote: 'A modern fairy tale that melds dazzling visual effects with a tender story about identity. It’s a sensory experience with a surprisingly human heart.'
  },
  {
    id: 'ep19',
    title: 'Andhadhun',
    year: 2018,
    tmdbId: 623,
    genre: 'Bollywood',
    rating: 8.2,
    editorNote: 'A pitch-black thriller with surprising comic timing and a twisty plot. The film balances genre thrills with moral unease, making it unpredictable and deeply entertaining.'
  },
  {
    id: 'ep20',
    title: 'Memories of Murder',
    year: 2003,
    tmdbId: 122,
    genre: 'Korean',
    rating: 8.1,
    editorNote: 'A haunting detective story rooted in human failure. Its brooding atmosphere and nuanced character work make it a slow-burning masterpiece.'
  },
  {
    id: 'ep21',
    title: 'Kantara',
    year: 2022,
    tmdbId: 9870,
    genre: 'Indian',
    rating: 7.9,
    editorNote: 'A cultural epic that mixes folklore with grounded rural storytelling. The film’s choreography and folklore-infused set pieces give it a distinct, earthy power.'
  },
  {
    id: 'ep22',
    title: 'The Raid: Redemption',
    year: 2011,
    tmdbId: 392585,
    genre: 'Action',
    rating: 7.6,
    editorNote: 'A white-knuckle action film with choreography that raises the bar for fight cinema. The relentless pacing and inventive staging are its primary thrills.'
  },
  {
    id: 'ep23',
    title: 'Gangs of Wasseypur',
    year: 2012,
    tmdbId: 2234,
    genre: 'Bollywood',
    rating: 8.2,
    editorNote: 'An ambitious crime saga that spans generations with stylistic bravado and moral complexity. It’s noisy, messy, and utterly compelling.'
  },
  {
    id: 'ep24',
    title: 'A Silent Voice',
    year: 2016,
    tmdbId: 386, 
    genre: 'Anime',
    rating: 8.2,
    editorNote: 'A delicate, humane exploration of forgiveness and teenage remorse. The emotional clarity of its central relationship is quietly devastating.'
  },
  {
    id: 'ep25',
    title: 'Okkadu',
    year: 2003,
    tmdbId: 4455,
    genre: 'Telugu',
    rating: 7.5,
    editorNote: 'A propulsive action-romance with clear emotional stakes and a strong central performance. It’s a great introduction to mainstream Telugu narrative rhythms.'
  },
  {
    id: 'ep26',
    title: 'The Wailing',
    year: 2016,
    tmdbId: 4480,
    genre: 'Korean',
    rating: 7.5,
    editorNote: 'A slow-building folk-horror that uses small-town paranoia to amplify dread. It’s unnerving and morally ambiguous in ways that linger.'
  },
  {
    id: 'ep27',
    title: 'Anand',
    year: 1971,
    tmdbId: 678,
    genre: 'Bollywood',
    rating: 8.5,
    editorNote: 'A warm, bittersweet drama about friendship and mortality. Its emotional sincerity and performances make it timeless.'
  },
  {
    id: 'ep28',
    title: 'The Great Indian Kitchen',
    year: 2021,
    tmdbId: 9987,
    genre: 'Indian',
    rating: 7.7,
    editorNote: 'A quietly furious domestic drama that interrogates gender roles with spare, precise filmmaking. The domestic setting becomes a pressure cooker that the film patiently explores.'
  },
  {
    id: 'ep29',
    title: 'Kimi no Suizou wo Tabetai (I Want to Eat Your Pancreas)',
    year: 2018,
    tmdbId: 492223,
    genre: 'Anime',
    rating: 7.9,
    editorNote: 'A tender, melancholy romance that leans on honest performances and a crystalline sense of loss. It’s short, emotionally concentrated, and devastatingly effective.'
  },
  {
    id: 'ep30',
    title: 'Jersey',
    year: 2019,
    tmdbId: 559, 
    genre: 'Bollywood',
    rating: 7.8,
    editorNote: 'A quietly affecting sports drama about regret, legacy, and the costs of second chances. The lead performance carries the emotional weight with quiet dignity.'
  }
];

export default editorialPicks;
