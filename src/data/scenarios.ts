export type Language = 'en' | 'ar';

export interface BilingualText {
  en: string;
  ar: string;
}

export type CallerMood = 'calm' | 'confused' | 'impatient' | 'furious' | 'sarcastic';

export type LineStatusCode =
  | 'pppoe_frozen'
  | 'red_los'
  | 'quota_exhausted'
  | 'port_stuck'
  | 'billing_hold'
  | 'high_attenuation'
  | 'power_unplugged'
  | 'line_healthy';

export type TrueResolution =
  | 'restart_router'
  | 'reset_port'
  | 'explain_billing'
  | 'dispatch_tech'
  | 'polite_close';

export type ActionId =
  | 'ask_id'
  | 'restart_router'
  | 'check_line'
  | 'deescalate'
  | 'reset_port'
  | 'explain_billing'
  | 'dispatch_tech'
  | 'polite_close';

export type AvatarStyle =
  | 'football_fan'
  | 'hajja'
  | 'engineer'
  | 'gamer'
  | 'auntie'
  | 'tech_skeptic'
  | 'job_applicant'
  | 'grandpa'
  | 'student'
  | 'mom'
  | 'doctor'
  | 'influencer'
  | 'painter_family'
  | 'tv_binge';

export interface RouterLightsState {
  power: 'green' | 'amber' | 'off';
  dsl: 'green' | 'blink_amber' | 'off';
  internet: 'green' | 'red' | 'blink_green' | 'off';
  los: 'red_blink' | 'off';
  wifi: 'green' | 'off';
}

export interface CallerScenario {
  id: string;
  name: BilingualText;
  role: BilingualText;
  avatar: AvatarStyle;
  accentColor: string;
  initialMood: CallerMood;
  initialPatience: number;
  decayPerSec: number;
  lineStatus: LineStatusCode;
  trueCause: TrueResolution;
  alsoAccepts?: TrueResolution[];
  alreadyRestartedBeforeCall: boolean;
  refusesIdInitially?: boolean;
  nationalId: string;
  packageTier: BilingualText;
  billingStatus: BilingualText;
  quotaText: BilingualText;
  attenuationDb: string;
  snrDb: string;
  initialLights: RouterLightsState;
  fixedLights: RouterLightsState;
  openingLine: BilingualText;
  idResponse: BilingualText;
  idRefusalLine?: BilingualText;
  lineCheckSummary: BilingualText;
  restartSuccessLine?: BilingualText;
  restartFailLine: BilingualText;
  deescalateLine: BilingualText;
  portResetLine: BilingualText;
  billingExplainLine: BilingualText;
  dispatchTechLine: BilingualText;
  politeCloseReadyLine: BilingualText;
  politeClosePrematureLine: BilingualText;
  hangupLine: BilingualText;
  victoryLogSummary: BilingualText;
}

export const MOOD_LABELS: Record<CallerMood, BilingualText> = {
  calm: { en: 'Calm', ar: 'هادي' },
  confused: { en: 'Confused', ar: 'تايه / محتار' },
  impatient: { en: 'Impatient', ar: 'مستعجل' },
  furious: { en: 'Furious', ar: 'متعصب جداً' },
  sarcastic: { en: 'Sarcastic', ar: 'ساخر' },
};

export const LINE_STATUS_LABELS: Record<LineStatusCode, BilingualText> = {
  pppoe_frozen: { en: 'PPPoE Session Hung', ar: 'جلسة الراوتر معلّقة' },
  red_los: { en: 'Red LOS Blinking', ar: 'لمبة LOS حمراء بتنور وتطفي' },
  quota_exhausted: { en: '100% Quota Throttled', ar: 'الباقة خلصانة (سرعة مخفضة)' },
  port_stuck: { en: 'DSLAM Port Stuck', ar: 'البورت معلّق في السنترال' },
  billing_hold: { en: 'Billing Sync Hold', ar: 'تعليق فاتورة / تجديد' },
  high_attenuation: { en: 'High Attenuation / Noise', ar: 'تشويش عالي على الخط' },
  power_unplugged: { en: 'Router Offline / Unplugged', ar: 'الراوتر فاصل باور' },
  line_healthy: { en: 'Line Healthy (Local Issue)', ar: 'الخط سليم ١٠٠٪' },
};

