export interface UgcFormat {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  description: string;
  cameraAngle: string;
  lighting: string;
  scriptPrompt: string;
  visualPrompt: string;
}

export interface SaudiCreatorPersona {
  id: string;
  name: string;
  nameEn: string;
  gender: "male" | "female";
  age: number;
  role: string;
  city: string;
  dialect: string;
  bio: string;
  avatarUrl: string;
  favoriteKubeDrink: string;
  voiceStyle: string;
  sampleHook: string;
}

export interface ProductStudioPreset {
  id: string;
  name: string;
  category: "coffee_hot" | "coffee_iced" | "bakery_pastry" | "beans_packaging" | "lifestyle_set";
  backdropName: string;
  backdropColor: string;
  lightingDirection: "top" | "front" | "right" | "left" | "rim_back" | "bottom";
  lightingIntensity: "soft_diffused" | "harsh_sunlight" | "cinematic_moody";
  aspectRatio: "1:1" | "9:16" | "4:5" | "16:9";
  cameraLens: string;
  arabicPrompt: string;
  englishPrompt: string;
}

export interface VideoScriptTemplate {
  id: string;
  title: string;
  category: "ugc_review" | "morning_hustle" | "coffee_snob" | "unboxing" | "fomo_discount";
  durationSeconds: 15 | 30;
  targetProduct: string;
  hookScene: {
    duration: string;
    visualAction: string;
    voiceover: string;
    soundEffect: string;
  };
  bodyScene: {
    duration: string;
    visualAction: string;
    voiceover: string;
    soundEffect: string;
  };
  ctaScene: {
    duration: string;
    visualAction: string;
    voiceover: string;
    screenText: string;
  };
}

