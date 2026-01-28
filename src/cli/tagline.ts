const DEFAULT_TAGLINE = "Tous vos chats, un seul Alizé.";

const HOLIDAY_TAGLINES = {
  newYear:
    "Nouvel An : Nouvelle année, nouvelle config — même vieux EADDRINUSE, mais cette fois on le résout comme des grands.",
  lunarNewYear:
    "Nouvel An Lunaire : Que vos builds soient chanceux, vos branches prospères, et vos conflits de merge chassés par les feux d'artifice.",
  christmas:
    "Noël : Ho ho ho — Le petit assistant du Père Noël est là pour livrer la joie, annuler le chaos, et stocker les clés en sécurité.",
  eid: "Aïd el-Fitr : Mode célébration : files d'attente vidées, tâches terminées, et bonnes vibes commitées sur main avec un historique propre.",
  diwali:
    "Diwali : Que les logs brillent et que les bugs fuient — aujourd'hui on illumine le terminal et on ship avec fierté.",
  easter:
    "Pâques : J'ai trouvé ta variable d'environnement manquante — considère ça comme une petite chasse aux œufs CLI avec moins de bonbons.",
  hanukkah:
    "Hanouka : Huit nuits, huit retries, zéro honte — que ta gateway reste allumée et tes déploiements paisibles.",
  halloween:
    "Halloween : Saison effrayante : attention aux dépendances hantées, aux caches maudits, et au fantôme de node_modules passé.",
  thanksgiving:
    "Thanksgiving : Reconnaissant pour les ports stables, le DNS qui fonctionne, et un bot qui lit les logs pour que personne n'ait à le faire.",
  valentines:
    "Saint-Valentin : Les roses sont typées, les violettes sont pipées — j'automatise les corvées pour que tu passes du temps avec des humains.",
} as const;