export const SCENARIOS: CallerScenario[] = [
  {
    id: 'medhat_match',
    name: { en: 'Captain Medhat', ar: 'كابتن مدحت' },
    role: { en: 'Die-hard Football Fan', ar: 'مشجع كورة متعصب' },
    avatar: 'football_fan',
    accentColor: '#16A34A',
    initialMood: 'impatient',
    initialPatience: 82,
    decayPerSec: 1.7,
    lineStatus: 'pppoe_frozen',
    trueCause: 'restart_router',
    alreadyRestartedBeforeCall: false,
    nationalId: '28604150103419',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '68% Remaining', ar: 'متبقي ٦٨٪' },
    attenuationDb: '18.4 dB',
    snrDb: '19.2 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Ya basha! The Champions League kickoff is in 3 minutes and the stream froze! Do something fast!',
      ar: 'يا باشا ماتش دوري الأبطال هيبدأ بعد ٣ دقايق والشاشة وقفت! الحقني بسرعة الله يخليك!',
    },
    idResponse: {
      en: 'Here, 28604150103419! Write it down quick, the referee already has the whistle in his mouth!',
      ar: 'اتفضل ٢٨٦٠٤١٥٠١٠٣٤١٩! اكتب بسرعة الحكم حاطط الصفارة في بوقه!',
    },
    lineCheckSummary: {
      en: 'Signal is clean (18.4 dB), but the router PPPoE session is frozen on an old IP.',
      ar: 'الإشارة ممتازة (١٨.٤ dB)، بس جلسة الـ PPPoE معلّقة على IP قديم ومحتاجة ريستارت.',
    },
    restartSuccessLine: {
      en: 'WOOHOO! The green light is back and the stream loaded right before kickoff! You are a hero, ya handasa!',
      ar: 'الله أكبر! اللمبة بقت خضرا والماتش اشتغل قبل الضربة الأولى! إنت برنس يا هندسة!',
    },
    restartFailLine: {
      en: 'Restarting...',
      ar: 'بنجرب الريستارت...',
    },
    deescalateLine: {
      en: 'Okay, okay, I am breathing... just please don’t make me miss the first goal!',
      ar: 'طيب حاضر هادي أهو... بس أبوس إيدك ما يروحش عليا الجول الأول!',
    },
    portResetLine: {
      en: 'I see the DSL light flickered, internet is still red on my box though! Maybe the router itself needs a power cycle?',
      ar: 'لمبة الـ DSL رَعشت، بس لمبة النت لسه حمرا عندي! يمكن الراوتر نفسه محتاج يتطفي ويشتغل؟',
    },
    billingExplainLine: {
      en: 'My bill is paid, bro! Why are we talking about invoices during stoppage time?!',
      ar: 'فاتورة إيه يا عم أنا دافع من أول الشهر! إنت بتكلمني في فواتير والماتش شغال؟!',
    },
    dispatchTechLine: {
      en: 'Wait 48 hours for a technician?! The final will be over by Tuesday!!',
      ar: 'فني بعد ٤٨ ساعة إيه يا فندم؟! البطولة هتخلص يوم التلات!!',
    },
    politeCloseReadyLine: {
      en: 'Enjoy the match, Captain Medhat! Thank you for calling Tele-Masr.',
      ar: 'مشاهدة ممتعة يا كابتن مدحت! شكراً لاتصالك بشركة تيلي-مصر.',
    },
    politeClosePrematureLine: {
      en: 'Don’t hang up on me! My screen is still spinning!!',
      ar: 'تقفل إيه يا عم؟! الشاشة لسه بتلف!!',
    },
    hangupLine: {
      en: 'GOAL MISSED! I’m switching to the neighbor’s Wi-Fi! *CLICK*',
      ar: 'الجول ضاع بسبَبك! أنا هفتح نت الجيران! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Saved Champions League kickoff with a clutch 10s router reboot.',
      ar: 'إنقاذ ماتش دوري الأبطال بريستارت ١٠ ثواني في الوقت بدل الضائع.',
    },
  },
  {
    id: 'hajja_samira',
    name: { en: 'Hajja Samira', ar: 'الحاجة سميرة' },
    role: { en: 'Worried Grandmother', ar: 'ست بيت طيبة' },
    avatar: 'hajja',
    accentColor: '#D97706',
    initialMood: 'confused',
    initialPatience: 90,
    decayPerSec: 1.2,
    lineStatus: 'red_los',
    trueCause: 'dispatch_tech',
    alreadyRestartedBeforeCall: false,
    nationalId: '25409020101182',
    packageTier: { en: 'Fiber Home 70 Mbps', ar: 'فايبر هوم ٧٠ ميجا' },
    billingStatus: { en: 'Paid · Auto-Renew', ar: 'مدفوعة · تجديد تلقائي' },
    quotaText: { en: '82% Remaining', ar: 'متبقي ٨٢٪' },
    attenuationDb: 'NO SIGNAL',
    snrDb: '0.0 dB',
    initialLights: { power: 'green', dsl: 'off', internet: 'off', los: 'red_blink', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'off', internet: 'off', los: 'red_blink', wifi: 'green' },
    openingLine: {
      en: 'My son, the little white box has a scary red light blinking like an ambulance! My grandson says the internet ran away!',
      ar: 'يا ابني الصندوق الأبيض بينوّر لمبة حمرا بتغمز زي عربية الإسعاف! حفيدي بيقولي النت هرب!',
    },
    idResponse: {
      en: 'Bless you my dear, let me get my reading glasses... 25409020101182. Did I read it right?',
      ar: 'ربنا يباركلك يا ابني ثواني أجيب النضارة... ٢٥٤٠٩٠٢٠١٠١١٨٢. كده صح يا ضنايا؟',
    },
    lineCheckSummary: {
      en: 'Optical Loss (LOS) alarm detected! The fiber cable outside is cut or bent. Needs field technician.',
      ar: 'تحذير قطع إشارة ضوئية (Red LOS)! سلك الفايبر الخارجي مقطوع ومحتاج فني صيانة.',
    },
    restartFailLine: {
      en: 'I unplugged it for 10 seconds like you said, dear... still blinking red like a traffic light!',
      ar: 'طفيته ١٠ ثواني زي ما قلتلي يا ابني... ولسه بينوّر أحمر زي إشارة المرور!',
    },
    deescalateLine: {
      en: 'You are so polite, may God bless your mother. Tell me what to do, my son.',
      ar: 'كلك ذوق يا ابني ربنا يبارك لوالدتك. قولي أعمل إيه وأنا معاك.',
    },
    portResetLine: {
      en: 'It didn’t change anything, dear. That red light is stubborn!',
      ar: 'ما حصلش حاجة يا ابني. اللمبة الحمرا دي عنيدة خالص!',
    },
    billingExplainLine: {
      en: 'My son pays the bill every month! Look at the red light, not the bill!',
      ar: 'ابني دافع الفاتورة والله يا بني! شوفلي اللمبة الحمرا دي إيه!',
    },
    dispatchTechLine: {
      en: 'Oh wonderful! So a nice technician will come check the cable outside? Thank you so much, my son!',
      ar: 'يا سلام! يعني المهندس هييجي يبص على السلك من بره؟ كتر ألف خيرك يا ابني ربنا يسعدك!',
    },
    politeCloseReadyLine: {
      en: 'Ticket logged for field visit. Take care, Hajja Samira!',
      ar: 'تم تسجيل زيارة الفني بنجاح. في رعاية الله يا حاجة سميرة!',
    },
    politeClosePrematureLine: {
      en: 'Wait, my grandson is still crying for his cartoons! Aren’t you sending someone?',
      ar: 'استنى يا ابني الواد لسه بيعيط عشان الكرتون! مش هتبعت حد؟',
    },
    hangupLine: {
      en: 'Never mind, I’ll call my neighbor’s boy to look at the wire... *CLICK*',
      ar: 'خلاص يا ابني هخلي ابن الجيران يطلع يبص على السلك... *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Diagnosed Red LOS fiber cut and dispatched a field technician kindly.',
      ar: 'تشخيص قطع الفايبر (Red LOS) وإرسال فني صيانة بأدب.',
    },
  },
  {
    id: 'eng_kareem',
    name: { en: 'Eng. Kareem', ar: 'م. كريم' },
    role: { en: 'Speed-Obsessed Analyst', ar: 'مهندس بيقيس السرعة كل ساعة' },
    avatar: 'engineer',
    accentColor: '#2563EB',
    initialMood: 'sarcastic',
    initialPatience: 76,
    decayPerSec: 1.6,
    lineStatus: 'quota_exhausted',
    trueCause: 'explain_billing',
    alreadyRestartedBeforeCall: true,
    nationalId: '29111200105521',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '0 GB Left (Throttled to 2 Mbps)', ar: '٠ جيجا متبقية (سرعة مخفضة ٢ ميجا)' },
    attenuationDb: '14.1 dB',
    snrDb: '24.8 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Listen, I pay for 30 Mbps and Speedtest just gave me 1.9 Mbps! Are you throttling me on purpose?!',
      ar: 'اسمعني بقى، أنا بدفع باقة ٣٠ ميجا وسبيد تست طالعلي ١.٩ ميجا! إنتو بتسرقوا السرعة ولا إيه؟!',
    },
    idResponse: {
      en: '29111200105521. Check the system, my line should be 30 mega sharp!',
      ar: '٢٩١١١٢٠٠١٠٥٥٢١. بص في السيستم كده، خطي المفروض ٣٠ ميجا بالمسطرة!',
    },
    lineCheckSummary: {
      en: 'Physical VDSL sync is a crisp 32 Mbps, zero noise. Speed cap is coming from account policy, not the wire.',
      ar: 'الخط واصل ٣٢ ميجا فعلياً وزي الفل. التبطيء جاي من حالة الباقة على السيستم مش من السلك.',
    },
    restartFailLine: {
      en: 'Seriously?! I’m an engineer, I restarted twice before calling! The speed is STILL 2 Mbps!',
      ar: 'بجد؟! أنا مهندس وعملت ريستارت مرتين قبل ما أتصل! السرعة لسه ٢ ميجا برضه!',
    },
    deescalateLine: {
      en: 'Alright, I appreciate you not reading from a script. So what’s actually slowing it down?',
      ar: 'ماشي، مقدّر إنك مش بتقرأ من اسكريبت. قولي بقى إيه السبب الحقيقي في البطء ده؟',
    },
    portResetLine: {
      en: 'The line dropped and synced back at the exact same 2 Mbps download! Check my account!',
      ar: 'الخط فصل ورجع على نفس الـ ٢ ميجا داونلود! شوف حسابي الله يكرمك!',
    },
    billingExplainLine: {
      en: 'Wait... 140 GB finished in 11 days?! Oh... my brother downloaded 3 PlayStation games in 4K. Let me add an extra quota pack!',
      ar: 'إيه ده... الـ ١٤٠ جيجا خلصوا في ١١ يوم؟! آه... أخويا نزل ٣ ألعاب بلايستيشن. خلاص هشحن باقة إضافية، شكراً للتوضيح!',
    },
    dispatchTechLine: {
      en: 'A technician to check a 24 dB SNR line?! That makes zero engineering sense!',
      ar: 'فني إيه والـ SNR عندي ٢٤؟! ده كلام مش منطقي هندسياً خالص!',
    },
    politeCloseReadyLine: {
      en: 'Extra quota options explained clearly. Have a great day, Eng. Kareem!',
      ar: 'تم توضيح استهلاك الباقة والباقات الإضافية. يومك سعيد يا بشمهندس كريم!',
    },
    politeClosePrematureLine: {
      en: 'Excuse me? You didn’t even tell me why my speed is 2 Mbps!',
      ar: 'نعم؟ إنت لسه ما قلتليش السرعة ٢ ميجا ليه أصلاً!',
    },
    hangupLine: {
      en: 'Unbelievable! I’m posting this Speedtest screenshot on Facebook! *CLICK*',
      ar: 'مش معقول! أنا هنزل اسكرين شوت السرعة على الفيس بوك! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Verified 100% quota usage via National ID and blamed the brother’s PlayStation.',
      ar: 'إثبات انتهاء الباقة بالرقم القومي واكتشاف تحميلات البلايستيشن.',
    },
  },
  {
    id: 'tarek_gamer',
    name: { en: 'Tarek "Clutch"', ar: 'طارق الجيمر' },
    role: { en: 'Ranked FPS Player', ar: 'لاعب أونلاين متوتر' },
    avatar: 'gamer',
    accentColor: '#DC2626',
    initialMood: 'furious',
    initialPatience: 72,
    decayPerSec: 2.0,
    lineStatus: 'port_stuck',
    trueCause: 'reset_port',
    alreadyRestartedBeforeCall: true,
    nationalId: '30205190108843',
    packageTier: { en: 'Gaming VDSL 100 Mbps', ar: 'جيمينج ١٠٠ ميجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '45% Remaining', ar: 'متبقي ٤٥٪' },
    attenuationDb: '21.0 dB',
    snrDb: '16.5 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'blink_green', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'BRO MY PING IS 999ms IN RANKED! My teammates are screaming! Fix my routing right now!!',
      ar: 'يا اسطى البينج ٩٩٩ في الرانكد! التيم بتاعي بيشتمني! ظبطلي البورت حالاً!!',
    },
    idResponse: {
      en: '30205190108843! Hurry up I’m AFK in spawn!',
      ar: '٣٠٢٠٥١٩٠١٠٨٨٤٣! بسرعة والنبي أنا واقف AFK في السباون!',
    },
    lineCheckSummary: {
      en: 'DSLAM port is stuck in high-interleaving error mode causing 400ms+ jitter. Port Reset will clear it.',
      ar: 'البورت في السنترال معلّق على بروفايل فيه تأخير عالي. تنشيط البورت (Reset Port) هيظبط البينج فوراً.',
    },
    restartFailLine: {
      en: 'I ALREADY REBOOTED! Now I got a 10-minute ban too! Check the actual port!!',
      ar: 'ما أنا عملت ريستارت يا عم! ولبست بان ١٠ دقايق كمان! افحص البورت من عندك!!',
    },
    deescalateLine: {
      en: 'Okay sorry for yelling, bro... just save my rank please.',
      ar: 'آسف إني اتعصبت يا اسطى... بس الحقلي الرانك أبوس إيدك.',
    },
    portResetLine: {
      en: 'WAIT—PING JUST DROPPED FROM 999ms TO 38ms!! LET’S GOOO! GG EZ!',
      ar: 'استنى—البينج نزل من ٩٩٩ لـ ٣٨ مللي ثانية!! عاش يا وحش والله! GG!',
    },
    billingExplainLine: {
      en: 'Quota?! I have 200 gigs left! It’s the ping, not the quota!',
      ar: 'باقة إيه يا عم أنا لسه شاحن! المشكلة في البينج مش الباقة!',
    },
    dispatchTechLine: {
      en: 'A field tech next week?! My season ends tonight!!',
      ar: 'فني الأسبوع الجاي إيه؟! السيزون بيخلص النهارده!!',
    },
    politeCloseReadyLine: {
      en: 'Ping stabilized at 38ms. Go carry your team, Tarek!',
      ar: 'البينج استقر على ٣٨. روح شيل التيم بقى يا طارق!',
    },
    politeClosePrematureLine: {
      en: 'Bro I’m still lagging across the map! Don’t close the ticket!',
      ar: 'يا اسطى لسه بنط من مكان لمكان من اللاج! ما تقفلش!',
    },
    hangupLine: {
      en: 'I just deranked to Bronze! I’m uninstalling! *CLICK*',
      ar: 'أنا نزلت برونز! همسح اللعبة والنت! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Reset DSLAM port and dropped ranked ping from 999ms to 38ms.',
      ar: 'تنشيط بورت السنترال وتنزيل البينج من ٩٩٩ لـ ٣٨.',
    },
  },
  {
    id: 'madam_nadia',
    name: { en: 'Mrs. Nadia', ar: 'مدام نادية' },
    role: { en: 'Fawry Payment Shopper', ar: 'دفعت الفاتورة من دقيقتين' },
    avatar: 'auntie',
    accentColor: '#0284C7',
    initialMood: 'impatient',
    initialPatience: 84,
    decayPerSec: 1.4,
    lineStatus: 'billing_hold',
    trueCause: 'explain_billing',
    alsoAccepts: ['reset_port'],
    alreadyRestartedBeforeCall: false,
    nationalId: '27503120102246',
    packageTier: { en: 'Home 30 Mbps · 140 GB', ar: 'هوم ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid 2m ago · Sync Pending', ar: 'تم الدفع من دقيقتين · جاري التفعيل' },
    quotaText: { en: '100% Renewed', ar: '١٠٠٪ متجددة' },
    attenuationDb: '16.5 dB',
    snrDb: '21.0 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Excuse me! I literally paid the bill at the Fawry kiosk 2 minutes ago and I have the receipt in my hand! Why is the internet still dead?!',
      ar: 'لو سمحت يا أستاذ! أنا لسه دافعة الفاتورة من فوري من دقيقتين والوصل في إيدي أهو! النت لسه فاصل ليه بقى؟!',
    },
    idResponse: {
      en: '27503120102246. Look, the payment went through—260 pounds exact!',
      ar: '٢٧٥٠٣١٢٠١٠٢٢٤٦. بص عندك هتلاقي الفلوس اتسحبت—٢٦٠ جنيه بالتمام!',
    },
    lineCheckSummary: {
      en: 'Line is clean, account shows payment received 2 minutes ago, waiting on automatic radius sync (can be refreshed or explained).',
      ar: 'الخط سليم، والدفع مسمّع في السيستم من دقيقتين ومحتاج تفعيل أو توضيح إن اللمبة هتقلب خضرا خلال ثواني.',
    },
    restartFailLine: {
      en: 'I restarted it and waited the 10 seconds... still red! Maybe the payment hasn’t synced yet?',
      ar: 'طفيته واستنيت ١٠ ثواني... ولسه أحمر! يمكن السيستم لسه ما سمّعش الدفع؟',
    },
    deescalateLine: {
      en: 'Okay dear, thank you for checking the receipt for me. Take your time.',
      ar: 'ماشي يا ابني كتر خيرك إنك بتتأكدلي من الوصل. خد وقتك.',
    },
    portResetLine: {
      en: 'Oh! Refreshing the port forced the paid session to activate! The internet light just turned green!',
      ar: 'الله! لما نشّطت الخط من عندك الدفع سمّع واللمبة قلبت خضرا أهي!',
    },
    billingExplainLine: {
      en: 'Aha! Payment takes 3 minutes to sync and now it just activated! Oh thank goodness, I was worried the kiosk ate my money!',
      ar: 'أيوة! الدفع بياخد ٣ دقايق يسمّع... أهو فعلاً اللمبة قلبت خضرا دلوقتي! الحمد لله افتكرت الكشك بلع الفلوس!',
    },
    dispatchTechLine: {
      en: 'Why send a technician to my house?! I just paid the bill!',
      ar: 'تبعتلي فني البيت ليه يا ابني؟! أنا دافعة الفاتورة بس!',
    },
    politeCloseReadyLine: {
      en: 'Payment synced and internet is active. Thank you, Mrs. Nadia!',
      ar: 'تم تفعيل الباقة والإنترنت يعمل بنجاح. شكراً يا مدام نادية!',
    },
    politeClosePrematureLine: {
      en: 'I haven’t hung up yet! Did my 260 pounds show up or not?!',
      ar: 'استنى يا ابني! الـ ٢٦٠ جنيه وصلوا ولا لأ؟!',
    },
    hangupLine: {
      en: 'I’m going back to the kiosk to get my money back! *CLICK*',
      ar: 'أنا راجعة للكشك أسترد فلوسي! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Confirmed Fawry payment sync and restored Mrs. Nadia’s active connection.',
      ar: 'تأكيد تسميع دفع فوري وتفعيل باقة مدام نادية.',
    },
  },
  {
    id: 'amr_expert',
    name: { en: 'Amr "The Expert"', ar: 'عمرو الخبير' },
    role: { en: 'Blames Remote Sabotage', ar: 'مقتنع إننا فصلنا له النت' },
    avatar: 'tech_skeptic',
    accentColor: '#7C3AED',
    initialMood: 'furious',
    initialPatience: 68,
    decayPerSec: 1.8,
    lineStatus: 'port_stuck',
    trueCause: 'reset_port',
    alreadyRestartedBeforeCall: true,
    refusesIdInitially: true,
    nationalId: '28908140107731',
    packageTier: { en: 'Mega 70 Mbps · 250 GB', ar: 'ميجا ٧٠ ميجا · ٢٥٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '52% Remaining', ar: 'متبقي ٥٢٪' },
    attenuationDb: '24.3 dB',
    snrDb: '11.2 dB',
    initialLights: { power: 'green', dsl: 'blink_amber', internet: 'off', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'DON’T YOU DARE tell me to restart the router! I restarted 5 times! YOU broke my line remotely from the central office!',
      ar: 'إياك تقولي اطفي الراوتر وشغله! أنا عملت ريستارت ٥ مرات! إنتو اللي بوظتوا خطي ريموتلي من السنترال!',
    },
    idRefusalLine: {
      en: 'Why do you need my National ID?! You already have my number on your screen! Calm down with me first!',
      ar: 'عايز الرقم القومي ليه؟! ما رقمي طالع عندك على الشاشة! هدّيني الأول واعرف مشكلتي!',
    },
    idResponse: {
      en: 'Fine, since you asked nicely: 28908140107731. Now fix your central server!',
      ar: 'ماشي عشان إنت محترم بس: ٢٨٩٠٨١٤٠١٠٧٧٣١. ظبطلي البورت بتاعكم بقى!',
    },
    lineCheckSummary: {
      en: 'DSL light blinking because the central office port profile crashed. A Port Reset will lock sync immediately.',
      ar: 'لمبة الـ DSL بترعش لأن بروفايل البورت في السنترال واقع. تنشيط البورت هيستعيد الربط فوراً.',
    },
    restartFailLine: {
      en: 'WHAT DID I SAY?! Restarting did NOTHING! Stop reading the script!!',
      ar: 'أنا مش قلتلك؟! الريستارت ما عملش حاجة! بطّل تقرأ من الورقة!!',
    },
    deescalateLine: {
      en: 'Alright... you actually listened instead of arguing. Respect. Now check what’s wrong with my port.',
      ar: 'طيب... إنت سمعتني بجد وما عاندتش معايا. احترامي ليك. افحصلي بقى الخط من عندك.',
    },
    portResetLine: {
      en: 'Whoa! The DSL light went solid green AND internet is back! So it WAS the port! Good job, man.',
      ar: 'إيه ده! لمبة الـ DSL ثبتت والنت رجع! يعني كان البورت فعلاً! شاطر يا هندسة والله.',
    },
    billingExplainLine: {
      en: 'I don’t owe you a single piaster! Check the technical port!',
      ar: 'أنا مش عليا مليم! بص في المشكلة الفنية يا عم!',
    },
    dispatchTechLine: {
      en: 'I don’t want someone coming in 3 days! Fix it from your desk!',
      ar: 'مش عايز حد يجيلي بعد ٣ أيام! حلّها من عندك على الجهاز!',
    },
    politeCloseReadyLine: {
      en: 'Port rebuilt and connection stable. Pleasure helping you, Amr!',
      ar: 'تم إعادة بناء البورت واستقرار الخط. تشرفنا بخدمتك يا أستاذ عمرو!',
    },
    politeClosePrematureLine: {
      en: 'Hang up?! You didn’t fix anything yet!',
      ar: 'تقفل إيه؟! إنت لسه ما عملتش حاجة!',
    },
    hangupLine: {
      en: 'I knew it! Nobody knows anything there! *CLICK*',
      ar: 'أنا كنت متأكد! ما فيش فايدة فيكم! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'De-escalated Amr without mentioning router restart and fixed his crashed port.',
      ar: 'احتواء غضب عمرو بدون سيرة الريستارت وإصلاح بورت السنترال.',
    },
  },
  {
    id: 'salma_zoom',
    name: { en: 'Salma Hany', ar: 'سلمى هاني' },
    role: { en: 'Remote Job Candidate', ar: 'عندها انترفيو أونلاين' },
    avatar: 'job_applicant',
    accentColor: '#0D9488',
    initialMood: 'impatient',
    initialPatience: 80,
    decayPerSec: 1.5,
    lineStatus: 'pppoe_frozen',
    trueCause: 'restart_router',
    alreadyRestartedBeforeCall: false,
    nationalId: '29807110104412',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '71% Remaining', ar: 'متبقي ٧١٪' },
    attenuationDb: '15.2 dB',
    snrDb: '22.4 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Please help! I have a Zoom job interview in 4 minutes and my laptop says "Connected, No Internet"!',
      ar: 'أرجوك الحقني! عندي انترفيو شغل على زوم بعد ٤ دقايق واللاب توب كاتب متصل بدون إنترنت!',
    },
    idResponse: {
      en: 'Yes! 29807110104412. Do I have time to fix it before the HR joins?',
      ar: 'أيوة! ٢٩٨٠٧١١٠١٠٤٤١٢. هل هنلحق قبل ما الـ HR تدخل الميتنج؟',
    },
    lineCheckSummary: {
      en: 'Line attenuation is great (15.2 dB), but the router DNS & gateway session froze. A 10s power cycle will clear it.',
      ar: 'الخط ممتاز جداً (١٥.٢ dB)، بس الراوتر مهنّج على بوابة الـ DNS. ريستارت ١٠ ثواني هيشغّله فوراً.',
    },
    restartSuccessLine: {
      en: 'YES! Zoom just connected and my camera is live! Wish me luck in the interview!!',
      ar: 'أيوه! زوم فتح والكاميرا اشتغلت! ادعيلي أتقبل في الانترفيو!!',
    },
    restartFailLine: {
      en: 'Rebooting...',
      ar: 'جاري إعادة التشغيل...',
    },
    deescalateLine: {
      en: 'Thank you so much for reassuring me... okay I’m ready, what’s step one?',
      ar: 'شكراً بجد إنك طمنتني... تمام أنا جاهزة، أعمل إيه؟',
    },
    portResetLine: {
      en: 'The port blinked, wait—my router’s internet light is still red. Should I power cycle the router here?',
      ar: 'الخط رَعش، بس لمبة النت عندي لسه حمرا. أطفي الراوتر وأشغله من هنا؟',
    },
    billingExplainLine: {
      en: 'My dad paid the bill yesterday! Why is my laptop saying No Internet?',
      ar: 'بابا دافع الفاتورة امبارح! اللاب توب فاصل ليه؟',
    },
    dispatchTechLine: {
      en: 'A technician tomorrow?! My interview is in 3 minutes!!',
      ar: 'فني بكرة إيه؟! الانترفيو بعد ٣ دقايق!!',
    },
    politeCloseReadyLine: {
      en: 'Best of luck in your interview, Salma! You’ve got this!',
      ar: 'بالتوفيق في الانترفيو يا سلمى! إن شاء الله مقبولة!',
    },
    politeClosePrematureLine: {
      en: 'Wait please, Zoom is still showing "Reconnecting..."!',
      ar: 'استنى من فضلك، زوم لسه كاتب جاري إعادة الاتصال!',
    },
    hangupLine: {
      en: 'I’m tethering from my 4G phone, I can’t wait! *CLICK*',
      ar: 'هفتح باقة الموبايل، ما فيش وقت! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Cleared frozen router DNS with a 10s reboot right before Salma’s Zoom interview.',
      ar: 'حل تعليق الراوتر بريستارت ١٠ ثواني قبل انترفيو سلمى.',
    },
  },
  {
    id: 'uncle_shawky',
    name: { en: 'Uncle Shawky', ar: 'عم شوقي' },
    role: { en: 'Retired Accountant', ar: 'محاسب على المعاش' },
    avatar: 'grandpa',
    accentColor: '#EA580C',
    initialMood: 'confused',
    initialPatience: 88,
    decayPerSec: 1.1,
    lineStatus: 'power_unplugged',
    trueCause: 'restart_router',
    alreadyRestartedBeforeCall: false,
    nationalId: '25812050100934',
    packageTier: { en: 'Home 30 Mbps · 140 GB', ar: 'هوم ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '91% Remaining', ar: 'متبقي ٩١٪' },
    attenuationDb: 'OFFLINE',
    snrDb: 'OFFLINE',
    initialLights: { power: 'off', dsl: 'off', internet: 'off', los: 'off', wifi: 'off' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Hello son? All the lights on my router went completely dark! Did Tele-Masr turn off the whole neighborhood?',
      ar: 'ألو يا ابني؟ كل لمبات الراوتر مطفية خالص! هو انتو فصلتوا النت عن المنطقة كلها؟',
    },
    idResponse: {
      en: 'Hold on... 25812050100934. Look, not even the power light is on!',
      ar: 'ثواني يا ابني... ٢٥٨١٢٠٥٠١٠٠٩٣٤. بص ده حتى لمبة الباور مش منوّرة!',
    },
    lineCheckSummary: {
      en: 'No CPE detected on the line at all—router has zero power! Ask him to unplug & plug the power adapter.',
      ar: 'مفيش أي جهاز واصل على الخط—الراوتر فاصل كهرباء! خليه يشيك على الفيشة أو يطفي ويشغل الزرار.',
    },
    restartSuccessLine: {
      en: 'OH! Haha! When I reached behind the table to unplug it, I saw the power strip switch was bumped OFF! All lights are green now!',
      ar: 'أوووه! هههه! وأنا بوصل الفيشة لقيت المشترك كان مقفول بالرجل! كل اللمبات نوّرت أخضر أهي!',
    },
    restartFailLine: {
      en: 'Checking plug...',
      ar: 'بشوف الفيشة...',
    },
    deescalateLine: {
      en: 'No rush at all, son. My tea is hot and I’m listening to you.',
      ar: 'ولا يهمك يا ابني على مهلك. كوباية الشاي سخنة وأنا سامعك.',
    },
    portResetLine: {
      en: 'I can’t see any change—still completely dark over here! The box has zero lights!',
      ar: 'ما شفتش حاجة اتغيرت—الجهاز لسه مطفي ضلمة خالص عندي!',
    },
    billingExplainLine: {
      en: 'I paid in advance for 3 months! Still no electricity in the little box though.',
      ar: 'أنا دافع ٣ شهور مقدم! بس العلبة لسه ما فيهاش كهرباء.',
    },
    dispatchTechLine: {
      en: 'Wait, you’re sending an engineer just to look at my wall plug?!',
      ar: 'استنى، هتبعت مهندس عشان يبص على فيشة الحيطة؟!',
    },
    politeCloseReadyLine: {
      en: 'Glad it was just the power strip, Uncle Shawky! Enjoy your tea.',
      ar: 'الحمد لله إنها طلعت المشترك يا عم شوقي! بالهنا والشفا على الشاي.',
    },
    politeClosePrematureLine: {
      en: 'Wait son, the router is still pitch black!',
      ar: 'استنى يا ابني الراوتر لسه مطفي خالص!',
    },
    hangupLine: {
      en: 'My wife says the vacuum cleaner unplugged it... never mind! *CLICK*',
      ar: 'المدام بتقولي المكنسة شدّت الفيشة... خلاص لقيناها! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Helped Uncle Shawky discover his bumped power strip switch.',
      ar: 'اكتشاف إن مشترك الكهرباء كان مفصول عند عم شوقي.',
    },
  },
  {
    id: 'hossam_unpaid',
    name: { en: 'Hossam Adel', ar: 'حسام عادل' },
    role: { en: 'Forgetful Freelancer', ar: 'فريلانسر نساي' },
    avatar: 'student',
    accentColor: '#E11D48',
    initialMood: 'impatient',
    initialPatience: 78,
    decayPerSec: 1.5,
    lineStatus: 'billing_hold',
    trueCause: 'explain_billing',
    alreadyRestartedBeforeCall: true,
    nationalId: '29502280106125',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'OVERDUE: 310 EGP (Suspended)', ar: 'فاتورة غير مدفوعة: ٣١٠ ج.م (موقوف)' },
    quotaText: { en: 'Suspended Pending Payment', ar: 'موقوف لحين السداد' },
    attenuationDb: '17.0 dB',
    snrDb: '20.5 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Hey! Everything worked fine last night and this morning the internet light turned red! What happened?!',
      ar: 'يا فندم! النت كان شغال امبارح زي الفل والنهارده الصبح اللمبة بقت حمرا! إيه اللي حصل؟!',
    },
    idResponse: {
      en: '29502280106125. Did my neighbor steal my port again?',
      ar: '٢٩٥٠٢٢٨٠١٠٦١٢٥. هو جاري سرق البورت بتاعي تاني ولا إيه؟',
    },
    lineCheckSummary: {
      en: 'Line sync is clean, but authentication is blocked by an unpaid 310 EGP monthly renewal invoice.',
      ar: 'الخط واصل تمام، بس الخدمة متوقفة إدارياً بسبب فاتورة تجديد غير مدفوعة (٣١٠ جنيه).',
    },
    restartFailLine: {
      en: 'I restarted twice already and it’s still red! Check my account status please!',
      ar: 'عملت ريستارت مرتين ولسه حمرا! راجع حالة حسابي طيب!',
    },
    deescalateLine: {
      en: 'Fair enough, thanks for checking carefully.',
      ar: 'ماشي تمام، شكراً إنك بتراجع الحساب بدقة.',
    },
    portResetLine: {
      en: 'Port reset didn’t clear the red light... is my subscription expired?',
      ar: 'تنشيط البورت ما شغّلش اللمبة... هو اشتراكي خلص ولا إيه؟',
    },
    billingExplainLine: {
      en: 'OH! Today is the 27th?! I completely forgot to pay the 310 EGP bill! Paying via app right now—thanks!',
      ar: 'أوه! النهارده ٢٧ في الشهر؟! نسيت خالص أدفع الـ ٣١٠ جنيه! هدفع من الأبلكيشن حالاً—تسلم يا كبير!',
    },
    dispatchTechLine: {
      en: 'Send a technician?! Wait, did I just forget to pay the bill?',
      ar: 'فني ليه؟! استنى هو أنا بس نسيت أدفع الاشتراك؟',
    },
    politeCloseReadyLine: {
      en: 'Invoice explained clearly. It will reconnect automatically once paid!',
      ar: 'تم توضيح الفاتورة المستحقة. النت هيرجع تلقائياً فور السداد!',
    },
    politeClosePrematureLine: {
      en: 'Wait, you didn’t tell me why the internet light is red!',
      ar: 'استنى، إنت ما قلتليش اللمبة الحمرا سببها إيه!',
    },
    hangupLine: {
      en: 'Waste of time! I’ll go to the branch myself! *CLICK*',
      ar: 'تضييع وقت! أنا نازل الفرع بنفسي! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Caught an overdue 310 EGP invoice suspension via National ID lookup.',
      ar: 'اكتشاف إيقاف الخط بسبب فاتورة متأخرة (٣١٠ جنيه) بالرقم القومي.',
    },
  },
  {
    id: 'dr_waleed',
    name: { en: 'Dr. Waleed', ar: 'د. وليد' },
    role: { en: 'Medical Lecturer', ar: 'أستاذ جامعي في مؤتمر' },
    avatar: 'doctor',
    accentColor: '#0F766E',
    initialMood: 'calm',
    initialPatience: 85,
    decayPerSec: 1.3,
    lineStatus: 'high_attenuation',
    trueCause: 'dispatch_tech',
    alreadyRestartedBeforeCall: true,
    nationalId: '27206100103318',
    packageTier: { en: 'Mega 70 Mbps · 250 GB', ar: 'ميجا ٧٠ ميجا · ٢٥٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '60% Remaining', ar: 'متبقي ٦٠٪' },
    attenuationDb: '54.8 dB (CRITICAL)',
    snrDb: '4.1 dB (UNSTABLE)',
    initialLights: { power: 'green', dsl: 'blink_amber', internet: 'off', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'blink_amber', internet: 'off', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Good evening. My DSL keeps disconnecting every 10 minutes during my medical webinar. Could you run a line noise test?',
      ar: 'مساء الخير. لمبة الـ DSL بتفصل كل ١٠ دقايق وسط محاضرة طبية مهمة. ممكن تفحص جودة الخط؟',
    },
    idResponse: {
      en: 'Certainly, it is 27206100103318.',
      ar: 'بالتأكيد، الرقم القومي ٢٧٢٠٦١٠٠١٠٣٣١٨.',
    },
    lineCheckSummary: {
      en: 'Severe line degradation: Attenuation 54.8 dB and SNR Margin 4.1 dB! Outdoor copper box or splitter corrosion requires a technician.',
      ar: 'تدهور شديد في الخط: تشويش ٥٤.٨ dB ومعدل SNR منخفض جداً ٤.١ dB! يحتاج فحص كابينة وسلك خارجي بواسطة فني.',
    },
    restartFailLine: {
      en: 'I have already power-cycled it twice before calling. It still drops when the line noise spikes.',
      ar: 'قمت بإعادة تشغيله مرتين قبل الاتصال. ما زال يفصل بسبب التشويش.',
    },
    deescalateLine: {
      en: 'Thank you, I appreciate your thoroughness and calm manner.',
      ar: 'شكراً لك، أقدّر اهتمامك وأسلوبك المحترم.',
    },
    portResetLine: {
      en: 'It synced briefly at 6 Mbps and dropped right back out. The copper wire outside seems damaged.',
      ar: 'ربط لحظة على ٦ ميجا وفصل تاني. يبدو أن السلك الخارجي متهالك.',
    },
    billingExplainLine: {
      en: 'My billing is on corporate autopay. Please inspect the technical SNR values.',
      ar: 'الفواتير مدفوعة تلقائياً. من فضلك راجع قيم التشويش الفنية.',
    },
    dispatchTechLine: {
      en: 'Thank you! Having a field technician replace the outdoor junction box makes complete sense.',
      ar: 'شكراً جزيلاً! إرسال فني لفحص البوكس الخارجي وتغيير الوصلة قرار سليم تماماً.',
    },
    politeCloseReadyLine: {
      en: 'High-priority technical ticket dispatched. Thank you, Dr. Waleed!',
      ar: 'تم تسجيل بلاغ فني عاجل. شكراً لوقتك يا دكتور وليد!',
    },
    politeClosePrematureLine: {
      en: 'Wait—we haven’t scheduled a line inspection for the 54 dB attenuation yet.',
      ar: 'لحظة—لم نحدد موعد فحص لمشكلة التشويش بعد.',
    },
    hangupLine: {
      en: 'I’ll switch to mobile data for my lecture. Goodbye. *CLICK*',
      ar: 'سأستخدم باقة الهاتف للمحاضرة. مع السلامة. *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Spotted critical 54.8 dB attenuation and dispatched outdoor line repair.',
      ar: 'اكتشاف تشويش ٥٤.٨ dB وإرسال فني لإصلاح الكابل الخارجي.',
    },
  },
  {
    id: 'mona_wifi',
    name: { en: 'Mona Ibrahim', ar: 'منى إبراهيم' },
    role: { en: 'Busy Mom of Three', ar: 'أم لـ ٣ أطفال' },
    avatar: 'mom',
    accentColor: '#DB2777',
    initialMood: 'confused',
    initialPatience: 86,
    decayPerSec: 1.3,
    lineStatus: 'line_healthy',
    trueCause: 'polite_close',
    alsoAccepts: ['restart_router'],
    alreadyRestartedBeforeCall: false,
    nationalId: '28401180102911',
    packageTier: { en: 'Home 30 Mbps · 140 GB', ar: 'هوم ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '55% Remaining', ar: 'متبقي ٥٥٪' },
    attenuationDb: '13.9 dB',
    snrDb: '25.1 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'off' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Hello! The internet light is solid green, my TV works with the cable, but ALL our phones say "Incorrect Wi-Fi Password" or can’t see Wi-Fi!',
      ar: 'ألو! لمبة النت خضرا والتليفزيون شغال بالسلك، بس موبايلاتنا كلها مش شايفة الواي فاي أو بتقول الباسورد غلط!',
    },
    idResponse: {
      en: '28401180102911. Wait—look at the router, the little Wi-Fi light is actually OFF!',
      ar: '٢٨٤٠١١٨٠١٠٢٩١١. استنى—ببص على الراوتر لقيت لمبة الـ Wi-Fi مطفية أصلاً!',
    },
    lineCheckSummary: {
      en: 'Line is 100% healthy (25.1 dB SNR)! The physical WLAN/Wi-Fi side button on the router was accidentally pressed off.',
      ar: 'الخط سليم ١٠٠٪! بس زرار الـ WLAN الجانبي في الراوتر حد داس عليه بالغلط وقفل الواي فاي.',
    },
    restartSuccessLine: {
      en: 'Oh! While pressing the power button I also saw the WLAN button and pressed it—Wi-Fi is back on all phones!!',
      ar: 'يا خبر! وأنا بطفي الراوتر لقيت زرار الواي فاي من الجنب دوست عليه—الموبايلات كلها لقطت تاني!!',
    },
    restartFailLine: {
      en: 'Restarting...',
      ar: 'بنجرب...',
    },
    deescalateLine: {
      en: 'Haha! Honestly the kids probably pressed the side button while playing hide-and-seek behind the TV!',
      ar: 'هههه! أكيد العيال داسوا على الزرار وهما بيلعبوا ورا التليفزيون!',
    },
    portResetLine: {
      en: 'Cable TV is still fine, but the little Wi-Fi symbol on the box is still dark!',
      ar: 'التليفزيون بالسلك شغال، بس علامة الواي فاي على الجهاز لسه مطفية!',
    },
    billingExplainLine: {
      en: 'Oh no, the bill is fine! Wait—my son just pressed the side WLAN button and the Wi-Fi light turned green! Mystery solved!',
      ar: 'لأ الفاتورة تمام! استنى—ابني داس على زرار الـ WLAN اللي في الجنب ولمبة الواي فاي نوّرت! اتحلت!',
    },
    dispatchTechLine: {
      en: 'A technician for a side button?! Wait, I just pressed the WLAN button myself and it worked!',
      ar: 'فني عشان زرار في الجنب؟! استنى أنا دوست عليه بنفسي واشتغل خلاص!',
    },
    politeCloseReadyLine: {
      en: 'Everything is working after pressing the side WLAN button! Thank you so much!',
      ar: 'كله تمام والواي فاي اشتغل بعد ما دوست على زرار الـ WLAN! شكراً جداً يا فندم!',
    },
    politeClosePrematureLine: {
      en: 'Wait, check the line first so I know why Wi-Fi disappeared!',
      ar: 'استنى، افحصلي الخط الأول عشان أتطمن الواي فاي اختفى ليه!',
    },
    hangupLine: {
      en: 'Never mind, my husband just pressed the Wi-Fi button! *CLICK*',
      ar: 'خلاص جوزي لسه دايس على زرار الواي فاي واشتغل! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Identified accidental Wi-Fi side button press on a completely healthy line.',
      ar: 'اكتشاف قفل زرار الـ Wi-Fi الجانبي بالخطأ على خط سليم تماماً.',
    },
  },
  {
    id: 'shady_quota',
    name: { en: 'Shady Mamdouh', ar: 'شادي ممدوح' },
    role: { en: '4K Smart TV Victim', ar: 'ضحية اليوتيوب 4K' },
    avatar: 'tv_binge',
    accentColor: '#CA8A04',
    initialMood: 'furious',
    initialPatience: 75,
    decayPerSec: 1.6,
    lineStatus: 'quota_exhausted',
    trueCause: 'explain_billing',
    alreadyRestartedBeforeCall: true,
    nationalId: '29304090105199',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '0 GB Left (Used in 6 Days)', ar: '٠ جيجا متبقية (خلصت في ٦ أيام)' },
    attenuationDb: '16.0 dB',
    snrDb: '21.8 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'HOW DID 140 GIGABYTES FINISH IN SIX DAYS?! I live alone and only read news articles!!',
      ar: 'إزاي ١٤٠ جيجا يخلصوا في ٦ أيام يا فندم؟! أنا عايش لوحدي وبفتح جرايد بس!!',
    },
    idResponse: {
      en: '29304090105199! Explain this magic trick to me!',
      ar: '٢٩٣٠٤٠٩٠١٠٥١٩٩! اشرحلي السحر ده حصل إزاي!',
    },
    lineCheckSummary: {
      en: 'Line is spotless. Account shows 140 GB consumed at 4K streaming bitrates over the last 6 nights.',
      ar: 'الخط سليم تماماً. الحساب مسجل استهلاك ١٤٠ جيجا ستريمنج 4K في آخر ٦ أيام.',
    },
    restartFailLine: {
      en: 'Restarting my router won’t put my 140 gigabytes back, habibi!',
      ar: 'الريستارت مش هيرجّعلي الـ ١٤٠ جيجا يا حبيبي!',
    },
    deescalateLine: {
      en: 'Okay, I’m listening... how could it burn 23 gigs a day?',
      ar: 'ماشي أنا سامعك... إزاي أسحب ٢٣ جيجا في اليوم؟',
    },
    portResetLine: {
      en: 'Still crawling at 2 Mbps! Check the usage log on my account!',
      ar: 'لسه سلحفاة ٢ ميجا! شوفلي سجل الاستهلاك على الحساب!',
    },
    billingExplainLine: {
      en: 'WAIT—my new 65-inch Smart TV has been auto-playing YouTube 4K screensavers every night while I sleep?! Oh no... upgrading package now!',
      ar: 'استنى—تليفزيوني الـ 65 بوصة الجديد كان مشغّل يوتيوب 4K لوحده طول الليل وأنا نايم؟! يا لهوي... هرفع الباقة حالاً!',
    },
    dispatchTechLine: {
      en: 'A technician for my quota?! Are they bringing gigabytes in a suitcase?!',
      ar: 'فني عشان الباقة؟! هيجيبلي جيجات في شنطة مثلاً؟!',
    },
    politeCloseReadyLine: {
      en: 'Recommended lowering Smart TV quality to 1080p & renewing quota. Cheers, Shady!',
      ar: 'تم النصح بتقليل جودة التليفزيون وتجديد الباقة. نهارك سعيد يا شادي!',
    },
    politeClosePrematureLine: {
      en: 'Hey, you didn’t explain where my 140 GB vanished!',
      ar: 'يا عم ما قلتليش الـ ١٤٠ جيجا طاروا فين!',
    },
    hangupLine: {
      en: 'You guys are eating my gigabytes! *CLICK*',
      ar: 'إنتو بتاكلوا الجيجات! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Solved the 6-day 140GB mystery: Smart TV auto-playing 4K all night.',
      ar: 'حل لغز انتهاء ١٤٠ جيجا في ٦ أيام: التليفزيون السمارت شغال 4K طول الليل.',
    },
  },
  {
    id: 'rania_kitchen',
    name: { en: 'Rania Tarek', ar: 'رانيا طارق' },
    role: { en: 'Post-Renovation Mover', ar: 'نقلت الراوتر وقت النقاشة' },
    avatar: 'painter_family',
    accentColor: '#4F46E5',
    initialMood: 'confused',
    initialPatience: 84,
    decayPerSec: 1.4,
    lineStatus: 'red_los',
    trueCause: 'dispatch_tech',
    alsoAccepts: ['polite_close'],
    alreadyRestartedBeforeCall: true,
    nationalId: '29010140103377',
    packageTier: { en: 'Super 30 Mbps · 140 GB', ar: 'سوبر ٣٠ ميجا · ١٤٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '78% Remaining', ar: 'متبقي ٧٨٪' },
    attenuationDb: 'NO SYNC',
    snrDb: '0.0 dB',
    initialLights: { power: 'green', dsl: 'blink_amber', internet: 'off', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'blink_amber', internet: 'off', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Hi! We painted the living room today and moved the router to a wall socket in the hallway, and now DSL just blinks forever!',
      ar: 'هاي! كنا بندهن الصالة النهارده ونقلنا الراوتر لفيشة تليفون في الطرقة، ولمبة الـ DSL بتقيد وتطفي ومش راضية تثبت!',
    },
    idResponse: {
      en: '29010140103377! The hallway socket looks totally fine though!',
      ar: '٢٩٠١٠١٤٠١٠٣٣٧٧! بس الفيشة اللي في الطرقة شكلها سليم والله!',
    },
    lineCheckSummary: {
      en: 'Open loop on internal house wiring—that hallway jack is disconnected or missing the main splitter line. Needs wiring check / technician.',
      ar: 'الدائرة مفتوحة في سلك التليفون الداخلي—الفيشة دي مش متوصلة بالبوكس الرئيسي ومحتاجة فني أو ترجيعه للفيشة الأصلية.',
    },
    restartFailLine: {
      en: 'Restarted 3 times already! DSL still blinks endlessly!',
      ar: 'عملت ريستارت ٣ مرات! لمبة الـ DSL لسه بترعش!',
    },
    deescalateLine: {
      en: 'Gotcha, sorry for all the paint chaos in the background!',
      ar: 'فهمت، معلش على دوشة النقاشين اللي في الخلفية!',
    },
    portResetLine: {
      en: 'No change—the port sees an open wire on our side.',
      ar: 'ما فيش تغيير—البورت قاري سلك مقطوع من عندنا.',
    },
    billingExplainLine: {
      en: 'Bill is paid! We literally just unplugged it to paint the wall!',
      ar: 'الفاتورة مدفوعة! إحنا بس شيلناه عشان ندهن الحيطة!',
    },
    dispatchTechLine: {
      en: 'Great idea! Schedule a technician to re-crimp the living room jack once the paint dries. Thanks!',
      ar: 'فكرة ممتازة! ابعتلنا فني يقرّج فيشة الصالة أول ما البوية تنشف. شكراً جداً!',
    },
    politeCloseReadyLine: {
      en: 'Technician booked to inspect internal wiring. Congrats on the fresh paint!',
      ar: 'تم حجز فني لفحص الوصلة الداخلية. مبروك الدهان الجديد!',
    },
    politeClosePrematureLine: {
      en: 'Wait, should we send a technician or check the socket first?',
      ar: 'استنى، نبعت فني ولا هنعمل إيه في الفيشة؟',
    },
    hangupLine: {
      en: 'Okay I’ll ask the painter if he cut the telephone wire... *CLICK*',
      ar: 'طب هسأل النقاش لو قطع سلك التليفون بالسكينة... *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Diagnosed disconnected hallway phone jack after apartment painting.',
      ar: 'تشخيص فيشة تليفون مفصولة بعد دهان الشقة وحجز فني.',
    },
  },
  {
    id: 'youssef_id',
    name: { en: 'Youssef "The Chill"', ar: 'يوسف الرايق' },
    role: { en: 'Night-Owl Designer', ar: 'مصمم جرافيك سهران' },
    avatar: 'influencer',
    accentColor: '#0284C7',
    initialMood: 'sarcastic',
    initialPatience: 79,
    decayPerSec: 1.4,
    lineStatus: 'port_stuck',
    trueCause: 'reset_port',
    alreadyRestartedBeforeCall: true,
    refusesIdInitially: true,
    nationalId: '29903010109214',
    packageTier: { en: 'Mega 70 Mbps · 250 GB', ar: 'ميجا ٧٠ ميجا · ٢٥٠ جيجا' },
    billingStatus: { en: 'Paid · Active', ar: 'مدفوعة · ساري' },
    quotaText: { en: '38% Remaining', ar: 'متبقي ٣٨٪' },
    attenuationDb: '20.1 dB',
    snrDb: '14.5 dB',
    initialLights: { power: 'green', dsl: 'green', internet: 'red', los: 'off', wifi: 'green' },
    fixedLights: { power: 'green', dsl: 'green', internet: 'green', los: 'off', wifi: 'green' },
    openingLine: {
      en: 'Yo, my upload speed dropped to 0.1 Mbps while uploading a 4GB client video. Please don’t say "turn it off and on".',
      ar: 'يا زميلي الأبلود نزل لـ ٠.١ ميجا وأنا برفع فيديو ٤ جيجا للعميل. بالله عليك بلاش "اطفي وشغل".',
    },
    idRefusalLine: {
      en: 'Bro my wallet is in my jeans in the laundry! Can you just reassure me you’re actually checking it?',
      ar: 'يا عم محفظتي في البنطلون في الغسالة! طمني الأول إنك هتشوف المشكلة!',
    },
    idResponse: {
      en: 'Found a photo of it on my phone! 29903010109214. Now hit that magic button!',
      ar: 'لقيت صورته على الموبايل! ٢٩٩٠٠٣٠١٠١٠٩٢١٤. اضغط الزرار السحري بتاعك بقى!',
    },
    lineCheckSummary: {
      en: 'Upstream channel stuck on fallback modulation. A Port Reset will restore full 10 Mbps upload.',
      ar: 'قناة الرفع (Upstream) معلّقة. تنشيط البورت هيرجع سرعة الرفع الكاملة فوراً.',
    },
    restartFailLine: {
      en: 'I literally warned you not to say that! Now my upload is 0.05 Mbps!!',
      ar: 'مش حذرتك ما تقولش كده؟! الأبلود بقى ٠.٠٥ دلوقتي!!',
    },
    deescalateLine: {
      en: 'Respect, bro. Glad I got someone chill on the night shift.',
      ar: 'تسلم يا رايق. كويس إني وقعت مع حد فاهم في شيفت بالليل.',
    },
    portResetLine: {
      en: 'BOOM! Upload jumped straight back to 11 Mbps! Client won’t kill me tonight!',
      ar: 'بوووم! الأبلود طار لـ ١١ ميجا تاني! العميل مش هيقتلني النهارده!',
    },
    billingExplainLine: {
      en: 'I’ve got 95 gigs left, man! It’s the upload channel!',
      ar: 'معايا ٩٥ جيجا لسه يا عم! المشكلة في الأبلود!',
    },
    dispatchTechLine: {
      en: 'No way I’m waiting two days for a field visit on a port issue!',
      ar: 'مستحيل أستنى يومين لفني على مشكلة بورت!',
    },
    politeCloseReadyLine: {
      en: 'Upload restored! Go deliver that render, Youssef.',
      ar: 'الأبلود رجع زي الفل! روح ابعت الريندر بقى يا يوسف.',
    },
    politeClosePrematureLine: {
      en: 'Dude my progress bar is still frozen at 12%!',
      ar: 'يا عم شريط الرفع لسه واقف على ١٢٪!',
    },
    hangupLine: {
      en: 'Going to a coworking space at 2 AM, thanks for nothing! *CLICK*',
      ar: 'أنا نازل وورك سبيس الساعة ٢ بالليل، شكراً! *قفل السكة*',
    },
    victoryLogSummary: {
      en: 'Calmed Youssef, fetched ID from phone photo, and reset his upstream port.',
      ar: 'تهدئة يوسف وجلب الرقم القومي من صورة الموبايل وتنشيط بورت الرفع.',
    },
  },
];