// 15 صيغ UGC مستوحاة ومطورة من منصة هلاي AI ومخصصة لكافيه KUBE
export const SAUDI_UGC_FORMATS: UgcFormat[] = [
  {
    id: "ugc-1",
    title: "سيلفي مع الكوب",
    titleEn: "Front Camera Selfie with Cup",
    icon: "🤳",
    description: "سيلفي بالكاميرا الأمامية ممسكاً كوب KUBE مع ابتسامة عفوية وإضاءة طبيعية.",
    cameraAngle: "Eye-level 28mm front-facing selfie lens",
    lighting: "Warm golden-hour Riyadh sunlight hitting face and cup",
    scriptPrompt: "بداية سريعة بابتسامة وعين على الكاميرا: 'يا جماعة اللي ما جرب قهوة KUBE اليوم فايته نص عمره...'",
    visualPrompt:
      "Authentic iPhone front-camera selfie of a stylish Saudi youth holding a sleek matte black KUBE coffee cup, genuine smile, subtle Riyadh cafe background blur, warm ambient glow, natural skin tones, hyper-realistic candid portrait, 4k.",
  },
  {
    id: "ugc-2",
    title: "سيلفي المرآة والأوتفت",
    titleEn: "Mirror Outfit & Coffee",
    icon: "🪞",
    description: "سيلفي المرآة يظهر الإطلالة الكاملة مع الكوب والهاتف بتنسيق أنيق وشبابي.",
    cameraAngle: "Mirror reflection shot, 35mm f/2.0",
    lighting: "Soft indoor modern boutique lighting with clean shadows",
    scriptPrompt: "'الأوتفت جاهز، بس بدون كوب KUBE التنسيق ناقص 100% 🖤☕️'",
    visualPrompt:
      "Aesthetic mirror selfie taken in a modern minimalist Riyadh elevator/loft, stylish Gen-Z Saudi creator in modern streetwear holding a branded KUBE iced cup in one hand and smartphone in other, warm travertine reflections, ultra-crisp detail.",
  },
  {
    id: "ugc-3",
    title: "استعد معي للدوام (GRWM)",
    titleEn: "Get Ready With Me Morning Routine",
    icon: "💄",
    description: "روتين الاستعداد الصباحي السريع، ووضع كوب KUBE كوقود البداية ليوم العمل.",
    cameraAngle: "Medium shot on tripod, 50mm f/1.8",
    lighting: "Crisp early morning 7 AM sun streaming through sheer blinds",
    scriptPrompt: "'استعدوا معي لأطول يوم دوام.. والمنقذ الوحيد كالعادة؟ دبل شوت فلات وايت من KUBE.'",
    visualPrompt:
      "Candid POV morning routine scene, neat vanity table with luxury perfumes, modern wristwatch, car keys, and a steaming KUBE flat white cup with intricate latte art, gentle morning sunbeams, cinematic color grading.",
  },
  {
    id: "ugc-4",
    title: "فتح الصندوق POV (Unboxing)",
    titleEn: "Unboxing Bakery & Beans POV",
    icon: "📦",
    description: "يدان تفتحان بوكس الحلى أو كيس البن الفاخر بزاوية الشخص الأول مع صوت القرمشة.",
    cameraAngle: "First-person top-down POV 45 degree angle",
    lighting: "Direct overhead softbox lighting with crisp product highlights",
    scriptPrompt: "'تسمعون صوت القرمشة؟ كرواسون الزعتر واللوز من KUBE يوصلكم حار ومورّق كأنك بالفرن!'",
    visualPrompt:
      "Top-down first-person POV shot, hands opening a premium textured black KUBE takeaway pastry box revealing glistening golden croissants with powdered sugar and almond flakes, steam rising, high-definition macro food photography.",
  },
  {
    id: "ugc-5",
    title: "لقطة المقهى واللابتوب",
    titleEn: "Cafe Work & Study Vibe",
    icon: "☕",
    description: "لقطة عفوية بأجواء مقهى KUBE: لابتوب مفتوح، كوب مقطرة V60، وهدوء تام للإنتاجية.",
    cameraAngle: "Over-the-shoulder 50mm f/1.4 shallow depth of field",
    lighting: "Warm ambient cafe lighting with architectural spotlights",
    scriptPrompt: "'إذا تبغى تخلص شغل أسبوع بساعتين.. هذا الكورنر في KUBE مع V60 إثيوبية هو السر 🤫'",
    visualPrompt:
      "Atmospheric cozy cafe work session at KUBE coffee shop, sleek MacBook open on dark concrete table next to a glass server of pour-over V60 coffee and ceramic cup, warm wooden and travertine cafe interior softly blurred in background.",
  },
  {
    id: "ugc-6",
    title: "داخل السيارة بالرياض",
    titleEn: "In-Car Riyadh Commute",
    icon: "🚗",
    description: "كوب KUBE مستقر بحامل الأكواب أو باليد أمام مقود السيارة مع إطلالة طريق الملك سلمان أو تركي الأول.",
    cameraAngle: "Close-up passenger angle towards driver, 35mm lens",
    lighting: "Golden afternoon sun filtering through tinted car windows",
    scriptPrompt: "'زحمة الدائري ما تنطاق إلا إذا كان معك كولد برو بارد يثبت المزاج 🧊🚗'",
    visualPrompt:
      "Cinematic in-car photography, hands resting on luxury leather steering wheel holding a sweating iced cold brew cup from KUBE with black straw, Riyadh skyline and modern architecture through windshield during golden hour, 8k resolution.",
  },
  {
    id: "ugc-7",
    title: "مراجعة على المكتب",
    titleEn: "Desk Workspace Product Review",
    icon: "🖥️",
    description: "استعراض الكوب والحلويات على مكتب مرتب وشاشة تعرض تصاميم أو أكواد بأناقة.",
    cameraAngle: "Clean diagonal 45-degree angle desk setup",
    lighting: "Screen backlight with soft warm desk lamp illumination",
    scriptPrompt: "'تقييمي الصادق لفرنش توست KUBE الجديد: بدون مبالغة، كرم الكراميل فيه استثنائي 10/10!'",
    visualPrompt:
      "Clean tech workspace aesthetic, ultra-wide curved monitor showing creative work, mechanical keyboard, and a freshly prepared KUBE French toast plate alongside an iced Spanish latte, crisp minimalist product styling.",
  },
  {
    id: "ugc-8",
    title: "لقطة الباريستا والتحضير",
    titleEn: "Barista Pouring & Craftsmanship",
    icon: "🍳",
    description: "حركة سكب الحليب على الإسبريسو أو تقطير القهوة ببطء مع صوت تدفق القهوة الفاخر.",
    cameraAngle: "Ultra-macro 100mm f/2.8 lens at eye-level with the cup rim",
    lighting: "High-contrast directional side lighting showing liquid glossy reflection",
    scriptPrompt: "'فن التقطير مو بس ماي وبن.. في KUBE كل قطرة محسوبة بالثانية والغرام 👌'",
    visualPrompt:
      "Mesmerizing macro shot of silky micro-foam milk being poured into rich amber crema of espresso inside a ceramic KUBE cup, creating a flawless tulip latte art, droplets in air, deep volumetric rim lighting, studio quality.",
  },
  {
    id: "ugc-9",
    title: "ستايل الشارع والمشي",
    titleEn: "Street Style Walking Shot",
    icon: "🚶",
    description: "لقطة ديناميكية أثناء المشي في شوارع الرياض الحديثة مع الكوب في اليد وخطوات واثقة.",
    cameraAngle: "Low tracking angle moving backwards, 24mm f/2.8",
    lighting: "Bright Riyadh daylight with crisp modern architecture shadows",
    scriptPrompt: "'خطوات الصباح السريعة ما تكمل إلا مع قهوة تفتح المخ وتعدل المزاج ⚡️'",
    visualPrompt:
      "Dynamic urban street style photo, young Saudi professional walking outside modern glass architectural buildings in Riyadh, carrying a takeaway iced cup with minimalist KUBE branding, motion blur in background, high-fashion editorial feel.",
  },
  {
    id: "ugc-10",
    title: "لقطة التذوق الحسية القريبة",
    titleEn: "Sensory Taste Close-Up",
    icon: "✨",
    description: "لقطة قريبة جداً لكوب القهوة المثلجة مع قطرات الندى وانعكاس الضوء على مكعبات الثلج الشفافة.",
    cameraAngle: "Extreme macro 90mm f/2.8, 1:1 reproduction",
    lighting: "Backlit transparency revealing crystal clear ice clarity and amber hues",
    scriptPrompt: "'الإيحاءات الزهرية والفاكهية بهذا المحصول واضحة من أول رشفة.. شيء يروق الروح!'",
    visualPrompt:
      "Extreme macro close-up of crystal clear square ice cubes clinking in rich cascara-colored iced drip coffee, condensation droplets running down the exterior of the sleek glass, glistening highlights, razor-sharp focus.",
  },
  {
    id: "ugc-11",
    title: "النادي واللياقة (Pre-Workout)",
    titleEn: "Fitness & Pre-Workout Caffeine",
    icon: "🏋️",
    description: "لقطة قبل التمرين أو داخل النادي الرياضي مع كولد برو أو أمريكانو كبديل صحي لمشروبات الطاقة.",
    cameraAngle: "Eye-level gym locker or bench shot, 35mm lens",
    lighting: "Punchy athletic contrast lighting with neon and metallic accents",
    scriptPrompt: "'تبي بمب وطاقة نظيفة قبل التمرين؟ دبل شوت أمريكانو مثلج من KUBE وبدون أي سكر مضاف 💪🔥'",
    visualPrompt:
      "Athletic lifestyle composition, gym bag, lifting straps, smart fitness band, and a tall chilled black cold brew cup from KUBE resting on a weight bench, moody gym lighting with subtle green/white LED glow.",
  },
  {
    id: "ugc-12",
    title: "أجواء الاسترخاء المنزلي",
    titleEn: "Cozy Home Weekend Chill",
    icon: "🛋️",
    description: "أجواء استرخاء مريحة يوم الجمعة والسبت مع كوب دافئ وكتاب أو شاشة تلفزيون هادئة.",
    cameraAngle: "High 45-degree angle on soft linen blanket",
    lighting: "Warm 2700K ambient lamp lighting and candle glow",
    scriptPrompt: "'روقان عطلة نهاية الأسبوع ما يحتاج غير زاوية هادية وكوب قهوة دافي من محصول KUBE المنزلي 🤍'",
    visualPrompt:
      "Cozy weekend living room setting, textured wool throw blanket, open hardcover book, warm ceramic mug with KUBE logo steaming gently on a low oak coffee table, soft cinematic twilight lighting.",
  },
  {
    id: "ugc-13",
    title: "تجربة ومقارنة المشروبات",
    titleEn: "Taste Test & Comparison",
    icon: "🥤",
    description: "كوبين بجانب بعض (مثلاً آيس دريب vs كولد برو كولومبي) مع مقارنة سريعة وتوصية للمتابعين.",
    cameraAngle: "Straight-on eye level dual-product staging",
    lighting: "Even studio softbox illumination highlighting both cups equally",
    scriptPrompt: "'محتار بين الآيس دريب والكولد برو؟ جربنا الاثنين والنتيجة صدمتنا بالفرق في الحمضية والقوام!'",
    visualPrompt:
      "Side-by-side comparison shot of two cold signature coffee drinks from KUBE, one rich caramel-colored and one layered iced matcha-espresso, resting on a polished dark slate platform, clean studio lighting.",
  },
  {
    id: "ugc-14",
    title: "التقنية وتطبيق KUBE في اليد",
    titleEn: "Tech & Mobile App in Hand",
    icon: "📱",
    description: "يد ممسكة بالهاتف أثناء الطلب المسبق عبر التطبيق والوصول للاستلام دون أي انتظار.",
    cameraAngle: "Overhead 45-degree POV focusing on phone screen and cup handover",
    lighting: "Clean modern interior counter lighting",
    scriptPrompt: "'تطلب وأنت بطريقك، وتوصل تلقى قهوتك باردة وتستناك بدون دقيقة انتظار.. راحة بال حقيقية 📲⚡️'",
    visualPrompt:
      "POV shot of a customer's hand holding a high-end smartphone with KUBE ordering screen visible, while other hand receives the ready coffee cup from the barista across a sleek brushed aluminum counter.",
  },
  {
    id: "ugc-15",
    title: "شهادة صادقة أمام الكاميرا",
    titleEn: "Honest Creator Testimonial",
    icon: "🗣️",
    description: "صانع محتوى يتحدث مباشرة للكاميرا بتلقائية وعفوية مطلقة عن سر تميز KUBE في قهوة الصباح.",
    cameraAngle: "Eye-level medium portrait, 35mm lens with natural bokeh",
    lighting: "Soft flattering natural ring-light with authentic catchlights in eyes",
    scriptPrompt: "'أنا من الناس اللي إذا قهوة الصباح ما كانت مضبوطة ينعفس يومي كامل.. بس KUBE عمرهم ما خيبوا ظني!'",
    visualPrompt:
      "Authentic testimonial video still of an expressive Saudi creator speaking directly to camera with genuine enthusiasm, holding a KUBE cup close to chest, natural Riyadh coffee shop ambiance softly blurred behind.",
  },
];

