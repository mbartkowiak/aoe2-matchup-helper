/*
 * Civilization data set.
 * Curated from general AoE2:DE game knowledge — not pulled from any API.
 * Bonuses are abbreviated highlights, not a full tech-tree dump, since this
 * is meant to drive the advice engine's heuristics, not serve as a wiki.
 *
 * Schema per civ:
 *   id, name
 *   uniqueUnits: [{ name, class }]   // class refers to UNIT_CLASSES in units.js
 *   uniqueTechs: [string, string]
 *   teamBonus: string
 *   bonuses: [string]                // flavor list of key bonuses
 *   strongUnits: [class]             // unit classes this civ excels with
 *   weakUnits: [class]               // notable gaps (missing line / weak upgrades)
 *   tags: [playstyle tags]           // fastFeudal, boomer, turtle, lateGameSpike,
 *                                    // navalCiv, trashWarCiv, siegeCiv
 *   blurb: string
 *
 * Roster covers the long-established DE civ list. If a civ you play is
 * missing or you disagree with a tag, just add/edit an entry below —
 * nothing else in the app needs to change.
 */

const CIVS = [
  { id: 'aztecs', name: 'Aztecs', uniqueUnits: [{ name: 'Jaguar Warrior', class: 'infantry' }],
    uniqueTechs: ['Atlatl', 'Garland Wars'], teamBonus: 'Relics generate +33% gold',
    bonuses: ['Villagers +30 HP', 'Military units cost no gold upkeep advantage via faster training', 'Monks +5 heal range', 'No Blacksmith armor for infantry needed as much (cheap upgrades)'],
    strongUnits: ['infantry', 'eagles', 'monks'], weakUnits: ['knights', 'camels'],
    tags: ['infantryCiv', 'fastFeudal', 'boomer'], blurb: 'No cavalry at all, but relentless with infantry, eagles, and monks.' },

  { id: 'berbers', name: 'Berbers', uniqueUnits: [{ name: 'Genitour', class: 'skirmishers' }],
    uniqueTechs: ['Kasbah', 'Maghrebi Camels'], teamBonus: 'Stable units cost -15% food',
    bonuses: ['Villagers move 10% faster', 'Cheaper Stable units', 'Cheaper Castles', 'Camels upgrade free'],
    strongUnits: ['scouts', 'knights', 'camels', 'skirmishers'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv'], blurb: 'Fast-moving villagers and cheap cavalry make for quick, aggressive openings.' },

  { id: 'britons', name: 'Britons', uniqueUnits: [{ name: 'Longbowman', class: 'archers' }],
    uniqueTechs: ['Warwolf', 'Yeomen'], teamBonus: 'Foot archers +1 range once Ballistics researched',
    bonuses: ['Shepherds work 25% faster', 'Foot archers +range bonus baked in', 'Universities cost -30%', 'Free Town Watch'],
    strongUnits: ['archers'], weakUnits: [],
    tags: ['archerCiv', 'lateGameSpike'], blurb: 'The definitive archer civ — Longbowmen out-range almost everything.' },

  { id: 'bulgarians', name: 'Bulgarians', uniqueUnits: [{ name: 'Konnik', class: 'knights' }],
    uniqueTechs: ['Bagains', 'Stirrups'], teamBonus: 'Blacksmith upgrades free once researched',
    bonuses: ['Blacksmith upgrades free once unlocked', 'Stable units +HP', 'Cheaper siege units', 'Extra Cavalier armor'],
    strongUnits: ['knights', 'siege', 'infantry'], weakUnits: [],
    tags: ['boomer', 'turtle', 'siegeCiv'], blurb: 'Free Blacksmith upgrades snowball into a very cost-efficient army.' },

  { id: 'burgundians', name: 'Burgundians', uniqueUnits: [{ name: 'Coustillier', class: 'knights' }],
    uniqueTechs: ['Burgundian Vineyards', 'Flemish Revolution'], teamBonus: 'Gunpowder units +1 range',
    bonuses: ['Trade generates extra gold', 'Cheaper gunpowder units', 'Faster building construction', 'Cavalry upgrades cheaper'],
    strongUnits: ['knights', 'gunpowder'], weakUnits: [],
    tags: ['cavalryCiv', 'lateGameSpike'], blurb: 'Rich economy funding hard-charging cavalry and cheap gunpowder.' },

  { id: 'burmese', name: 'Burmese', uniqueUnits: [{ name: 'Arambai', class: 'cavalryArchers' }],
    uniqueTechs: ['Howdah', 'Manipur Cavalry'], teamBonus: 'Battle Elephants +30 HP',
    bonuses: ['Lumberjacks work faster over time', 'Monks +50% heal speed', 'Free Toolworking/Fletching/Bodkin Arrow', 'Team bonus improves ally elephants'],
    strongUnits: ['cavalryArchers', 'monks'], weakUnits: [],
    tags: ['fastFeudal', 'monkCiv'], blurb: 'Fast tech into hit-and-run Arambai backed by strong monks.' },

  { id: 'byzantines', name: 'Byzantines', uniqueUnits: [{ name: 'Cataphract', class: 'knights' }],
    uniqueTechs: ['Logistica', 'Greek Fire'], teamBonus: 'Buildings +10% HP',
    bonuses: ['Buildings +10-20% HP', 'Fire Ships +25% attack', 'Cheaper Camels/Skirmishers/Spearmen line', 'Redemption free'],
    strongUnits: ['knights', 'spearmen', 'skirmishers', 'camels'], weakUnits: [],
    tags: ['turtle', 'lateGameSpike', 'trashWarCiv'], blurb: 'Tanky buildings and cheap trash units make Byzantines brutal to besiege.' },

  { id: 'celts', name: 'Celts', uniqueUnits: [{ name: 'Woad Raider', class: 'infantry' }],
    uniqueTechs: ['Furor Celtica', 'Stronghold'], teamBonus: 'Siege Workshops work 20% faster',
    bonuses: ['Siege units +% attack speed', 'Infantry move 15% faster', 'Sheep give more food', 'Siege Workshops build units faster'],
    strongUnits: ['infantry', 'siege'], weakUnits: [],
    tags: ['infantryCiv', 'siegeCiv', 'fastFeudal'], blurb: 'Fast infantry backed by unusually strong, fast-firing siege.' },

  { id: 'chinese', name: 'Chinese', uniqueUnits: [{ name: 'Chu Ko Nu', class: 'archers' }],
    uniqueTechs: ['Great Wall', 'Rocketry'], teamBonus: 'Technologies cost -100 food (once)',
    bonuses: ['Start with 3 extra villagers but -1 food', 'Technologies cost less food', 'Farm upgrades free', 'Demolition Ship/Trebuchet buffs'],
    strongUnits: ['archers'], weakUnits: [],
    tags: ['boomer', 'archerCiv', 'lateGameSpike'], blurb: 'Slow, awkward start that snowballs into fast teching and strong archers.' },

  { id: 'cumans', name: 'Cumans', uniqueUnits: [{ name: 'Kipchak', class: 'cavalryArchers' }],
    uniqueTechs: ['Cuman Mercenaries', 'Steppe Husbandry'], teamBonus: 'Relics/Trade carts move 25% faster',
    bonuses: ['First TC free & instant, first Dock/2nd TC discounted', 'Cavalry regenerate HP in own territory', 'Free Castle Age instant Castle build once', 'Extra Feudal Age villager'],
    strongUnits: ['cavalryArchers', 'knights', 'scouts'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv'], blurb: 'Extremely fast, cheap early expansion into relentless cavalry pressure.' },

  { id: 'dravidians', name: 'Dravidians', uniqueUnits: [{ name: 'Urumi Swordsman', class: 'infantry' }],
    uniqueTechs: ['Medical Corps', 'Wootz Steel'], teamBonus: 'Herdables +100 food when converted',
    bonuses: ['Ships cost -20%', 'Ship upgrades free', 'Elephant units cost less', 'Fish traps built instantly'],
    strongUnits: ['infantry', 'navy'], weakUnits: [],
    tags: ['navalCiv', 'infantryCiv'], blurb: 'Cheap ships and elephants power a strong water and infantry game.' },

  { id: 'ethiopians', name: 'Ethiopians', uniqueUnits: [{ name: 'Oromo Warrior', class: 'archers' }],
    uniqueTechs: ['Royal Heirs', 'Torsion Engines'], teamBonus: 'Archery Ranges work 20% faster',
    bonuses: ['Gold miners work faster', 'Gold-cost techs cheaper', 'Units fire 12.5% faster once Feudal', 'Archery Ranges train faster'],
    strongUnits: ['archers', 'infantry'], weakUnits: [],
    tags: ['archerCiv', 'fastFeudal'], blurb: 'Faster-firing units across the board with a gold-efficient economy.' },

  { id: 'franks', name: 'Franks', uniqueUnits: [{ name: 'Throwing Axeman', class: 'infantry' }],
    uniqueTechs: ['Bearded Axe', 'Chivalry'], teamBonus: 'Castles cost -25% (min 800 stone)',
    bonuses: ['Cavalry +HP (not upgrade-dependent)', 'Farms give more food, one-time free farm reseed', 'Castles cost less stone', 'Foragers work faster'],
    strongUnits: ['knights'], weakUnits: [],
    tags: ['cavalryCiv', 'fastFeudal'], blurb: 'Tanky knights and a strong castle game make Franks a straightforward cavalry powerhouse.' },

  { id: 'georgians', name: 'Georgians', uniqueUnits: [{ name: 'Monaspa', class: 'knights' }],
    uniqueTechs: ['Fortified Church', 'Corvinian Army'], teamBonus: 'Relics garrisoned in TC give +Trickle gold',
    bonuses: ['Buildings +% HP vs raids', 'Cheaper/faster fortifications', 'Cavalry resist raiding', 'Extra bonus vs. raiding civs'],
    strongUnits: ['knights'], weakUnits: [],
    tags: ['turtle', 'cavalryCiv'], blurb: 'Extremely raid-resistant economy backed by sturdy cavalry.' },

  { id: 'goths', name: 'Goths', uniqueUnits: [{ name: 'Huskarl', class: 'infantry' }],
    uniqueTechs: ['Anarchy', 'Perfusion'], teamBonus: 'Infantry cost -20% gold once Feudal',
    bonuses: ['Infantry cost less gold', 'Infantry train faster (more so with more Barracks)', 'Extra pop space from Houses', 'Cheap Huskarls counter archers hard'],
    strongUnits: ['infantry'], weakUnits: ['knights'],
    tags: ['infantryCiv', 'fastFeudal', 'trashWarCiv'], blurb: 'Overwhelms with sheer numbers of cheap, fast-trained infantry.' },

  { id: 'gurjaras', name: 'Gurjaras', uniqueUnits: [{ name: 'Chakram Thrower', class: 'infantry' }, { name: 'Camel Scout', class: 'scouts' }],
    uniqueTechs: ['Battle Elephant Rework', 'Shrivamsha Rider Rework'], teamBonus: 'Camels/Battle Elephants +2 attack vs standard buildings',
    bonuses: ['Herdables give +100% food', 'Camel Riders can be made from Stable and Archery Range', 'Forage bushes never run out', 'Extra bonus vs. buildings'],
    strongUnits: ['camels', 'cavalryArchers'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv'], blurb: 'Unusual flexible camel/cavalry play fed by an herdable-heavy economy.' },

  { id: 'hindustanis', name: 'Hindustanis', uniqueUnits: [{ name: 'Ghulam', class: 'infantry' }],
    uniqueTechs: ['Grand Trunk Road', 'Shatagni'], teamBonus: 'Relics can be sold at the Market',
    bonuses: ['Free Town Watch/Patrol', 'Camel/Elephant units train faster', 'Ghulams re-arm for free over time', 'Strong early Castle Age power spike'],
    strongUnits: ['infantry', 'camels'], weakUnits: [],
    tags: ['boomer', 'fastFeudal'], blurb: 'Cheap, self-sustaining Ghulam infantry backed by elephants and camels.' },

  { id: 'huns', name: 'Huns', uniqueUnits: [{ name: 'Tarkan', class: 'knights' }],
    uniqueTechs: ['Atheism', 'Marauders'], teamBonus: 'Spies/Treason cost -50%',
    bonuses: ['No Houses needed for population', 'Cavalry Archers cost less gold', 'Stable units cost less gold', 'Tarkans bonus damage vs buildings'],
    strongUnits: ['knights', 'cavalryArchers'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv', 'siegeCiv'], blurb: 'No houses needed means a faster, more flexible cavalry-archer rush.' },

  { id: 'incas', name: 'Incas', uniqueUnits: [{ name: 'Kamayuk', class: 'spearmen' }, { name: 'Slinger', class: 'archers' }],
    uniqueTechs: ['Andean Sling', 'Couriers'], teamBonus: 'Houses support +5 pop',
    bonuses: ['Houses support extra population', 'Buildings cost -15% stone', 'Blacksmith upgrades cost no gold', 'Villagers move faster on trade routes'],
    strongUnits: ['infantry', 'eagles', 'spearmen'], weakUnits: ['knights'],
    tags: ['infantryCiv', 'boomer'], blurb: 'No knight line, but efficient buildings and anti-cavalry Kamayuks fill the gap.' },

  { id: 'italians', name: 'Italians', uniqueUnits: [{ name: 'Genoese Crossbowman', class: 'archers' }],
    uniqueTechs: ['Cannon Galleon rework', 'Pavise'], teamBonus: 'Trade units generate +33% gold for Market owner',
    bonuses: ['Cheaper Docks/ships', 'Gunpowder units cost less', 'Faster technology research early on', 'Free unique-unit condottiero spawns with gold techs'],
    strongUnits: ['navy', 'gunpowder', 'archers'], weakUnits: [],
    tags: ['navalCiv', 'fastFeudal'], blurb: 'Cheap fleets and gunpowder with unusually fast early research.' },

  { id: 'japanese', name: 'Japanese', uniqueUnits: [{ name: 'Samurai', class: 'infantry' }],
    uniqueTechs: ['Kataparuto', 'Yasama'], teamBonus: 'Fishing Ships cost -20% wood',
    bonuses: ['Fish traps give more food, built faster', 'Infantry & archer attack speed bonus', 'Mill/Farm upgrades free', 'Samurai strong vs. unique units'],
    strongUnits: ['infantry', 'archers', 'navy'], weakUnits: [],
    tags: ['infantryCiv', 'navalCiv'], blurb: 'Fast-attacking infantry and archers with a very strong water economy.' },

  { id: 'khmer', name: 'Khmer', uniqueUnits: [{ name: 'Ballista Elephant', class: 'siege' }],
    uniqueTechs: ['Double Crossbow', 'Tusk Swords'], teamBonus: 'Scout Cavalry line +1 line of sight',
    bonuses: ['Farms need no wood to reseed', 'No minimum-tech-building requirement for advancing', 'Scorpions +range', 'Extra population from farms not required'],
    strongUnits: ['siege'], weakUnits: [],
    tags: ['siegeCiv', 'boomer'], blurb: 'Unconventional tech-building freedom feeds into a dominant siege game.' },

  { id: 'koreans', name: 'Koreans', uniqueUnits: [{ name: 'War Wagon', class: 'siege' }],
    uniqueTechs: ['Panokseon', 'Shinkichon'], teamBonus: 'Fortifications (towers/walls) cost -50% wood',
    bonuses: ['Free tower upgrades (Fortified Wall discount)', 'Houses grant line of sight', 'Ballistics researched for free', 'Very strong Towers'],
    strongUnits: ['siege', 'archers'], weakUnits: [],
    tags: ['turtle', 'siegeCiv'], blurb: 'Oppressive towers and War Wagons make Koreans a defensive-turned-siege powerhouse.' },

  { id: 'lithuanians', name: 'Lithuanians', uniqueUnits: [{ name: 'Leitis', class: 'knights' }],
    uniqueTechs: ['Hill Forts', 'Tower Shields'], teamBonus: 'Relics generate +100% gold trickle',
    bonuses: ['Relics grant +attack to all military', 'Gold miners work faster with fewer than 3 on a mine', 'Leitis immune to monk conversion resistance bonus', 'Strong Castle Age spike'],
    strongUnits: ['knights'], weakUnits: [],
    tags: ['cavalryCiv', 'fastFeudal'], blurb: 'Relic-fueled attack bonuses supercharge an already strong cavalry game.' },

  { id: 'magyars', name: 'Magyars', uniqueUnits: [{ name: 'Magyar Huszar', class: 'scouts' }],
    uniqueTechs: ['Corvinian Army', 'Recurve Bow'], teamBonus: 'Scout line +1/+2 line of sight',
    bonuses: ['Free Stable upgrades (Bloodlines/Husbandry)', 'Villagers deal +1 attack vs. enemy units', 'Cavalry Archers train faster', 'Strong raiding scouts'],
    strongUnits: ['scouts', 'knights', 'cavalryArchers'], weakUnits: [],
    tags: ['cavalryCiv', 'fastFeudal'], blurb: 'Aggressive raiding cavalry backed by unusually tough villagers.' },

  { id: 'malay', name: 'Malay', uniqueUnits: [{ name: 'Karambit Warrior', class: 'infantry' }],
    uniqueTechs: ['Forced Levy', 'Thalassocracy'], teamBonus: 'Dock techs cost -50% and research instantly',
    bonuses: ['Buildings cost less wood', 'Ships build faster', 'Battle Elephants cost less', 'Instant Feudal/Castle/Imperial Age advance eligibility (cheap ages)'],
    strongUnits: ['infantry', 'navy'], weakUnits: [],
    tags: ['fastFeudal', 'navalCiv'], blurb: 'Cheap everything lets Malay hit age-ups and elephant timings very early.' },

  { id: 'malians', name: 'Malians', uniqueUnits: [{ name: 'Gbeto', class: 'infantry' }],
    uniqueTechs: ['Farimba', 'Tigui'], teamBonus: 'Pikeman-line +1/+2 attack',
    bonuses: ['Pit mines give bonus gold', 'Buildings cost less wood', 'Farms give more food and cost less', 'Gbeto strong anti-archer skirmisher-infantry'],
    strongUnits: ['infantry', 'archers', 'spearmen'], weakUnits: [],
    tags: ['boomer', 'infantryCiv'], blurb: 'Efficient economy funds anti-archer Gbeto spam and solid infantry.' },

  { id: 'mayans', name: 'Mayans', uniqueUnits: [{ name: 'Plumed Archer', class: 'archers' }],
    uniqueTechs: ['El Dorado', 'Obsidian Arrows'], teamBonus: 'Resources last 5% longer',
    bonuses: ['Resources give more per hit (no Feudal food bonus needed)', 'Archers cost no gold', 'Eagle Warriors cost less', 'Start with extra resources'],
    strongUnits: ['archers', 'eagles'], weakUnits: ['knights'],
    tags: ['archerCiv', 'boomer', 'fastFeudal'], blurb: 'Gold-free archers and cheap eagles let Mayans mass an army for less.' },

  { id: 'mongols', name: 'Mongols', uniqueUnits: [{ name: 'Mangudai', class: 'cavalryArchers' }],
    uniqueTechs: ['Nomads', 'Drill'], teamBonus: 'Scout Cavalry line +2 attack vs. standard buildings',
    bonuses: ['Hunters gather faster and carry more', 'Cavalry Archers +range', 'Siege units pack/unpack instantly', 'Very fast Feudal timing'],
    strongUnits: ['cavalryArchers', 'siege', 'scouts'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv', 'siegeCiv'], blurb: 'Elite hit-and-run cavalry archers backed by mobile siege.' },

  { id: 'persians', name: 'Persians', uniqueUnits: [{ name: 'War Elephant', class: 'knights' }],
    uniqueTechs: ['Mahouts', 'Kamandaran'], teamBonus: 'Trade generates +1 extra gold',
    bonuses: ['Town Centers/Docks cost less wood', 'Start with extra food/gold', 'Knights cost less food/gold', 'Powerful late-game War Elephants'],
    strongUnits: ['knights', 'siege'], weakUnits: [],
    tags: ['boomer', 'cavalryCiv'], blurb: 'A faster start snowballs into cheap knights and eventually huge War Elephants.' },

  { id: 'poles', name: 'Poles', uniqueUnits: [{ name: 'Obuch', class: 'infantry' }],
    uniqueTechs: ['Folwark', 'Szlachta Privileges'], teamBonus: 'Scout line +2 pierce armor once Feudal',
    bonuses: ['Folwark building generates passive food/gold', 'Stone cost for walls/towers reduced', 'Knight line upgrades cost less', 'Obuch ignores a big chunk of armor'],
    strongUnits: ['infantry', 'knights'], weakUnits: [],
    tags: ['boomer', 'turtle'], blurb: 'A unique passive economy building frees up villagers for a strong knight/infantry push.' },

  { id: 'portuguese', name: 'Portuguese', uniqueUnits: [{ name: 'Organ Gun', class: 'siege' }],
    uniqueTechs: ['Carrack', 'Arquebus'], teamBonus: 'Gold from Relics/Trade +30%',
    bonuses: ['Technologies cost less gold', 'Ships have more line of sight/HP', 'Feitoria wonder building for passive resources', 'Cannons/gunpowder cheaper'],
    strongUnits: ['gunpowder', 'navy'], weakUnits: [],
    tags: ['navalCiv', 'lateGameSpike'], blurb: 'Cheap technologies and a strong navy build toward a gunpowder-heavy late game.' },

  { id: 'romans', name: 'Romans', uniqueUnits: [{ name: 'Legionary', class: 'infantry' }],
    uniqueTechs: ['Comitatenses', 'Ballistas'], teamBonus: 'Villagers deal +50% damage vs. Wild Boar',
    bonuses: ['Town Centers fire arrows earlier and harder', 'Ballistics researched free', 'Siege units cost less', 'Legionaries bonus vs. buildings/UUs'],
    strongUnits: ['infantry', 'siege'], weakUnits: [],
    tags: ['infantryCiv', 'siegeCiv', 'turtle'], blurb: 'Defensive Town Centers and cheap siege back up sturdy infantry.' },

  { id: 'saracens', name: 'Saracens', uniqueUnits: [{ name: 'Mameluke', class: 'camels' }],
    uniqueTechs: ['Madrasah', 'Zealotry'], teamBonus: 'Market trade fees reduced',
    bonuses: ['Trade generates extra gold', 'Transport Ships +capacity/HP', 'Fire Ships +attack', 'Market buy/sell fees reduced'],
    strongUnits: ['camels', 'navy', 'archers'], weakUnits: [],
    tags: ['navalCiv', 'cavalryCiv'], blurb: 'Strong trade economy funding Mamelukes and a capable navy.' },

  { id: 'sicilians', name: 'Sicilians', uniqueUnits: [{ name: 'Serjeant', class: 'infantry' }],
    uniqueTechs: ['Donjon', 'First Crusade'], teamBonus: 'Farms cost -45 wood',
    bonuses: ['No Blacksmith food/wood upkeep on armor techs', 'Cheaper transport ships', 'Extra food from first Town Center', 'Serjeants can garrison in Donjons for ranged defense'],
    strongUnits: ['infantry'], weakUnits: [],
    tags: ['turtle', 'boomer'], blurb: 'Cost-efficient upgrades and a unique defensive building make Sicilians hard to crack.' },

  { id: 'slavs', name: 'Slavs', uniqueUnits: [{ name: 'Boyar', class: 'knights' }],
    uniqueTechs: ['Druzhina', 'Orthodoxy'], teamBonus: 'Siege Workshops cost -50% wood',
    bonuses: ['Farms cost less food to build', 'Military buildings cost less wood/stone', 'Siege units +bonus attack', 'Very high pierce-armor Boyars'],
    strongUnits: ['knights', 'siege', 'infantry'], weakUnits: [],
    tags: ['boomer', 'siegeCiv'], blurb: 'Cheap buildings feed strong siege and heavily-armored Boyar cavalry.' },

  { id: 'spanish', name: 'Spanish', uniqueUnits: [{ name: 'Conquistador', class: 'gunpowder' }],
    uniqueTechs: ['Inquisition', 'Supremacy'], teamBonus: 'Builders work 30% faster',
    bonuses: ['Builders work faster', 'Gold miners gather more', 'Cannons/hand cannon units fire faster', 'Strong late-game gunpowder + cavalry combo'],
    strongUnits: ['gunpowder', 'knights'], weakUnits: [],
    tags: ['lateGameSpike', 'cavalryCiv'], blurb: 'Fast construction and efficient gold funnel into a devastating late-game army.' },

  { id: 'tatars', name: 'Tatars', uniqueUnits: [{ name: 'Keshik', class: 'knights' }],
    uniqueTechs: ['Silk Road', 'Timurid Siegecraft'], teamBonus: 'Cavalry Archers +1/+2 attack',
    bonuses: ['Sheep/relics give bonus resources', 'Cavalry Archers get elite-tier stats without the upgrade', 'Free Thumb Ring', 'Keshiks generate gold when they deal damage'],
    strongUnits: ['cavalryArchers', 'knights'], weakUnits: [],
    tags: ['fastFeudal', 'cavalryCiv'], blurb: 'Self-funding Keshiks and strong Cavalry Archers make for relentless mobile aggression.' },

  { id: 'teutons', name: 'Teutons', uniqueUnits: [{ name: 'Teutonic Knight', class: 'infantry' }],
    uniqueTechs: ['Ironclad', 'Crenellations'], teamBonus: 'Farm upgrades free',
    bonuses: ['Farms give more food', 'Monks heal instantly, cost less', 'Murder Holes free (garrisoned buildings attack)', 'Very tanky heavy infantry'],
    strongUnits: ['infantry', 'monks'], weakUnits: [],
    tags: ['turtle', 'infantryCiv'], blurb: 'Slow but extremely durable — built to grind out defensive, high-armor fights.' },

  { id: 'turks', name: 'Turks', uniqueUnits: [{ name: 'Janissary', class: 'gunpowder' }],
    uniqueTechs: ['Sipahi', 'Süleymaniye'], teamBonus: 'Gunpowder units cost -25% gold',
    bonuses: ['Gunpowder units +attack', 'Free Chemistry/Siege Engineers', 'Gold miners gather more', 'Cheaper gunpowder for the whole team'],
    strongUnits: ['gunpowder', 'siege'], weakUnits: [],
    tags: ['lateGameSpike', 'siegeCiv'], blurb: 'Weaker early on, but scales into the strongest gunpowder army in the game.' },

  { id: 'vietnamese', name: 'Vietnamese', uniqueUnits: [{ name: 'Rattan Archer', class: 'archers' }],
    uniqueTechs: ['Chatras', 'Paper Money'], teamBonus: 'Reveals enemy Imperial Age civilization',
    bonuses: ['Extra line of sight', 'Town Centers fire more arrows and have more HP', 'Imperial Skirmisher upgrade free', 'Rattan Archers very high HP for their cost'],
    strongUnits: ['archers'], weakUnits: [],
    tags: ['archerCiv', 'trashWarCiv', 'turtle'], blurb: 'High-HP archers and tough Town Centers make Vietnamese hard to punch through.' },

  { id: 'vikings', name: 'Vikings', uniqueUnits: [{ name: 'Berserk', class: 'infantry' }],
    uniqueTechs: ['Chieftains', 'Berserkergang'], teamBonus: 'Warships cost -20%',
    bonuses: ['Free Wheelbarrow/Hand Cart', 'Warships cost less', 'Docks built instantly', 'Infantry armor upgrades cost no gold'],
    strongUnits: ['infantry', 'navy'], weakUnits: [],
    tags: ['infantryCiv', 'navalCiv'], blurb: 'A famously efficient economy fuels cheap infantry and a strong navy.' },

  { id: 'bohemians', name: 'Bohemians', uniqueUnits: [{ name: 'Hussite Wagon', class: 'siege' }],
    uniqueTechs: ['Wagenburg Tactics', 'Hillside Taborites'], teamBonus: 'University techs cost -30%',
    bonuses: ['Villagers fight noticeably better when attacked', 'Blacksmith upgrades cost less', 'Houses cost nothing and support more pop', 'Strong Hussite Wagon siege-line hybrid'],
    strongUnits: ['siege', 'gunpowder', 'infantry'], weakUnits: [],
    tags: ['turtle', 'siegeCiv'], blurb: 'Villagers that punch back and cheap houses support a defensive, siege-heavy game.' },
];

function getCiv(id) {
  return CIVS.find((c) => c.id === id);
}