export interface LocalizedUI {
  brandTitle: string;
  brandSubtitle: string;
  langToggle: string;
  shiftTimer: string;
  endlessLabel: string;
  csatLabel: string;
  scoreLabel: string;
  streakLabel: string;
  resolvedLabel: string;
  droppedLabel: string;
  pauseBtn: string;
  resumeBtn: string;
  restartShiftBtn: string;
  historyBtn: string;
  howToPlayBtn: string;
  muteBtn: string;
  unmuteBtn: string;
  startTitle: string;
  startSubtitle: string;
  selectShiftMode: string;
  modeQuick: string;
  modeStandard: string;
  modeEndless: string;
  startShiftCta: string;
  controlsHint: string;
  incomingCallLabel: string;
  patienceLabel: string;
  moodLabel: string;
  lineStatusLabel: string;
  routerUnitTitle: string;
  rebootingBanner: string;
  checkingLineBanner: string;
  accountSnapshotTitle: string;
  nationalIdLabel: string;
  packageLabel: string;
  billingLabel: string;
  quotaLabel: string;
  attenuationLabel: string;
  snrLabel: string;
  unverifiedText: string;
  notScannedText: string;
  transcriptTitle: string;
  agentLabel: string;
  systemLabel: string;
  actionsTitle: string;
  diagnosticsGroup: string;
  resolutionGroup: string;
  nextCallBtn: string;
  endShiftNowBtn: string;
  callResolvedTag: string;
  callDroppedTag: string;
  historyDrawerTitle: string;
  historyEmpty: string;
  closeBtn: string;
  howToTitle: string;
  howToIntro: string;
  howToRules: string[];
  summaryTitle: string;
  summaryCalls: string;
  summaryResolved: string;
  summaryDropped: string;
  summaryCsat: string;
  summaryScore: string;
  summaryBestStreak: string;
  summaryReboots: string;
  summaryIds: string;
  summaryPlayAgain: string;
  summaryBackTitle: string;
  pausedTitle: string;
  pausedDesc: string;
  ledPower: string;
  ledDsl: string;
  ledInternet: string;
  ledLos: string;
  ledWifi: string;
  audioSetupBtn: string;
  audioModalTitle: string;
  audioModalDesc: string;
  speakerSectionTitle: string;
  speakerSupported: string;
  speakerUnsupported: string;
  testSpeakerBtn: string;
  testSpeakerPhrase: string;
  micSectionTitle: string;
  micGranted: string;
  micPending: string;
  micDenied: string;
  micUnsupported: string;
  enableMicBtn: string;
  continueWithAudioBtn: string;
  continueTextOnlyBtn: string;
  callerSpeakingLabel: string;
  speakerReadyLabel: string;
  voiceMutedLabel: string;
  repeatLineBtn: string;
  voiceToggleLabel: string;
  micHoldLabel: string;
  micListeningLabel: string;
  micToggleListenBtn: string;
  micStopListenBtn: string;
  liveTranscriptLabel: string;
  liveTranscriptPlaceholder: string;
  recognizedIntentLabel: string;
  noIntentDetected: string;
  textFallbackPlaceholder: string;
  sendBtn: string;
  micErrorNotAllowed: string;
  micErrorUnsupported: string;
  micErrorGeneric: string;
}