// مكتبة الشخصيات السعودية الافتراضية لإنتاج المحتوى (مستوحاة من بنك شخصيات هلاي AI)
export const SAUDI_CREATOR_PERSONAS: SaudiCreatorPersona[] = [
  {
    id: "creator-sultan",
    name: "سلطان",
    nameEn: "Sultan",
    gender: "male",
    age: 24,
    role: "مهندس برمجيات ورياضي",
    city: "الرياض — حي النرجس",
    dialect: "نجدية شبابية سريعة ومختصرة",
    bio: "يحب التكنولوجيا، النادي، والكولد برو الأسود بدون سكر. أسلوبه مباشر ومقنع لفئة الشباب التقنيين.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/sultan.png",
    favoriteKubeDrink: "كولد برو كيني مركز 🧊",
    voiceStyle: "نبرة واثقة، حماسية، مع مصطلحات تقنية وشبابية سريعة.",
    sampleHook: "يا جماعة، لقيت الحل اللي يخليك تركز 6 ساعات متواصلة بدون خمول بعد الدوام..",
  },
  {
    id: "creator-noura",
    name: "نورة",
    nameEn: "Noura",
    gender: "female",
    age: 22,
    role: "طالبة عمارة ومصممة ديكور",
    city: "الرياض — حي حطين",
    dialect: "نجدية راقية وعفوية مع مفردات جمالية",
    bio: "عاشقة للجماليات والتفاصيل المعمارية. مشروبها المفضل V60 إثيوبي حار مع كرواسون لوز مقرمش.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/olivia.png",
    favoriteKubeDrink: "V60 إثيوبيا قوجي فاخرة ☕️",
    voiceStyle: "نبرة هادئة، دافئة، تنقل الإحساس بالروقان والفخامة.",
    sampleHook: "التفاصيل الصغيرة هنا في KUBE هي اللي تخليك تحس بالفرق من أول خطوة بالفرع..",
  },
  {
    id: "creator-faisal",
    name: "فيصل",
    nameEn: "Faisal",
    gender: "male",
    age: 28,
    role: "مستشار مالي ومحب للقهوة المختصة",
    city: "الرياض — طريق الملك فهد",
    dialect: "سعودية مهنية أنيقة ولبقة",
    bio: "دقيق في اختياراته، لا يقبل إلا بالجودة العالية وقوام الإسبريسو المتوازن. صديق الصباح الباكر.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/faisal.png",
    favoriteKubeDrink: "فلات وايت بحليب الشوفان ☕️",
    voiceStyle: "نبرة قيادية رصينة ومريحة تعكس الخبرة والذوق الرفيع.",
    sampleHook: "في عالم القهوة المختصة، التناسق والثبات هو المعيار الحقيقي.. وKUBE يثبت هذا الشي كل يوم.",
  },
  {
    id: "creator-reema",
    name: "ريما",
    nameEn: "Reema",
    gender: "female",
    age: 25,
    role: "صانعة محتوى سياحة ولايف ستايل",
    city: "الرياض — حي الياسمين",
    dialect: "لهجة بيضاء تفاعلية ومرحة",
    bio: "تتابع الهبات وأجدد الكافيهات في الرياض. تحب الماتشا المثلجة والحلويات المبتكرة وتصوير التيك توك.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/reema.png",
    favoriteKubeDrink: "آيس سبانش لاتيه مع فرنش توست كراميل 🍯",
    voiceStyle: "طاقة عالية، تشويقية، مناسبة جداً لفيديوهات الريلز والتيك توك الفيروسية.",
    sampleHook: "بنات! وقّفوا كل شي عندكم وشوفوا هالحلى الجديد من KUBE.. الطعم مو طبيعي!",
  },
  {
    id: "creator-turki",
    name: "تركي",
    nameEn: "Turki",
    gender: "male",
    age: 20,
    role: "طالب جامعي ومصور هاوٍ",
    city: "الرياض — حي الصحافة",
    dialect: "نجدية شبابية خفيفة الدم (سياق برق وstc)",
    bio: "متخصص في أوقات المذاكرة والفاينلز وعروض الكومبو. يحب القهوة السريعة قبل المحاضرة الأولى.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=560,quality=80,format=auto/cms/studios/characters/weird/weird_hamoud.png",
    favoriteKubeDrink: "قهوة اليوم مقطرة مثلجة مع كوكيز شوكولاتة 🍪",
    voiceStyle: "عفوي جداً ومرح، يستخدم الميمز وترندات إكس وتيك توك بذكاء.",
    sampleHook: "شكلي وأنا مقفل ملف الفاينلز بفضل قهوة اليوم من KUBE.. تعال أعلمك كيف توفر!",
  },
  {
    id: "creator-hessa",
    name: "حصة",
    nameEn: "Hessa",
    gender: "female",
    age: 26,
    role: "متذوقة حلويات وشيف معجنات",
    city: "الرياض — حي الملقا",
    dialect: "نجدية عذبة ودافئة",
    bio: "تقيّم المخابز ونقاء الزبدة والخميرة. مبهورة بخبز المطبخ الخاص في KUBE والكرواسون المورق.",
    avatarUrl: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/hessa.png",
    favoriteKubeDrink: "كرواسون شوكولاتة بلجيكية مع كورتادو 🥐",
    voiceStyle: "شغوفة وحسية تشعرك بطعم وملمس المخبوزات قبل أن تجربها.",
    sampleHook: "السر في أي مخبز مو الحشو.. السر في توريق العجينة، وشوفوا التوريق هنا كيف هش ومثالي!",
  },
];