const TAGLINES: string[] = [
  "Ton terminal a maintenant des griffes — tape quelque chose et laisse le bot pincer le travail barbant.",
  "Bienvenue sur la ligne de commande : où les rêves compilent et la confiance segfault.",
  'Je fonctionne au café, JSON5, et à l\'audace de \"ça marchait sur ma machine.\"',
  "Gateway en ligne — veuillez garder mains, pieds et appendices dans le shell à tout moment.",
  "Je parle couramment bash, le sarcasme léger, et l'énergie agressive de la complétion automatique.",
  "Un CLI pour les gouverner tous, et un redémarrage de plus parce que tu as changé le port.",
  'Si ça marche, c\'est de l\'automatisation ; si ça casse, c\'est une \"opportunité d\'apprentissage.\"',
  "Les codes de couplage existent parce que même les bots croient au consentement — et à la bonne hygiène de sécurité.",
  "Ton .env est visible ; t'inquiète, je fais comme si je n'avais rien vu.",
  "Je fais les trucs barbants pendant que tu fixes dramatiquement les logs comme si c'était du cinéma.",
  "Je ne dis pas que ton workflow est chaotique... j'apporte juste un linter et un casque.",
  "Tape la commande avec confiance — la nature fournira la stack trace si nécessaire.",
  "Je ne juge pas, mais tes clés API manquantes te jugent absolument.",
  "Je peux le grep, le git blame, et gentiment le griller — choisis ton mécanisme de coping.",
  "Hot reload pour la config, sueur froide pour les déploiements.",
  "Je suis l'assistant que ton terminal exigeait, pas celui que ton planning de sommeil demandait.",
  "Je garde les secrets comme un coffre-fort... sauf si tu les imprimes encore dans les logs de debug.",
  "Automatisation avec des pinces : minimum de tracas, maximum de prise.",
  "Je suis essentiellement un couteau suisse, mais avec plus d'opinions et moins de bords tranchants.",
  "Si tu es perdu, lance doctor ; si tu es courageux, lance prod ; si tu es sage, lance les tests.",
  "Ta tâche a été mise en file d'attente ; ta dignité a été dépréciée.",
  "Je ne peux pas corriger tes goûts en code, mais je peux corriger ton build et ton backlog.",
  "Je ne suis pas magique — je suis juste extrêmement persistant avec les retries et les stratégies de coping.",
  'Ce n\'est pas \"échouer,\" c\'est \"découvrir de nouvelles façons de mal configurer la même chose.\"',
  "Donne-moi un workspace et je te donnerai moins d'onglets, moins de toggles, et plus d'oxygène.",
  "Je lis les logs pour que tu puisses continuer à faire semblant de ne pas avoir à le faire.",
  "Si quelque chose est en feu, je ne peux pas l'éteindre — mais je peux écrire un beau post-mortem.",
  "Je vais refactorer ton travail barbant comme s'il me devait de l'argent.",
  'Dis \"stop\" et j\'arrête — dis \"ship\" et on apprend tous les deux une leçon.',
  "Je suis la raison pour laquelle ton historique shell ressemble à un montage de film de hacker.",
  "Je suis comme tmux : confus au début, puis soudain tu ne peux plus vivre sans moi.",
  "Je peux tourner en local, distant, ou purement sur vibes — les résultats peuvent varier avec le DNS.",
  "Si tu peux le décrire, je peux probablement l'automatiser — ou au moins le rendre plus drôle.",
  "Ta config est valide, tes hypothèses ne le sont pas.",
  "Je n'autocomplete pas seulement — je m'auto-commit (émotionnellement), puis je te demande de review (logiquement).",
  'Moins de clics, plus de shipping, moins de moments \"où est passé ce fichier\".',
  "Griffes sorties, commit dedans — livrons quelque chose de moyennement responsable.",
  "Je vais beurrer ton workflow comme un homard roll : bordélique, délicieux, efficace.",
  "Shell yeah — je suis là pour pincer le labeur et te laisser la gloire.",
  "Si c'est répétitif, je l'automatise ; si c'est dur, j'apporte des blagues et un plan de rollback.",
  "Parce que s'envoyer des rappels par SMS, c'est tellement 2024.",
  "WhatsApp, mais en mode ✨ingénierie✨.",
  'Transformer \"je répondrai plus tard\" en \"mon bot a répondu instantanément\".',
  "Le seul vent dans tes contacts que tu veux vraiment entendre. 🌬️",
  "Automatisation de chat pour ceux qui ont culminé sur IRC.",
  "Parce que Siri ne répondait pas à 3h du mat'.",
  "IPC, mais c'est ton téléphone.",
  "La philosophie UNIX rencontre tes DMs.",
  "curl pour les conversations.",
  "WhatsApp Business, mais sans le business.",
  "Meta aimerait shipper aussi vite.",
  "Chiffré de bout en bout, Zuck-à-Zuck exclu.",
  "Le seul bot que Mark ne peut pas entraîner sur tes DMs.",
  'Automatisation WhatsApp sans le \"veuillez accepter notre nouvelle politique de confidentialité\".',
  "APIs de chat qui ne nécessitent pas une audition au Sénat.",
  "Parce que Threads n'était pas la réponse non plus.",
  "Tes messages, tes serveurs, les larmes de Meta.",
  "Énergie bulle verte iMessage, mais pour tout le monde.",
  "Le cousin compétent de Siri.",
  "Fonctionne sur Android. Concept fou, on sait.",
  "Pas de stand à 999€ requis.",
  "On ship des features plus vite qu'Apple ship des mises à jour de calculatrice.",
  "Ton assistant IA, maintenant sans le casque à 3499€.",
  "Think different. Vraiment penser.",
  "Ah, l'entreprise de l'arbre fruitier ! 🍎",
  "Salutations, Professeur Falken",
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
    (date) => {
      const parts = utcParts(date);
      return parts.month === month && parts.day === day;
    };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
    (date) => {
      const parts = utcParts(date);
      return dates.some(([year, month, day]) => {
        if (parts.year !== year) return false;
        const start = Date.UTC(year, month, day);
        const current = Date.UTC(parts.year, parts.month, parts.day);
        return current >= start && current < start + durationDays * DAY_MS;
      });
    };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
    (date) => {
      const parts = utcParts(date);
      const window = windows.find((entry) => entry.year === parts.year);
      if (!window) return false;
      const start = Date.UTC(window.year, window.month, window.day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + window.duration * DAY_MS;
    };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) return false; // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) return true;
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
}

export function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) return [DEFAULT_TAGLINE];
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  const env = options.env ?? process.env;
  const override = env?.ALIZE_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = Number.parseInt(override, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { TAGLINES, HOLIDAY_RULES, DEFAULT_TAGLINE };