export const UI_TEXT: Record<Language, LocalizedUI> = {
  en: {
    brandTitle: 'Tele-Masr 111',
    brandSubtitle: 'Tech Support Operations Desk',
    langToggle: 'العربية',
    shiftTimer: 'Shift',
    endlessLabel: 'Endless',
    csatLabel: 'CSAT',
    scoreLabel: 'Score',
    streakLabel: 'Streak',
    resolvedLabel: 'Resolved',
    droppedLabel: 'Dropped',
    pauseBtn: 'Pause',
    resumeBtn: 'Resume',
    restartShiftBtn: 'Restart',
    historyBtn: 'Ticket Log',
    howToPlayBtn: 'Guide',
    muteBtn: 'Mute',
    unmuteBtn: 'Unmute',
    startTitle: 'Tele-Masr 111 Support Simulator',
    startSubtitle:
      'Step into Cairo’s busiest ISP helpdesk. Diagnose red LOS lights, verify 14-digit National IDs, survive furious gamers, and decide when "Restart the router for 10 seconds" actually works.',
    selectShiftMode: 'Select Shift Mode',
    modeQuick: '90s Rush Shift',
    modeStandard: '150s Full Shift',
    modeEndless: 'Endless Free-Play',
    startShiftCta: 'Start Shift',
    controlsHint: 'Hold Space / Mic to Talk · 1-8 Actions · N Next Call · P Pause · L Language',
    incomingCallLabel: 'Active Caller',
    patienceLabel: 'Customer Patience',
    moodLabel: 'Mood',
    lineStatusLabel: 'Reported Symptom',
    routerUnitTitle: 'Customer Router Unit',
    rebootingBanner: '10-Second Router Reboot in Progress...',
    checkingLineBanner: 'Running Central Office Line & Port Diagnostics...',
    accountSnapshotTitle: 'CRM & Line Telemetry',
    nationalIdLabel: 'National ID (14 Digits)',
    packageLabel: 'Package Tier',
    billingLabel: 'Billing Status',
    quotaLabel: 'Quota Status',
    attenuationLabel: 'Attenuation',
    snrLabel: 'SNR Margin',
    unverifiedText: 'Not requested yet',
    notScannedText: 'Run Line Check',
    transcriptTitle: 'Live Call Transcript',
    agentLabel: 'You (Agent)',
    systemLabel: 'Desk System',
    actionsTitle: 'Support Desk Actions',
    diagnosticsGroup: 'Step 1 · Investigate & Calm',
    resolutionGroup: 'Step 2 · Fix & Close Ticket',
    nextCallBtn: 'Answer Next Call',
    endShiftNowBtn: 'End Shift',
    callResolvedTag: 'Ticket Resolved',
    callDroppedTag: 'Caller Hung Up',
    historyDrawerTitle: 'Shift Ticket Log',
    historyEmpty: 'No tickets closed yet in this shift.',
    closeBtn: 'Close',
    howToTitle: 'How to Survive the 111 Desk',
    howToIntro:
      'Every caller has a hidden technical or billing root cause. Read their clues, use diagnostics wisely, and protect your CSAT rating!',
    howToRules: [
      '1. Speak via Microphone (hold Space or toggle Listen), type a reply, or use buttons 1–8.',
      '2. Ask for National ID (14 digits) to reveal package tier, unpaid invoices, and remaining quota.',
      '3. Run Line & Port Check to see true Attenuation, SNR Margin, and Red LOS status.',
      '4. De-escalate angry callers early—calm them down so they speak slower and share their ID.',
      '5. Only suggest the 10-Second Router Reboot when it makes sense! Red LOS or repeat-rebooters lose patience fast.',
    ],
    summaryTitle: 'End of Shift Report',
    summaryCalls: 'Calls Handled',
    summaryResolved: 'Resolved',
    summaryDropped: 'Hung Up',
    summaryCsat: 'Final CSAT',
    summaryScore: 'Total Score',
    summaryBestStreak: 'Best Streak',
    summaryReboots: 'Router Reboots Ordered',
    summaryIds: '14-Digit IDs Verified',
    summaryPlayAgain: 'Play Again',
    summaryBackTitle: 'Main Menu',
    pausedTitle: 'Shift Paused',
    pausedDesc: 'Take a sip of mint tea. Your active call timer and patience drain are frozen.',
    ledPower: 'PWR',
    ledDsl: 'DSL',
    ledInternet: 'NET',
    ledLos: 'LOS',
    ledWifi: 'WIFI',
    audioSetupBtn: 'Mic & Voice',
    audioModalTitle: 'Headset & Microphone Setup',
    audioModalDesc:
      'Enable your microphone to speak directly with callers in Arabic or English, and test your speaker output for live emotional caller voices.',
    speakerSectionTitle: 'Speaker & Caller Voice (TTS)',
    speakerSupported: 'Speech Synthesis ready',
    speakerUnsupported: 'Browser TTS unavailable — text transcript remains active',
    testSpeakerBtn: 'Test Caller Voice',
    testSpeakerPhrase: 'Hello! Welcome to Tele-Masr 111 support desk. Audio is working clearly!',
    micSectionTitle: 'Agent Microphone (Speech-to-Text)',
    micGranted: 'Microphone permission granted',
    micPending: 'Permission not requested yet',
    micDenied: 'Microphone blocked — use text box or action buttons',
    micUnsupported: 'Speech Recognition unsupported in this browser — use text input & buttons',
    enableMicBtn: 'Allow Microphone',
    continueWithAudioBtn: 'Start Shift with Headset',
    continueTextOnlyBtn: 'Continue with Text & Buttons Only',
    callerSpeakingLabel: 'Caller Speaking...',
    speakerReadyLabel: 'Headset Ready',
    voiceMutedLabel: 'Voice Muted',
    repeatLineBtn: 'Repeat Last Line',
    voiceToggleLabel: 'Voice',
    micHoldLabel: 'Hold / Tap Mic (or Space)',
    micListeningLabel: 'Listening...',
    micToggleListenBtn: 'Continuous Mic',
    micStopListenBtn: 'Stop Mic',
    liveTranscriptLabel: 'Live Voice / Input Parser',
    liveTranscriptPlaceholder: 'Hold Space or tap/hold Mic and speak in English or Egyptian Arabic...',
    recognizedIntentLabel: 'Recognized Intent',
    noIntentDetected: 'Didn’t catch a support action—try mentioning router restart, National ID, line check, billing, or calming the caller.',
    textFallbackPlaceholder: 'Type in English or Arabic (e.g. "restart router 10 seconds")...',
    sendBtn: 'Send',
    micErrorNotAllowed: 'Mic permission blocked (use Chrome/Edge HTTPS or allow mic in browser site settings). You can still type or click actions.',
    micErrorUnsupported: 'Speech recognition is unsupported in this browser. Type below or click actions.',
    micErrorGeneric: 'Speech recognition paused or unavailable here. Type your reply below or click actions.',
  },
  ar: {
    brandTitle: 'تيلي-مصر ١١١',
    brandSubtitle: 'مكتب الدعم الفني وخدمة العملاء',
    langToggle: 'English',
    shiftTimer: 'الوردية',
    endlessLabel: 'مفتوح',
    csatLabel: 'التقييم',
    scoreLabel: 'النقاط',
    streakLabel: 'التتابع',
    resolvedLabel: 'تم الحل',
    droppedLabel: 'قفلوا السكة',
    pauseBtn: 'إيقاف مؤقت',
    resumeBtn: 'استكمال',
    restartShiftBtn: 'إعادة الوردية',
    historyBtn: 'سجل الشكاوى',
    howToPlayBtn: 'طريقة اللعب',
    muteBtn: 'كتم الصوت',
    unmuteBtn: 'تشغيل الصوت',
    startTitle: 'محاكي الدعم الفني — تيلي-مصر ١١١',
    startSubtitle:
      'اقعد على مكتب أشهر كول سنتر إنترنت في مصر! افحص لمبة الـ LOS الحمراء، اطلب الرقم القومي المكون من ١٤ رقم، هدّي الجيمرز المتعصبين، واعرف إمتى تقول "معلش يا فندم اطفي الراوتر ١٠ ثواني".',
    selectShiftMode: 'اختر نظام الوردية',
    modeQuick: 'وردية سريعة (٩٠ ثانية)',
    modeStandard: 'وردية كاملة (١٥٠ ثانية)',
    modeEndless: 'لعب حر (بدون وقت)',
    startShiftCta: 'ابدأ الوردية',
    controlsHint: 'اضغط مطولاً Space / المايك للتحدث · ١-٨ الإجراءات · N التالي · P إيقاف · L اللغة',
    incomingCallLabel: 'المتصل الحالي',
    patienceLabel: 'عداد صبر العميل',
    moodLabel: 'الحالة النفسية',
    lineStatusLabel: 'الشكوى المبدئية',
    routerUnitTitle: 'راوتر العميل (مباشر)',
    rebootingBanner: 'جاري عمل ريستارت للراوتر لمدة ١٠ ثواني...',
    checkingLineBanner: 'جاري فحص الخط والبورت من السنترال...',
    accountSnapshotTitle: 'بيانات الحساب وقراءات الخط',
    nationalIdLabel: 'الرقم القومي (١٤ رقم)',
    packageLabel: 'نظام الباقة',
    billingLabel: 'حالة الفاتورة',
    quotaLabel: 'الاستهلاك',
    attenuationLabel: 'تشويش الخط',
    snrLabel: 'جودة الإشارة SNR',
    unverifiedText: 'لم يتم طلبه بعد',
    notScannedText: 'افحص الخط أولاً',
    transcriptTitle: 'سجل المكالمة المباشر',
    agentLabel: 'أنت (الدعم الفني)',
    systemLabel: 'نظام المكتب',
    actionsTitle: 'إجراءات الدعم الفني',
    diagnosticsGroup: 'الخطوة ١ · الفحص والتهدئة',
    resolutionGroup: 'الخطوة ٢ · الحل والإنهاء',
    nextCallBtn: 'استلام المكالمة التالية',
    endShiftNowBtn: 'إنهاء الوردية',
    callResolvedTag: 'تم حل الشكوى',
    callDroppedTag: 'العميل قفل السكة',
    historyDrawerTitle: 'سجل شكاوى الوردية',
    historyEmpty: 'لم يتم إنهاء أي مكالمة في هذه الوردية بعد.',
    closeBtn: 'إغلاق',
    howToTitle: 'دليل النجاة في مكتب ١١١',
    howToIntro:
      'كل متصل عنده سبب حقيقي مخفي ورا المشكلة. اتكلم بالمايك أو اكتب بالعربي العامي أو الإنجليزي، واختار الحل الصح!',
    howToRules: [
      '١. اتكلم بالمايك (اضغط مطولاً Space أو فعل الاستماع المستمر) أو اكتب رسالتك أو اضغط أزرار ١–٨.',
      '٢. اطلب الرقم القومي (١٤ رقم) عشان تشوف نوع الباقة، الفواتير المتأخرة، ورصيد الجيجات.',
      '٣. اعمل فحص للخط والبورت عشان تكشف التشويش، تعليق السنترال، أو لمبة الـ LOS الحمراء.',
      '٤. هدّي العملاء المتعصبين الأول—عشان يبطلوا زعيق ويدوك الرقم القومي.',
      '٥. ما تطلبش ريستارت ١٠ ثواني عمّال على بطال! اللي لمبته حمراء أو عمل ريستارت ٥ مرات هيتعصب أكتر.',
    ],
    summaryTitle: 'تقرير نهاية الوردية',
    summaryCalls: 'إجمالي المكالمات',
    summaryResolved: 'شكاوى محلولة',
    summaryDropped: 'مكالمات مفقودة',
    summaryCsat: 'تقييم الخدمة',
    summaryScore: 'مجموع النقاط',
    summaryBestStreak: 'أطول سلسلة نجاح',
    summaryReboots: 'مرات طلب الريستارت',
    summaryIds: 'أرقام قومية تم التحقق منها',
    summaryPlayAgain: 'العب تاني',
    summaryBackTitle: 'القائمة الرئيسية',
    pausedTitle: 'الوردية متوقفة مؤقتاً',
    pausedDesc: 'خد بُق شاي بالنعناع. مؤقت الوردية وعداد صبر العميل متوقفين حالياً.',
    ledPower: 'باور',
    ledDsl: 'DSL',
    ledInternet: 'إنترنت',
    ledLos: 'LOS',
    ledWifi: 'واي فاي',
    audioSetupBtn: 'المايك والصوت',
    audioModalTitle: 'إعدادات الميكروفون والسماعة',
    audioModalDesc:
      'فعّل الميكروفون عشان تتكلم مع العملاء بصوتك بالعامية المصرية أو الإنجليزية، واختبر صوت السماعة لسماع انفعالات العملاء.',
    speakerSectionTitle: 'سماعة المكالمات وصوت العميل (TTS)',
    speakerSupported: 'النطق الصوتي جاهز للعمل',
    speakerUnsupported: 'المتصفح لا يدعم النطق الصوتي — السجل النصي يعمل بالكامل',
    testSpeakerBtn: 'اختبار صوت العميل',
    testSpeakerPhrase: 'ألو! أهلاً بك في مكتب دعم تيلي مصر ١١١. الصوت شغال بوضوح!',
    micSectionTitle: 'مايك الموظف (تحويل الصوت لنص)',
    micGranted: 'تم السماح باستخدام الميكروفون',
    micPending: 'لم يتم طلب إذن المايك بعد',
    micDenied: 'الميكروفون مرفوض — يمكنك الكتابة أو استخدام الأزرار',
    micUnsupported: 'المتصفح لا يدعم التعرف على الصوت — استخدم الكتابة أو الأزرار',
    enableMicBtn: 'تفعيل الميكروفون',
    continueWithAudioBtn: 'ابدأ الوردية بالهيدست',
    continueTextOnlyBtn: 'الاستمرار بالكتابة والأزرار فقط',
    callerSpeakingLabel: 'العميل يتحدث الآن...',
    speakerReadyLabel: 'السماعة جاهزة',
    voiceMutedLabel: 'صوت العميل مكتوم',
    repeatLineBtn: 'إعادة آخر جملة',
    voiceToggleLabel: 'الصوت',
    micHoldLabel: 'اضغط أو اثبت على المايك (أو Space)',
    micListeningLabel: 'جاري الاستماع...',
    micToggleListenBtn: 'استماع مستمر',
    micStopListenBtn: 'إيقاف المايك',
    liveTranscriptLabel: 'تحويل الصوت لنص وفهم النية',
    liveTranscriptPlaceholder: 'اضغط على المايك أو Space واتكلم بالمصري أو الإنجليزي...',
    recognizedIntentLabel: 'الإجراء المفهوم',
    noIntentDetected: 'لم يتم تحديد إجراء واضح — جرب قول "رستر الراوتر"، "الرقم القومي"، "فحص الخط"، "الفاتورة"، أو "معلش".',
    textFallbackPlaceholder: 'اكتب ردك بالمصري أو الإنجليزي (مثلاً: معلش يا فندم رستر الراوتر ١٠ ثواني)...',
    sendBtn: 'إرسال',
    micErrorNotAllowed: 'تم حظر إذن المايك (تأكد من السماح للمايك في إعدادات المتصفح). يمكنك الكتابة أو استخدام الأزرار.',
    micErrorUnsupported: 'التعرف على الصوت غير مدعوم في هذا المتصفح. اكتب بالأسفل أو اضغط الأزرار.',
    micErrorGeneric: 'تعذر التقاط الصوت حالياً. يمكنك الكتابة في الخانة بالأسفل أو استخدام الأزرار.',
  },
};