// استوديو المنتجات ثلاثي الأبعاد وإعدادات الاستوديو المخصصة لكافيه KUBE
export const KUBE_PRODUCT_STUDIO_PRESETS: ProductStudioPreset[] = [
  {
    id: "preset-1",
    name: "استوديو الرخام الأسود الفاخر (Signature KUBE)",
    category: "coffee_iced",
    backdropName: "Dark Nero Marquina Marble with Gold Veining",
    backdropColor: "#111113",
    lightingDirection: "rim_back",
    lightingIntensity: "cinematic_moody",
    aspectRatio: "1:1",
    cameraLens: "Hasselblad 85mm f/1.4 Portrait Prime",
    arabicPrompt:
      "تصوير منتج إعلاني لكوب قهوة مثلجة من KUBE فوق طاولة رخام أسود نيرو ماركينا فاخر مع عروق ذهبية دقيقة، قطرات ندى كريستالية على الكوب الشفاف، مكعبات ثلج نقية، إضاءة سينمائية محيطية دافئة بلون العنبر، دقة 8K فائقة الواقعية.",
    englishPrompt:
      "Commercial studio product shot of KUBE branded iced cold brew coffee cup sitting on luxurious Nero Marquina black marble with delicate warm golden veins. Crisp condensation droplets on exterior, crystal clear artisanal ice cubes, golden liquid amber glow, cinematic rim lighting, ultra-sharp 8k resolution, Hasselblad 85mm f/1.4 commercial photography.",
  },
  {
    id: "preset-2",
    name: "استوديو حجر الترافيرتين المعماري النيود",
    category: "coffee_hot",
    backdropName: "Beige Italian Travertine Stone with Natural Pores",
    backdropColor: "#D8CEBE",
    lightingDirection: "left",
    lightingIntensity: "soft_diffused",
    aspectRatio: "4:5",
    cameraLens: "Sony 50mm f/1.8 G Master",
    arabicPrompt:
      "تصوير فوتوغرافي تجاري لكوب فلات وايت سيراميك مطفي مع شعار KUBE فوق كتلة حجر ترافيرتين إيطالي بيج ذو مسام طبيعية، رسمة لاتيه آرت دقيقة متقنة، إضاءة شمسية ناعمة من نافذة جانبية، أجواء هدوء وفخامة حديثة.",
    englishPrompt:
      "Editorial product photography of KUBE matte grey ceramic flat white cup with intricate rosetta latte art, placed on natural beige Italian travertine stone podium, soft morning light coming from left side creating gentle shadows, minimalist luxury cafe aesthetic, 4k high-end magazine quality.",
  },
  {
    id: "preset-3",
    name: "استوديو حلويات ومخبوزات KUBE الطازجة",
    category: "bakery_pastry",
    backdropName: "Warm Brushed Brass & Dark Walnut Wood",
    backdropColor: "#2A201A",
    lightingDirection: "top",
    lightingIntensity: "soft_diffused",
    aspectRatio: "1:1",
    cameraLens: "Canon RF 100mm f/2.8L Macro IS USM",
    arabicPrompt:
      "تصوير ماكرو إعلاني لكرواسون باللوز المحمص وسكر البودرة المتساقط، بجانب صحن فرنش توست بكراميل يتصبب ببطء، فوق خشب الجوز الداكن ولمسات نحاسية ناعمة، بخار دافئ خفيف، إضاءة علوية تجعل لمعان السكر يبرق بجاذبية لا تقاوم.",
    englishPrompt:
      "Appetizing commercial macro shot of freshly baked KUBE almond croissant with delicate powdered sugar dusted on top, next to artisan caramelized French toast with dripping warm toffee sauce, resting on dark walnut wooden board with brushed brass accents, soft overhead spotlight, ultra-detailed textures, mouth-watering food ad.",
  },
  {
    id: "preset-4",
    name: "استوديو أكياس ومحاصيل البن المختص",
    category: "beans_packaging",
    backdropName: "Architectural Concrete & Neon Ambient Accent",
    backdropColor: "#1E1E24",
    lightingDirection: "right",
    lightingIntensity: "cinematic_moody",
    aspectRatio: "9:16",
    cameraLens: "Leica 35mm f/1.4 Summilux",
    arabicPrompt:
      "تصوير تجاري لكيس بن KUBE المختص الفاخر ذو اللون الأسود المطفي مع خط عربي أنيق، وحبوب بن كولومبي محمصة حديثاً مبعثرة بأناقة في المقدمة، خلفية خرسانة معمارية حديثة مع خط نيون عنبري خفيف يعكس طابع Nothing Design الحديث.",
    englishPrompt:
      "High-end packaging hero shot of KUBE Specialty Coffee 250g matte black roasted bean bag with minimalist typography, surrounded by freshly roasted glossy coffee beans scattered artfully, modern architectural concrete podium, subtle amber neon ambient backlight, premium Nothing-style product staging, 8k render.",
  },
  {
    id: "preset-5",
    name: "استوديو شتاء الرياض والسيارة الفارهة",
    category: "lifestyle_set",
    backdropName: "Riyadh Skyline at Dusk & Luxury Leather Interior",
    backdropColor: "#1A2238",
    lightingDirection: "front",
    lightingIntensity: "harsh_sunlight",
    aspectRatio: "9:16",
    cameraLens: "24-70mm f/2.8 Pro Zoom",
    arabicPrompt:
      "تصوير نمط حياة إعلاني لكوب دريب مثلج من KUBE مستقر داخل حامل أكواب سيارة فاخرة في طريق تركي الأول بالرياض، غروب شمس شتوي بلون برتقالي وبنفسجي، أبراج الرياض الزجاجية في الأفق، شعور بالفخامة والروقان السعودي الأصيل.",
    englishPrompt:
      "Cinematic lifestyle commercial photo, KUBE iced drip coffee cup in cup holder of a luxury vehicle on Turki Al Awwal road in Riyadh during winter dusk, warm orange and purple sunset sky reflecting off glass skyscraper towers, authentic high-status Riyadh lifestyle atmosphere, ultra-realistic.",
  },
];

