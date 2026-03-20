/**
 * Bible Word Wise Vocabulary
 * level 1 = hardest (shown even on "fewest hints")
 * level 2 = intermediate (shown on middle setting)
 * level 3 = somewhat difficult (shown on "most hints")
 *
 * Format: { word: { def: "short definition", level: 1|2|3 } }
 */
export const BIBLE_VOCAB = {
  // ── Level 1: Theological / Archaic (hardest) ──────────────────────────────
  propitiation:      { def: "appeasing God's wrath", level: 1 },
  expiation:         { def: "removal of guilt by sacrifice", level: 1 },
  imputation:        { def: "crediting sin or righteousness to another", level: 1 },
  predestination:    { def: "God's foreordaining of events", level: 1 },
  foreordained:      { def: "decided by God in advance", level: 1 },
  sanctification:    { def: "process of becoming holy", level: 1 },
  justification:     { def: "declared righteous before God", level: 1 },
  propitiatory:      { def: "making atonement for sin", level: 1 },
  circumcision:      { def: "cutting of foreskin as covenant sign", level: 1 },
  theophany:         { def: "visible manifestation of God", level: 1 },
  eschatology:       { def: "study of end times", level: 1 },
  soteriology:       { def: "doctrine of salvation", level: 1 },
  pneumatology:      { def: "doctrine of the Holy Spirit", level: 1 },
  dispensation:      { def: "era of God's dealing with humanity", level: 1 },
  kenosis:           { def: "Christ's self-emptying in incarnation", level: 1 },
  hypostatic:        { def: "relating to two natures of Christ", level: 1 },
  omniscience:       { def: "all-knowing", level: 1 },
  omnipotence:       { def: "all-powerful", level: 1 },
  omnipresence:      { def: "present everywhere", level: 1 },
  shekinah:          { def: "God's glorious presence", level: 1 },
  tabernacle:        { def: "portable sanctuary for God", level: 1 },
  ephod:             { def: "priestly garment worn over robe", level: 1 },
  urim:              { def: "sacred lot for divine guidance", level: 1 },
  thummim:           { def: "sacred lot for divine guidance", level: 1 },
  phylacteries:      { def: "small boxes with scripture worn by Jews", level: 1 },
  sackcloth:         { def: "rough cloth worn in mourning", level: 1 },
  pentecost:         { def: "Jewish harvest festival; day of Holy Spirit", level: 1 },
  passover:          { def: "feast of Israel's exodus from Egypt", level: 1 },
  synagogue:         { def: "Jewish house of worship/assembly", level: 1 },
  sanhedrin:         { def: "Jewish ruling council", level: 1 },
  centurion:         { def: "Roman officer of 100 soldiers", level: 1 },
  anathema:          { def: "formally cursed; excommunicated", level: 1 },
  drachma:           { def: "Greek silver coin", level: 1 },
  denarius:          { def: "Roman silver coin (day's wage)", level: 1 },
  shekel:            { def: "Hebrew unit of weight and money", level: 1 },
  cubit:             { def: "ancient measure (~18 inches)", level: 1 },
  myrrh:             { def: "bitter aromatic resin used in burial", level: 1 },
  frankincense:      { def: "fragrant resin burned as incense", level: 1 },
  spikenard:         { def: "expensive aromatic ointment", level: 1 },
  alabaster:         { def: "white stone used for perfume jars", level: 1 },
  scepter:           { def: "staff symbolizing royal authority", level: 1 },
  threshing:         { def: "separating grain from stalks", level: 1 },
  winnowing:         { def: "blowing away chaff from grain", level: 1 },
  oblation:          { def: "offering made to God", level: 1 },
  supplication:      { def: "humble prayer or petition", level: 1 },
  intercession:      { def: "praying on behalf of others", level: 1 },
  consecration:      { def: "setting apart as sacred", level: 1 },
  ordination:        { def: "authorizing someone for ministry", level: 1 },
  libation:          { def: "liquid poured as offering to God", level: 1 },
  firstfruits:       { def: "first portion of harvest offered to God", level: 1 },
  tithe:             { def: "tenth part given to God", level: 1 },
  manna:             { def: "miraculous bread from heaven", level: 1 },
  praetorium:        { def: "governor's official residence", level: 1 },
  golgotha:          { def: "\"Place of the Skull\"; site of crucifixion", level: 1 },
  gethsemane:        { def: "olive garden where Jesus prayed", level: 1 },
  gehenna:           { def: "place of eternal punishment; hell", level: 1 },
  sheol:             { def: "realm of the dead (Hebrew concept)", level: 1 },
  hades:             { def: "realm of the dead (Greek concept)", level: 1 },
  incarnation:       { def: "God becoming human in Jesus", level: 1 },
  atonement:         { def: "reconciliation between God and man through sacrifice", level: 1 },

  // ── Level 2: Important Biblical Terms ────────────────────────────────────
  covenant:          { def: "solemn binding agreement with God", level: 2 },
  righteousness:     { def: "being morally right before God", level: 2 },
  righteous:         { def: "morally right; in right standing with God", level: 2 },
  redemption:        { def: "being freed by payment of a price", level: 2 },
  redeemer:          { def: "one who buys freedom for another", level: 2 },
  salvation:         { def: "deliverance from sin and death", level: 2 },
  sanctify:          { def: "to make holy; set apart for God", level: 2 },
  glorify:           { def: "to honor and praise God; make glorious", level: 2 },
  glorified:         { def: "raised to divine glory", level: 2 },
  transgression:     { def: "going beyond God's law; sin", level: 2 },
  iniquity:          { def: "great wickedness or injustice", level: 2 },
  repentance:        { def: "turning away from sin toward God", level: 2 },
  repent:            { def: "to turn away from sin", level: 2 },
  reconcile:         { def: "to restore a broken relationship", level: 2 },
  reconciliation:    { def: "restored relationship between God and man", level: 2 },
  anoint:            { def: "to pour oil on as sign of God's choice", level: 2 },
  anointed:          { def: "chosen and empowered by God", level: 2 },
  apostle:           { def: "one sent by Jesus with authority", level: 2 },
  prophet:           { def: "one who speaks God's message", level: 2 },
  prophecy:          { def: "message spoken on God's behalf", level: 2 },
  parable:           { def: "short story teaching a spiritual truth", level: 2 },
  baptism:           { def: "ritual washing symbolizing new life", level: 2 },
  resurrection:      { def: "rising from death to new life", level: 2 },
  ascension:         { def: "Jesus rising bodily into heaven", level: 2 },
  tribulation:       { def: "great suffering and trial", level: 2 },
  dominion:          { def: "power and authority to rule", level: 2 },
  sovereign:         { def: "having supreme authority", level: 2 },
  sovereignty:       { def: "supreme power and authority", level: 2 },
  mediator:          { def: "one who brings two parties together", level: 2 },
  advocate:          { def: "one who pleads another's case", level: 2 },
  intercede:         { def: "to pray on behalf of others", level: 2 },
  consecrate:        { def: "to dedicate solemnly to God", level: 2 },
  exaltation:        { def: "being raised to highest honor", level: 2 },
  exalt:             { def: "to raise to highest honor", level: 2 },
  wrath:             { def: "intense divine anger against sin", level: 2 },
  desolation:        { def: "state of ruin and emptiness", level: 2 },
  abomination:       { def: "something deeply offensive to God", level: 2 },
  blasphemy:         { def: "speaking irreverently about God", level: 2 },
  blaspheme:         { def: "to speak with contempt about God", level: 2 },
  idolatry:          { def: "worship of idols or false gods", level: 2 },
  idol:              { def: "false god or object of worship", level: 2 },
  circumspect:       { def: "careful; watchful of all circumstances", level: 2 },
  heathen:           { def: "those who don't know God; pagans", level: 2 },
  gentile:           { def: "non-Jewish person", level: 2 },
  pharisee:          { def: "strict Jewish religious leader", level: 2 },
  sadducee:          { def: "Jewish leader rejecting resurrection", level: 2 },
  scribe:            { def: "Jewish expert in religious law", level: 2 },
  levi:              { def: "tribe of Israel set apart for priesthood", level: 2 },
  levite:            { def: "member of priestly tribe of Levi", level: 2 },
  high:              { def: "", level: 2 }, // skip - too common
  priest:            { def: "one who offers sacrifices to God", level: 2 },
  altar:             { def: "raised structure for making offerings to God", level: 2 },
  gospel:            { def: "good news of Jesus Christ", level: 2 },
  testament:         { def: "covenant; the two divisions of Scripture", level: 2 },
  scripture:         { def: "sacred writings; the Bible", level: 2 },
  messiah:           { def: "God's anointed deliverer; Christ", level: 2 },
  christ:            { def: "\"Anointed One\"; Greek for Messiah", level: 2 },
  baptize:           { def: "to immerse in water as a ritual", level: 2 },
  disciple:          { def: "learner and follower of a teacher", level: 2 },
  repentant:         { def: "feeling regret and turning from sin", level: 2 },
  steadfast:         { def: "firmly fixed; unwavering in faith", level: 2 },
  steadfastness:     { def: "firm determination; perseverance", level: 2 },
  remnant:           { def: "small faithful group remaining", level: 2 },
  jubilee:           { def: "50th year of rest and restoration in Israel", level: 2 },
  sabbath:           { def: "day of rest commanded by God", level: 2 },
  ark:               { def: "chest/boat built according to God's design", level: 2 },
  exodus:            { def: "mass departure; Israel's leaving Egypt", level: 2 },
  plague:            { def: "disaster sent as divine judgment", level: 2 },
  locust:            { def: "swarming insect that destroys crops", level: 2 },

  // ── Level 3: Somewhat Difficult / Less Common ─────────────────────────────
  grace:             { def: "undeserved favor from God", level: 3 },
  mercy:             { def: "compassion shown to the undeserving", level: 3 },
  humble:            { def: "not proud; submissive to God", level: 3 },
  humility:          { def: "modest view of oneself before God", level: 3 },
  solemn:            { def: "serious and sincere; ceremonially sacred", level: 3 },
  sacred:            { def: "set apart as holy; dedicated to God", level: 3 },
  eternal:           { def: "without beginning or end; everlasting", level: 3 },
  wicked:            { def: "morally wrong; evil", level: 3 },
  wickedness:        { def: "evil behavior; moral corruption", level: 3 },
  blameless:         { def: "without fault; living correctly", level: 3 },
  upright:           { def: "morally good; honest before God", level: 3 },
  dwelling:          { def: "place of residence; where God lives", level: 3 },
  affliction:        { def: "pain or suffering; hardship", level: 3 },
  afflicted:         { def: "suffering pain or trouble", level: 3 },
  famine:            { def: "widespread severe food shortage", level: 3 },
  pestilence:        { def: "deadly disease spread through population", level: 3 },
  abundance:         { def: "very large quantity; more than enough", level: 3 },
  perish:            { def: "to die; to be destroyed eternally", level: 3 },
  forsake:           { def: "to abandon completely; leave behind", level: 3 },
  forsaken:          { def: "abandoned; left alone", level: 3 },
  lament:            { def: "expression of grief or sorrow", level: 3 },
  mourn:             { def: "to grieve; feel and express sorrow", level: 3 },
  mourning:          { def: "grief; sorrow for loss or sin", level: 3 },
  compassion:        { def: "deep sympathy and desire to help", level: 3 },
  fervent:           { def: "intensely earnest or passionate", level: 3 },
  fervently:         { def: "with great intensity or passion", level: 3 },
  diligence:         { def: "careful and persistent effort", level: 3 },
  diligent:          { def: "showing careful and steady effort", level: 3 },
  perseverance:      { def: "continuing despite difficulty", level: 3 },
  persevere:         { def: "to keep going despite hardship", level: 3 },
  rightful:          { def: "having a legitimate right or claim", level: 3 },
  everlasting:       { def: "lasting forever; eternal", level: 3 },
  glorify:           { def: "to give praise and honor to God", level: 3 },
  desolate:          { def: "barren; stripped of inhabitants", level: 3 },
  forsook:           { def: "past tense of forsake; abandoned", level: 3 },
  vanity:            { def: "emptiness; meaninglessness; pride", level: 3 },
  vain:              { def: "empty; worthless; without result", level: 3 },
  entrust:           { def: "to put in care of another", level: 3 },
  boast:             { def: "to brag; take pride in achievements", level: 3 },
  woe:               { def: "great sorrow or distress; expression of grief", level: 3 },
  lest:              { def: "for fear that; to avoid the risk that", level: 3 },
  behold:            { def: "look! see! (calling attention)", level: 3 },
  henceforth:        { def: "from this time forward", level: 3 },
  hitherto:          { def: "until now; up to this point", level: 3 },
  begotten:          { def: "brought into existence; fathered", level: 3 },
  abundance:         { def: "plentiful supply; more than enough", level: 3 },
  slaughter:         { def: "killing of many; sacrifice of animals", level: 3 },
  smite:             { def: "to strike hard; to defeat severely", level: 3 },
  smote:             { def: "past tense of smite; struck hard", level: 3 },
  smitten:           { def: "struck; beaten; afflicted", level: 3 },
  midst:             { def: "middle; surrounded by", level: 3 },
  chaff:             { def: "husks of grain; the worthless part", level: 3 },
  vineyard:          { def: "land planted with grapevines", level: 3 },
  threshing:         { def: "beating grain to separate it", level: 3 },
  sow:               { def: "to plant seeds", level: 3 },
  reap:              { def: "to harvest; to gain results of actions", level: 3 },
  flock:             { def: "group of sheep; congregation", level: 3 },
  shepherd:          { def: "one who tends sheep; God's care for people", level: 3 },
  yoke:              { def: "wooden bar joining two animals; burden", level: 3 },
  garment:           { def: "piece of clothing", level: 3 },
  cloak:             { def: "loose outer garment; covering", level: 3 },
  sandal:            { def: "simple foot covering; shoe", level: 3 },
  loin:              { def: "lower back and hip area; strength", level: 3 },
  loins:             { def: "area of hips; seat of strength or offspring", level: 3 },
  kindle:            { def: "to set on fire; to arouse", level: 3 },
  kindled:           { def: "set on fire; aroused (anger)", level: 3 },
  trespass:          { def: "sin against another; unlawful entry", level: 3 },
  trespasses:        { def: "sins; offenses against God or others", level: 3 },
  brethren:          { def: "brothers; fellow believers (archaic)", level: 3 },
  harlot:            { def: "prostitute; used figuratively for unfaithfulness", level: 3 },
  concubine:         { def: "secondary wife in ancient custom", level: 3 },
  genealogy:         { def: "list of ancestors; family history", level: 3 },
  leper:             { def: "person with leprosy; skin disease", level: 3 },
  leprosy:           { def: "serious skin disease in ancient times", level: 3 },
  withered:          { def: "dried up; lost strength or life", level: 3 },
  cistern:           { def: "underground tank for storing water", level: 3 },
  sepulchre:         { def: "tomb; burial chamber", level: 3 },
  sorrow:            { def: "deep distress; sadness over loss or sin", level: 3 },
};

/**
 * Get vocabulary entries to show based on level setting
 * setting 1 = fewest hints (only level 1 words)
 * setting 2 = medium (level 1 + 2)
 * setting 3 = most hints (level 1 + 2 + 3)
 */
export function getActiveVocab(setting) {
  const result = {};
  for (const [word, entry] of Object.entries(BIBLE_VOCAB)) {
    if (entry.level <= setting && entry.def) {
      result[word] = entry;
    }
  }
  return result;
}

/**
 * Tokenize a verse text into words + punctuation/spaces
 * Returns array of { text, word } where word is the clean lowercase word (or null)
 */
export function tokenizeVerse(text) {
  const tokens = [];
  // Split preserving spaces and punctuation
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, word: null });
    } else {
      // Strip leading/trailing punctuation to get clean word
      const clean = part.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase();
      tokens.push({ text: part, word: clean || null });
    }
  }
  return tokens;
}
