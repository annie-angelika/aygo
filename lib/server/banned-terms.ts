// The word lists behind lib/server/moderation.ts, kept apart so the matcher
// reads cleanly and the lists can be reviewed/extended on their own. Entries
// are NORMALIZED (lowercase, accents stripped except ñ, single spaces) — see
// `normalizeForModeration`. Whole-word/phrase matching only.

import "server-only";

/** Banned words and phrases (ES/EN profanity, slurs, sexual services, illegal offerings). */
export const BANNED: readonly string[] = [
  // --- Spanish profanity (Bolivia / LatAm / general) ---
  "puta", "putas", "puto", "putos", "putita", "putito", "putamadre", "puta madre",
  "reputa", "reputisima", "reputisimo", "hijo de puta", "hija de puta", "hijos de puta",
  "hijodeputa", "hijadeputa", "hijueputa", "hijueputas", "jueputa", "la gran puta",
  "hijo de perra", "hija de perra", "hijos de perra", "mierda", "mierdas", "comemierda",
  "come mierda", "carajo", "carajos", "cabron", "cabrona", "cabrones", "culiao", "culiado",
  "culiada", "culiaos", "qliao", "culiar", "culear", "culiando", "culeando", "cagon", "cagona",
  "cojudo", "cojuda", "cojudos", "cojudas", "cojudez", "cojudeces", "pendejo", "pendeja",
  "pendejos", "pendejas", "pendejada", "pendejadas", "verga", "vergas", "careverga",
  "a la verga", "vete a la verga", "andate a la verga", "me vale verga", "valeverga",
  "chupala", "chupame", "chupamela", "chupapija", "chupaverga", "chupapollas", "chupapinga",
  "mamahuevo", "mamaguevo", "mamaguevos", "mamaverga", "mamada", "mamadas", "lameculos",
  "huevon", "huevona", "huevones", "guevon", "guevona", "webon", "webona", "weon", "weona",
  "coño", "coños", "joder", "jodete", "chinga", "chingar", "chingada", "chingado", "chingados",
  "chingate", "chingatumadre", "chinga tu madre", "chingue a su madre", "culo", "culos",
  "culero", "culera", "culeros", "ojete", "pelotudo", "pelotuda", "pelotudos", "pelotudas",
  "pelotudez", "gilipollas", "malparido", "malparida", "malparidos", "carechimba",
  "conchatumadre", "conchetumadre", "conchesumadre", "conchasumadre", "concha de tu madre",
  "concha de su madre", "la concha de tu madre", "la concha de su madre", "chuchatumadre",
  "chucha tu madre", "chucha de tu madre", "pichula", "pichulas", "follar", "follando",
  "follada", "ramera", "rameras",
  // --- Spanish slurs (homophobic / transphobic / ethnic / ableist) ---
  "maricon", "maricones", "maricona", "mariconazo", "mariconada", "trolo", "trolos", "joto",
  "jotos", "fleto", "fletos", "travelo", "marimacho", "marimacha", "tortillera", "bollera",
  "sudaca", "sudacas", "mongolo", "mongola", "mongolico", "mongolica", "mogolico", "mogolica",
  "subnormal",
  // --- English profanity ---
  "fuck", "fucks", "fucked", "fucker", "fuckers", "fucking", "fuckin", "motherfucker",
  "motherfuckers", "motherfucking", "fck", "fcking", "fcker", "shit", "shits", "shitty", "bullshit", "shithead",
  "shithole", "ass", "asshole", "assholes", "arse", "arsehole", "bitch", "bitches", "bastard",
  "bastards", "cunt", "cunts", "dickhead", "dickheads", "cocksucker", "cocksuckers", "pussy",
  "whore", "whores", "slut", "sluts", "twat", "twats", "wanker", "wankers", "jackass",
  "dumbass", "blowjob", "blowjobs", "handjob", "handjobs", "titties", "cumshot",
  // --- English slurs ---
  "nigger", "niggers", "nigga", "niggas", "faggot", "faggots", "fag", "fags", "dyke", "dykes",
  "tranny", "trannies", "shemale", "retard", "retards", "retarded", "spic", "spics", "wetback",
  "wetbacks", "chink", "chinks", "kike", "kikes", "gook", "gooks", "beaner", "beaners",
  "raghead", "towelhead", "paki",
  // --- Adult-only / sexual services (ES + EN) ---
  "porn", "porno", "pornografia", "pornography", "xxx", "orgia", "orgias", "orgy", "orgies",
  "gangbang", "bukkake", "milf", "dildo", "dildos", "onlyfans", "camgirl", "camgirls",
  "sexo en vivo", "sexo explicito", "striptease", "stripper", "strippers", "table dance",
  "escort", "escorts", "escort service", "servicio de escorts", "servicios de escort",
  "servicios sexuales", "servicio sexual", "sexual services", "dama de compañia",
  "damas de compañia", "masaje erotico", "masajes eroticos", "masaje con final feliz",
  "masajes con final feliz", "happy ending massage", "prostitucion", "prostituta",
  "prostitutas", "prostibulo", "prostibulos", "burdel", "burdeles", "lenocinio",
  // --- Illegal offerings: drugs / weapons (phrases only; bare nouns are used innocently) ---
  "venta de cocaina", "vendo cocaina", "vendemos cocaina", "compra de cocaina",
  "venta de droga", "venta de drogas", "vendo droga", "vendo drogas", "venta de marihuana",
  "vendo marihuana", "venta de pasta base", "vendo pasta base", "venta de lsd", "vendo lsd",
  "venta de extasis", "vendo extasis", "venta de mdma", "vendo mdma", "narcomenudeo",
  "cocaine for sale", "selling cocaine", "buy cocaine", "drugs for sale", "selling drugs",
  "buy drugs", "weed for sale", "selling weed", "mdma for sale", "selling mdma", "drug dealer",
  "venta de armas", "vendo armas", "armas sin papeles", "guns for sale", "selling guns",
];

/** Innocent words that would otherwise collide with a banned term. */
export const ALLOWLIST: readonly string[] = [
  "class", "classes", "bass", "glass", "assist", "cumbia", "cumbre", "canal", "analisis",
  "cocktail", "peacock", "shiitake", "title", "titles", "scunthorpe",
  "asado", "cumbiancha", "cumbieros", "cumbiero", "analista", "analistas",
  "peñarol", "sexto", "sexta", "sextos", "sextas", "sexteto", "dique", "diques", "pico",
  "picos", "coca", "cocas", "concha", "conchas", "cocada", "cocadas",
];