// سكريبتات إعلانية للفيديو والـ UGC مدربة على أبرز الحملات السعودية
export const KUBE_VIDEO_SCRIPTS: VideoScriptTemplate[] = [
  {
    id: "script-1",
    title: "سكريبت الفاينلز والمذاكرة — 'المنقذ في أسبوع الضغط'",
    category: "fomo_discount",
    durationSeconds: 15,
    targetProduct: "كومبو المذاكرة (كولد برو + كوكيز طازج)",
    hookScene: {
      duration: "0-3 ثوانٍ",
      visualAction: "الشخصية (تركي) يدخل الغرفة ويرمي شنطة الجامعة على السرير بتعب ويطالع الكاميرا بصدمة.",
      voiceover: "لو باقي لك 48 ساعة على الفاينل وما فتحت المنهج.. أسمع مني ولا تضيع وقت!",
      soundEffect: "صوت رمي الشنطة السريع + انتقال Whoosh حماسي",
    },
    bodyScene: {
      duration: "3-10 ثوانٍ",
      visualAction: "لقطة سريعة لفتح بوكس KUBE، سكب الحليب على الإسبريسو وقطرات الندى على كوب الكولد برو.",
      voiceover: "مر أقرب فرع KUBE واطلب كومبو المذاكرة، كولد برو يطير النوم وكوكيز يديك طاقة تصمل للفجر.",
      soundEffect: "صوت فتح البوكس + تكسير الكوكيز الطازج + موسيقى بيانو حماسية سريعة",
    },
    ctaScene: {
      duration: "10-15 ثانية",
      visualAction: "تركي يبتسم للكاميرا ويرفع الكوب، تظهر شاشة الخصم 20% للطلاب بالباركود.",
      voiceover: "ورهم بطاقتك الجامعية وخذ خصم 20% فوري، لا تشيل هم الفاينل مع KUBE!",
      screenText: "خصم 20% للطلاب | كود: EXAM20 | اطلب عبر التطبيق",
    },
  },
  {
    id: "script-2",
    title: "سكريبت الصباح الباكر — 'سحبة الدوام اللي تستاهل'",
    category: "morning_hustle",
    durationSeconds: 30,
    targetProduct: "فلات وايت + كرواسون لوز دافئ",
    hookScene: {
      duration: "0-5 ثوانٍ",
      visualAction: "نورة تشغل منبه الجوال الساعة 6:45 صباحاً وتطفيه بابتسامة، لقطة سريعة للمرآة مع الكوب.",
      voiceover: "في ناس تصحى بدري عشان الدوام.. وفي ناس تصحى بدري عشان فلات وايت KUBE قبل الزحمة ☕️",
      soundEffect: "صوت منبه الهاتف الهادئ ينقطع بلمسة + صوت خطوات الصباح الهادئة",
    },
    bodyScene: {
      duration: "5-22 ثانية",
      visualAction: "لقطة من داخل فرع KUBE: هدوء، شمس الصباح تدخل من الزجاج، الباريستا يحضر الكوب برسمة متقنة ويسلم الكرواسون المقرمش.",
      voiceover: "الريحة لحالها تعطيك سلام نفسي، والكرواسون مورق ومقرمش بطريقة تخليك تنسى أي ضغط ينتظرك بالمكتب.",
      soundEffect: "صوت بخار ماكينة الإسبريسو + قرمشة الكرواسون الهشة والواضحة (ASMR)",
    },
    ctaScene: {
      duration: "22-30 ثانية",
      visualAction: "نورة تركب سيارتها وتحط الكوب، تلوح للكاميرا بتفاؤل.",
      voiceover: "ابدأ صباحك صح، اطلب مسبقاً من التطبيق واستلمها بدون انتظار على طريقك!",
      screenText: "كومبو الصباح بـ 18 ريال حتى 11 ص | كافيه ومطبخ KUBE",
    },
  },
  {
    id: "script-3",
    title: "سكريبت روقان القهوة المختصة — 'تذوق يغير نظرتك للقهوة'",
    category: "coffee_snob",
    durationSeconds: 30,
    targetProduct: "V60 إثيوبيا قوجي مجففة",
    hookScene: {
      duration: "0-5 ثوانٍ",
      visualAction: "فيصل يشم سيرفر القهوة المقطرة، يغمض عينه بتركيز وابتسامة دهشة وينظر مباشرة للعدسة.",
      voiceover: "إذا تحسب كل القهوة طعمها واحد، معليش.. أنت ما جربت محصول إثيوبيا قوجي في KUBE.",
      soundEffect: "موسيقى جاز هادئة + صوت صب القهوة الهادئ داخل السيرفر الزجاجي",
    },
    bodyScene: {
      duration: "5-22 ثانية",
      visualAction: "ماكرو بطيء لحبوب البن أثناء الطحن، تقطير متناغم للماء الساخن على البن المتفتح (Blooming) مع تصاعد البخار العطري.",
      voiceover: "إيحاءات توت أسود، خوخ، وياسمين واضحة بدون أي إضافات.. بس نقاء المحصول واحترافية التحميص والتحضير.",
      soundEffect: "صوت طاحونة البن الفاخرة + تنقيط القهوة المتناغم",
    },
    ctaScene: {
      duration: "22-30 ثانية",
      visualAction: "لقطة لكيس البن مع كوب التقديم الأنيق، ونص العرض على الشاشة.",
      voiceover: "تذوقها في فروعنا اليوم، أو خذ باقة البن لبيتك مع هدية كوب تذوق مجاني.",
      screenText: "محصول الأسبوع: إثيوبيا قوجي | متوفر في الفرع والمتجر الإلكتروني",
    },
  },
];