export interface ActionDefinition {
  id: ActionId;
  shortcut: string;
  group: 'diagnostic' | 'resolution';
  label: BilingualText;
  sublabel: BilingualText;
  agentLine: BilingualText;
}

export const ACTIONS: ActionDefinition[] = [
  {
    id: 'ask_id',
    shortcut: '1',
    group: 'diagnostic',
    label: { en: 'Ask for National ID', ar: 'طلب الرقم القومي (١٤ رقم)' },
    sublabel: { en: 'Verify account & billing', ar: 'تأكيد الباقة والفاتورة' },
    agentLine: {
      en: 'May I have your 14-digit National ID to pull up your account details?',
      ar: 'ممكن يا فندم الرقم القومي المكون من ١٤ رقم عشان أراجع بيانات الحساب؟',
    },
  },
  {
    id: 'restart_router',
    shortcut: '2',
    group: 'diagnostic',
    label: { en: 'Restart Router (10s)', ar: 'اطفي الراوتر ١٠ ثواني' },
    sublabel: { en: 'Power-cycle & resync', ar: 'إعادة تشغيل وتحديث الجلسة' },
    agentLine: {
      en: 'Could you please unplug the router, wait 10 seconds, and plug it back in?',
      ar: 'معلش يا فندم اطفي الراوتر من الكهرباء، واستنى ١٠ ثواني، وشغله تاني.',
    },
  },
  {
    id: 'check_line',
    shortcut: '3',
    group: 'diagnostic',
    label: { en: 'Check Line & Port', ar: 'فحص الخط والبورت' },
    sublabel: { en: 'Scan SNR, LOS & DSLAM', ar: 'قياس التشويش وحالة السنترال' },
    agentLine: {
      en: 'One moment please while I run a full line & port diagnostic from our central office.',
      ar: 'لحظة واحدة يا فندم هعمل فحص شامل للخط والبورت من السنترال.',
    },
  },
  {
    id: 'deescalate',
    shortcut: '4',
    group: 'diagnostic',
    label: { en: 'Calm & Empathize', ar: 'تهدئة العميل باحتراف' },
    sublabel: { en: 'Restore caller patience', ar: 'امتصاص الغضب ورفع الصبر' },
    agentLine: {
      en: 'I completely understand your frustration, and I’m staying right on the line with you until we solve this.',
      ar: 'أنا مقدّر جداً انزعاجك يا فندم وحقك عليا، وأنا معاك على الخط خطوة بخطوة لحد ما المشكلة تتحل.',
    },
  },
  {
    id: 'reset_port',
    shortcut: '5',
    group: 'resolution',
    label: { en: 'Reset Central Port', ar: 'تنشيط البورت من السنترال' },
    sublabel: { en: 'Clear stuck DSLAM profile', ar: 'تحديث البروفايل وحل البينج' },
    agentLine: {
      en: 'I’m sending a live Port Reset signal to your DSLAM line right now.',
      ar: 'أنا ببعت إشارة تنشيط وإعادة بناء للبورت من السنترال حالاً يا فندم.',
    },
  },
  {
    id: 'explain_billing',
    shortcut: '6',
    group: 'resolution',
    label: { en: 'Explain Quota / Billing', ar: 'توضيح الباقة / الفاتورة' },
    sublabel: { en: 'Resolve renewal or 2 Mbps cap', ar: 'مراجعة الاستهلاك أو السداد' },
    agentLine: {
      en: 'Let me walk you through your exact quota usage and billing status on the account.',
      ar: 'خليني أوضح لحضرتك تفاصيل استهلاك الباقة وحالة السداد على الحساب.',
    },
  },
  {
    id: 'dispatch_tech',
    shortcut: '7',
    group: 'resolution',
    label: { en: 'Dispatch Technician', ar: 'تحويل لفني صيانة ميداني' },
    sublabel: { en: 'For Red LOS or outdoor faults', ar: 'لحالات قطع الفايبر والتشويش' },
    agentLine: {
      en: 'This requires an outdoor physical check. I’m escalating a priority field technician ticket for you.',
      ar: 'المشكلة في السلك الخارجي وبتحتاج فحص ميداني. هفتح لحضرتك تيكت عاجل لزيارة الفني.',
    },
  },
  {
    id: 'polite_close',
    shortcut: '8',
    group: 'resolution',
    label: { en: 'Polite Wrap-Up', ar: 'إنهاء المكالمة بأدب' },
    sublabel: { en: 'Close verified healthy call', ar: 'إغلاق المكالمة بعد التأكد' },
    agentLine: {
      en: 'Everything is verified and running smoothly. Thank you for calling Tele-Masr 111!',
      ar: 'كده كل حاجة تمام والخدمة شغالة بأفضل شكل. شكراً لاتصالك بتيلي-مصر ١١١!',
    },
  },
];

export function getAgentRank(csat: number, resolved: number): BilingualText {
  if (resolved >= 7 && csat >= 4.6) {
    return { en: 'Legend of Desk 111', ar: 'أسطورة مكتب ١١١' };
  }
  if (csat >= 4.4 && resolved >= 4) {
    return { en: 'Senior Router Whisperer', ar: 'همّاس الراوترات المحترف' };
  }
  if (csat >= 3.8 && resolved >= 2) {
    return { en: 'Steady Shift Specialist', ar: 'أخصائي دعم فني صامد' };
  }
  if (resolved === 0) {
    return { en: 'Trainee on Probation', ar: 'متدرب تحت الاختبار' };
  }
  return { en: 'Survivor of the Night Shift', ar: 'ناجي من وردية الليل' };
}