// إعدادات Brand Kit لكافيه KUBE (مستوحاة من Brand Kit في منصة هلاي)
export const KUBE_BRAND_KIT = {
  brandNameAr: "كافيه ومطبخ كيوب",
  brandNameEn: "KUBE Kitchen & Specialty Coffee",
  sloganAr: "مختصّة.. بأسلوب يليق بذائقتك في الرياض",
  sloganEn: "Precision Crafted Specialty Coffee & Kitchen",
  location: "المملكة العربية السعودية — الرياض",
  targetAudience: "الشباب، رواد الأعمال، طلاب الجامعات، ومحبي القهوة المختصة (16 - 32 سنة)",
  brandTone: "راقي، معاصر، سعودي أصيل، عفوي بروح شبابية ذكية ومباشرة",
  coreValues: ["جودة المحاصيل المختصة", "السرعة والتكنولوجيا", "الضيافة السعودية بحفاوة", "جماليات التصميم الحديث"],
  brandKeywords: [
    "روقان",
    "قهوة مختصة",
    "الرياض",
    "V60",
    "كولد برو",
    "صباح الخير",
    "سحبة دوام",
    "فاينلز",
    "كرواسون طازج",
    "KUBE",
    "ترند",
    "برق",
  ],
  rulesAndConstraints: [
    "الالتزام باللهجة النجدية البيضاء الطبيعية والمحببة للشباب في الرياض دون تكلف.",
    "الابتعاد تماماً عن الكلمات المترجمة ترجمة آلية جافة (مثل: 'قم بتذوق السعادة' أو 'انقر هنا').",
    "إبراز عنصر السرعة والطلب المسبق وحيوية اليوم مع المحافظة على معايير القهوة المختصة الراقية.",
    "الحرص على تضمين دعوة للتفاعل (CTA) ذكية مثل: 'منشن خويك اللي يحتاج يصحصح' أو 'مرنا قبل زحمة الدائري'.",
  ],
  colorPalette: [
    { name: "Matte Black", hex: "#0F0F11", role: "اللون الأساسي والخلفية" },
    { name: "Travertine Cream", hex: "#E8E2D5", role: "لون النصوص والحجر الطبيعي" },
    { name: "KUBE Red Accent", hex: "#E11D48", role: "لون التفاعل والأزرار الحيوية" },
    { name: "Warm Amber", hex: "#D97706", role: "لون إضاءة القهوة والكراميل" },
    { name: "Charcoal Slate", hex: "#1F2128", role: "لون البطاقات والكونتينرات" },
  ],
};
