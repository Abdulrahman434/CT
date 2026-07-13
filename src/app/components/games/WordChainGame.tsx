import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Trophy, RotateCcw } from 'lucide-react';
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from '../ThemeContext';
import { useLocale } from '../i18n';
import GameLanguageToggle from './GameLanguageToggle';
import { GAME_TRANSLATIONS } from './gameTranslations';

type Category = 'animals' | 'countries' | 'foods';

const DICTIONARIES_EN: Record<Category, string[]> = {
  animals: [
    'cat', 'dog', 'tiger', 'lion', 'elephant', 'giraffe', 'zebra', 'panda', 'kangaroo', 'koala', 'hippo', 'rhino', 'monkey', 'gorilla', 'chimpanzee', 'baboon', 'lemur', 'sloth', 'bear', 'wolf', 'fox', 'coyote', 'hyena', 'leopard', 'cheetah', 'jaguar', 'panther', 'deer', 'moose', 'elk', 'reindeer', 'camel', 'llama', 'alpaca', 'horse', 'donkey', 'mule', 'zebra', 'pig', 'cow', 'sheep', 'goat', 'chicken', 'duck', 'goose', 'turkey', 'peacock', 'eagle', 'hawk', 'falcon', 'owl', 'parrot', 'penguin', 'ostrich', 'emu', 'flamingo', 'swan', 'stork', 'pelican', 'seagull', 'whale', 'dolphin', 'shark', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'turtle', 'tortoise', 'snake', 'lizard', 'crocodile', 'alligator', 'frog', 'toad', 'salamander', 'newt', 'bee', 'wasp', 'ant', 'butterfly', 'moth', 'spider', 'scorpion', 'beetle', 'ladybug', 'mosquito', 'fly', 'dragonfly', 'bat', 'rabbit', 'hare', 'squirrel', 'chipmunk', 'beaver', 'otter', 'seal', 'walrus', 'penguin', 'polar bear', 'panda', 'koala', 'sloth', 'armadillo', 'hedgehog', 'mole', 'rat', 'mouse', 'hamster', 'guinea pig', 'gerbil'
  ],
  countries: [
    'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'antigua', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan', 'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan', 'bolivia', 'bosnia', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burkina faso', 'burundi', 'cambodia', 'cameroon', 'canada', 'cape verde', 'central african republic', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo', 'costa rica', 'croatia', 'cuba', 'cyprus', 'czech republic', 'denmark', 'djibouti', 'dominica', 'dominican republic', 'ecuador', 'egypt', 'el salvador', 'equatorial guinea', 'eritrea', 'estonia', 'eswatini', 'ethiopia', 'fiji', 'finland', 'france', 'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guyana', 'haiti', 'honduras', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy', 'jamaica', 'japan', 'jordan', 'kazakhstan', 'kenya', 'kiribati', 'north korea', 'south korea', 'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg', 'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall islands', 'mauritania', 'mauritius', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar', 'namibia', 'nauru', 'nepal', 'netherlands', 'new zealand', 'nicaragua', 'niger', 'nigeria', 'north macedonia', 'norway', 'oman', 'pakistan', 'palau', 'palestine', 'panama', 'papua new guinea', 'paraguay', 'peru', 'philippines', 'poland', 'portugal', 'qatar', 'romania', 'russia', 'rwanda', 'saint kitts', 'saint lucia', 'saint vincent', 'samoa', 'san marino', 'sao tome', 'saudi arabia', 'senegal', 'serbia', 'seychelles', 'sierra leone', 'singapore', 'slovakia', 'slovenia', 'solomon islands', 'somalia', 'south africa', 'south sudan', 'spain', 'sri lanka', 'sudan', 'suriname', 'sweden', 'switzerland', 'syria', 'taiwan', 'tajikistan', 'tanzania', 'thailand', 'timor-leste', 'togo', 'tonga', 'trinidad and tobago', 'tunisia', 'turkey', 'turkmenistan', 'tuvalu', 'uganda', 'ukraine', 'united arab emirates', 'united kingdom', 'united states', 'usa', 'america', 'uruguay', 'uzbekistan', 'vanuatu', 'vatican city', 'venezuela', 'vietnam', 'yemen', 'zambia', 'zimbabwe'
  ],
  foods: [
    'apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'pineapple', 'mango', 'peach', 'pear', 'plum', 'cherry', 'blueberry', 'raspberry', 'blackberry', 'kiwi', 'lemon', 'lime', 'coconut', 'avocado', 'tomato', 'potato', 'onion', 'garlic', 'carrot', 'broccoli', 'cauliflower', 'spinach', 'lettuce', 'cucumber', 'pepper', 'corn', 'pea', 'bean', 'lentil', 'rice', 'bread', 'pasta', 'noodle', 'pizza', 'burger', 'sandwich', 'taco', 'sushi', 'steak', 'chicken', 'fish', 'shrimp', 'egg', 'milk', 'cheese', 'butter', 'yogurt', 'ice cream', 'cake', 'cookie', 'pie', 'candy', 'chocolate', 'honey', 'sugar', 'salt', 'pepper', 'olive', 'oil', 'vinegar', 'soup', 'salad', 'toast', 'cereal', 'pancake', 'waffle', 'coffee', 'tea', 'juice', 'soda', 'water', 'wine', 'beer', 'nut', 'almond', 'walnut', 'peanut', 'cashew', 'pistachio', 'ham', 'bacon', 'sausage', 'salami'
  ]
};

const DICTIONARIES_AR: Record<Category, string[]> = {
  animals: [
    'قط', 'كلب', 'نمر', 'اسد', 'فيل', 'زرافة', 'حمار وحشي', 'باندا', 'كنغر', 'كوالا',
    'فرس النهر', 'وحيد القرن', 'قرد', 'غوريلا', 'دب', 'ذئب', 'ثعلب', 'ضبع', 'فهد',
    'غزال', 'جمل', 'حصان', 'حمار', 'خروف', 'ماعز', 'دجاجة', 'بطة', 'اوزة', 'ديك رومي',
    'طاووس', 'نسر', 'صقر', 'بومة', 'ببغاء', 'بطريق', 'نعامة', 'بجعة', 'لقلق',
    'حوت', 'دلفين', 'قرش', 'اخطبوط', 'سلطعون', 'سلحفاة', 'ثعبان', 'سحلية',
    'تمساح', 'ضفدع', 'نحلة', 'نملة', 'فراشة', 'عنكبوت', 'عقرب', 'خنفساء',
    'بعوضة', 'ذبابة', 'خفاش', 'ارنب', 'سنجاب', 'قندس', 'فقمة', 'قنفذ',
    'فار', 'هامستر', 'حرباء', 'يمامة', 'هدهد', 'حبارى', 'وعل', 'ظبي',
    'جاموس', 'بقرة', 'ثور', 'عصفور', 'حمامة', 'غراب', 'صرصور', 'دودة',
    'سمكة', 'روبيان', 'محار', 'حلزون', 'سلمون', 'طائر', 'حية', 'وزغة'
  ],
  countries: [
    'مصر', 'سوريا', 'لبنان', 'الاردن', 'العراق', 'فلسطين', 'اليمن', 'ليبيا',
    'تونس', 'الجزائر', 'المغرب', 'السودان', 'عمان', 'قطر', 'البحرين', 'الكويت',
    'السعودية', 'الامارات', 'موريتانيا', 'جيبوتي', 'الصومال', 'جزر القمر',
    'تركيا', 'ايران', 'باكستان', 'افغانستان', 'الهند', 'الصين', 'اليابان',
    'كوريا', 'تايلاند', 'ماليزيا', 'اندونيسيا', 'فيتنام', 'بنغلاديش',
    'فرنسا', 'المانيا', 'بريطانيا', 'ايطاليا', 'اسبانيا', 'البرتغال',
    'هولندا', 'بلجيكا', 'سويسرا', 'النمسا', 'بولندا', 'رومانيا',
    'اليونان', 'السويد', 'النرويج', 'الدنمارك', 'فنلندا', 'روسيا',
    'اوكرانيا', 'البرازيل', 'الارجنتين', 'المكسيك', 'كندا', 'امريكا',
    'كولومبيا', 'تشيلي', 'بيرو', 'كوبا', 'نيجيريا', 'كينيا',
    'اثيوبيا', 'تنزانيا', 'جنوب افريقيا', 'غانا', 'الكاميرون', 'السنغال',
    'استراليا', 'نيوزيلندا'
  ],
  foods: [
    'تفاح', 'موز', 'برتقال', 'فراولة', 'عنب', 'بطيخ', 'اناناس', 'مانجو',
    'خوخ', 'كمثرى', 'برقوق', 'كرز', 'توت', 'ليمون', 'جوز هند', 'افوكادو',
    'طماطم', 'بطاطس', 'بصل', 'ثوم', 'جزر', 'بروكلي', 'قرنبيط', 'سبانخ',
    'خس', 'خيار', 'فلفل', 'ذرة', 'بازلاء', 'فاصوليا', 'عدس', 'ارز',
    'خبز', 'معكرونة', 'بيتزا', 'برغر', 'ساندويتش', 'سوشي', 'دجاج',
    'سمك', 'روبيان', 'بيض', 'حليب', 'جبن', 'زبدة', 'زبادي',
    'ايس كريم', 'كيك', 'بسكويت', 'فطيرة', 'حلوى', 'شوكولاتة',
    'عسل', 'سكر', 'ملح', 'زيتون', 'زيت', 'خل', 'شوربة',
    'سلطة', 'توست', 'فشار', 'قهوة', 'شاي', 'عصير', 'ماء',
    'لوز', 'جوز', 'فول سوداني', 'كاجو', 'فستق', 'تمر', 'رطب',
    'كبسة', 'مندي', 'فول', 'حمص', 'فلافل', 'شاورما', 'كنافة',
    'بقلاوة', 'مهلبية', 'رز', 'لحم', 'كباب', 'سمبوسة', 'ورق عنب'
  ]
};

function stripArabicDefiniteArticle(word: string): string {
  const trimmed = word.trim();
  if (trimmed.startsWith('ال') && trimmed.length > 2) {
    return trimmed.slice(2);
  }
  return trimmed;
}

// Helper to get the last meaningful Arabic letter (strip final ة before selecting)
function getLastArabicLetter(word: string): string {
  let normalized = stripArabicDefiniteArticle(word.trim());
  while (normalized.endsWith('ة')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized.length > 0 ? normalized.charAt(normalized.length - 1) : '';
}

function getFirstArabicLetter(word: string): string {
  return stripArabicDefiniteArticle(word).charAt(0);
}

function normalizeWord(word: string, isArabic: boolean): string {
  const trimmed = word.trim().toLowerCase();
  if (!isArabic) return trimmed;
  return stripArabicDefiniteArticle(trimmed);
}

export function WordChainGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { isRTL, dir, locale } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-word-chain') ?? (locale === 'ar' ? 'ar' : 'en'));
  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [category, setCategory] = useState<Category | null>(null);
  const [chain, setChain] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [winner, setWinner] = useState<1 | 2 | 'draw' | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [turnsPlayed, setTurnsPlayed] = useState(0);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const savedScore = localStorage.getItem('wordchain-highscore');
    if (savedScore) setHighScore(parseInt(savedScore, 10));

    const savedState = localStorage.getItem('wordchain-game-state');
    if (savedState) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    }
  }, []);

  const saveGameState = () => {
    if (gameState !== 'playing') return;
    const state = {
      category,
      chain,
      currentPlayer,
      scores,
      turnsPlayed,
      timeLeft,
      inputValue,
      timestamp: Date.now()
    };
    localStorage.setItem('wordchain-game-state', JSON.stringify(state));
  };

  const loadGameState = () => {
    const saved = localStorage.getItem('wordchain-game-state');
    if (saved) {
      const state = JSON.parse(saved);
      setCategory(state.category);
      setChain(state.chain || []);
      setCurrentPlayer(state.currentPlayer || 1);
      setScores(state.scores || { 1: 0, 2: 0 });
      setTurnsPlayed(state.turnsPlayed || 0);
      setTimeLeft(state.timeLeft || 10);
      setInputValue(state.inputValue || '');
      setGameState('playing');
      setShowResumeModal(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('wordchain-game-state');
  };

  const handleNewGameFromResume = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    setGameState('menu');
    setCategory(null);
    setChain([]);
    setCurrentPlayer(1);
    setScores({ 1: 0, 2: 0 });
    setTurnsPlayed(0);
    setTimeLeft(10);
    setInputValue('');
    setWinner(null);
    setErrorFeedback(null);
    setLastAction(null);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      saveGameState();
    }
  }, [gameState, category, chain, currentPlayer, timeLeft, scores, turnsPlayed]);

  const isArabic = gameLang === 'ar';
  const DICTIONARIES = isArabic ? DICTIONARIES_AR : DICTIONARIES_EN;

  const startGame = (selectedCategory: Category) => {
    setCategory(selectedCategory);

    // Pick a random starting word from the dictionary
    const dict = DICTIONARIES[selectedCategory];
    const startWord = dict[Math.floor(Math.random() * dict.length)];

    setChain([startWord]);
    setCurrentPlayer(1);
    setScores({ 1: 0, 2: 0 });
    setTurnsPlayed(0);
    setTimeLeft(10);
    setInputValue('');
    setWinner(null);
    setLastAction(null);
    setErrorFeedback(null);
    setGameState('playing');
    clearGameState();
  };

  const finishGame = (finalScores: { 1: number; 2: number }) => {
    if (finalScores[1] > finalScores[2]) setWinner(1);
    else if (finalScores[2] > finalScores[1]) setWinner(2);
    else setWinner('draw');

    setGameState('gameover');
    const totalPoints = finalScores[1] + finalScores[2];
    if (totalPoints > highScore) {
      setHighScore(totalPoints);
      localStorage.setItem('wordchain-highscore', totalPoints.toString());
    }
    clearGameState();
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && !winner) {
      handleTimeout();
    }
  }, [timeLeft, gameState, winner]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !winner) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, currentPlayer, turnsPlayed, winner]);

  const handleTimeout = () => {
    setLastAction(`Player ${currentPlayer} timed out!`);
    nextTurn(false);
  };

  const nextTurn = (success: boolean) => {
    const newTurns = turnsPlayed + 1;
    const newScores = { ...scores };
    if (success) newScores[currentPlayer]++;

    setScores(newScores);
    setTurnsPlayed(newTurns);

    if (newTurns >= 10) {
      finishGame(newScores);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setTimeLeft(10);
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = inputValue.trim().toLowerCase();
    if (!word) return;

    const lastWord = chain[chain.length - 1];
    const lastLetter = isArabic ? getLastArabicLetter(lastWord) : lastWord.charAt(lastWord.length - 1).toLowerCase();
    const firstLetter = isArabic ? getFirstArabicLetter(word) : word.charAt(0).toLowerCase();
    const normalizedWord = normalizeWord(word, isArabic);

    setErrorFeedback(null);
    let error = null;

    if (word.length < 2) {
      error = gt.wordTooShort;
    } else if (isArabic ? !/^[\u0600-\u06FF\s]+$/.test(word) : !/^[a-z\s\-]+$/.test(word)) {
      error = gt.onlyLetters;
    } else if (firstLetter !== lastLetter) {
      error = gt.mustStartWith(isArabic ? lastLetter : lastLetter.toUpperCase());
    } else if (chain.some(c => normalizeWord(c, isArabic) === normalizedWord)) {
      error = gt.alreadyUsed;
    } else {
      const dictionary = category ? DICTIONARIES[category] : [];
      const matchesDictionary = dictionary.some(d => {
        const normalizedDictWord = isArabic ? normalizeWord(d, true) : d.toLowerCase();
        return normalizedDictWord === normalizedWord || d.toLowerCase() === word;
      });
      if (!matchesDictionary) {
        const catLabel = category === 'animals' ? gt.catAnimalsW : category === 'countries' ? gt.catCountries : gt.catFoods;
        error = gt.notInList(catLabel);
      }
    }

    if (error) {
      setErrorFeedback(error);
      setLastAction(`Player ${currentPlayer} missed: ${error}`);
      nextTurn(false);
      return;
    }

    // Success!
    setLastAction(`Player ${currentPlayer} got it!`);
    setChain(prev => [...prev, word]);
    nextTurn(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.background }} dir={dir}>
      <div className="shrink-0 flex items-center justify-between px-8" style={{ height: "88px", backgroundColor: theme.surface, borderBottom: theme.cardBorder, boxShadow: SHADOW.lg }}>
        <div className="flex items-center gap-4">
          <button onClick={onBackToGames} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <ArrowLeft size={24} color={theme.textHeading} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h1 style={{ fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{gt.wordChain}</h1>
        </div>

        <div className="flex items-center gap-4">
          <GameLanguageToggle gameKey="word-chain" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
          <button onClick={onClose} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <div style={{ width: "24px", height: "24px", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "20px", height: "2px", backgroundColor: theme.textHeading, transform: "translate(-50%, -50%) rotate(45deg)", borderRadius: "2px" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: "20px", height: "2px", backgroundColor: theme.textHeading, transform: "translate(-50%, -50%) rotate(-45deg)", borderRadius: "2px" }} />
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-8 relative">
        {gameState === 'menu' && (
          <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl">
            {isArabic ? (
              <div className="space-y-8 text-right">
                <div className="space-y-3">
                  <h2 className="text-5xl font-black" style={{ color: theme.primary }}>{gt.wordChain}</h2>
                  <h3 className="text-2xl font-semibold text-gray-800">{gt.wordChainHowToPlay}</h3>
                </div>

                <div className="space-y-4">
                  <div className="text-lg font-bold text-gray-800">{gt.wordChainInstructionsTitle}</div>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 text-base leading-8">
                    <li>{gt.wordChainRule1}</li>
                    <li>{gt.wordChainRule2}</li>
                    <li>{gt.wordChainRule3}</li>
                    <li>{gt.wordChainRule4}</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div className="text-lg font-bold text-gray-800">{gt.gameOptionsTitle}</div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['animals', 'countries', 'foods'] as Category[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => startGame(cat)}
                        className="py-4 rounded-2xl font-black text-white transition-all shadow-md active:scale-95 text-base"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {cat === 'animals' ? gt.catAnimalsW : cat === 'countries' ? gt.catCountries : gt.catFoods}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 text-left">
                <div className="space-y-3">
                  <h2 className="text-5xl font-black" style={{ color: theme.primary }}>{gt.wordChain}</h2>
                  <h3 className="text-2xl font-semibold text-gray-800">{gt.wordChainDesc}</h3>
                </div>

                <div className="space-y-4">
                  <div className="text-lg font-bold text-gray-800">{gt.wordChainInstructionsTitle}</div>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 text-base leading-8">
                    <li>{gt.wordChainRule1}</li>
                    <li>{gt.wordChainRule2}</li>
                    <li>{gt.wordChainRule3}</li>
                  </ol>
                </div>

                <div className="flex flex-col items-center gap-1 px-8 py-3 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/50">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{gt.bestChain}</span>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Trophy size={18} />
                    <span className="text-xl font-black">{gt.wordsCount(highScore)}</span>
                  </div>
                </div>

                <div className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider" style={{ backgroundColor: theme.primarySubtle, color: theme.primary }}>{gt.twoPlayersLocal}</div>

                <div className="w-full animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">{gt.selectCategory}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['animals', 'countries', 'foods'] as Category[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => startGame(cat)}
                        className="p-4 rounded-xl font-bold capitalize text-white active:scale-95 transition-all shadow-md"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {cat === 'animals' ? gt.catAnimalsW : cat === 'countries' ? gt.catCountries : gt.catFoods}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-4xl flex flex-col h-full gap-8 py-4 relative">
            {/* Top Section: Player Info */}
            <div className="shrink-0 flex justify-between items-center bg-white p-6 rounded-3xl shadow-md border border-gray-100">
              <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${currentPlayer === 1 ? 'scale-110' : 'opacity-40 grayscale'}`} style={{ color: currentPlayer === 1 ? theme.primary : undefined }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-50 border-2 border-blue-100">
                  <User size={32} color={theme.primary} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black uppercase tracking-wider">{gt.player1}</span>
                  <span className="text-2xl font-black">{scores[1]}</span>
                </div>
                {currentPlayer === 1 && (
                  <div className="px-4 py-1 rounded-full text-xs font-black uppercase animate-pulse" style={{ backgroundColor: theme.primary, color: theme.textInverse }}>
                    {gt.player1Turn}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-300" 
                  style={{ 
                    borderColor: timeLeft <= 3 ? '#EF4444' : theme.primarySubtle,
                    backgroundColor: 'white',
                    boxShadow: SHADOW.md
                  }}>
                  <div className={`text-4xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : ''}`} style={{ color: timeLeft > 3 ? theme.primary : undefined }}>
                    {timeLeft}s
                  </div>
                </div>
                <div className="mt-4 px-4 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest">
                  {gt.turnOf(turnsPlayed + 1)}
                </div>
              </div>

              <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${currentPlayer === 2 ? 'scale-110' : 'opacity-40 grayscale'}`} style={{ color: currentPlayer === 2 ? theme.primary : undefined }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-50 border-2 border-blue-100">
                  <User size={32} color={theme.primary} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black uppercase tracking-wider">{gt.player2}</span>
                  <span className="text-2xl font-black">{scores[2]}</span>
                </div>
                {currentPlayer === 2 && (
                  <div className="px-4 py-1 rounded-full text-xs font-black uppercase animate-pulse" style={{ backgroundColor: theme.primary, color: theme.textInverse }}>
                    {gt.player2Turn}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section: Vertical Word Chain */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center gap-2 scroll-smooth bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
              ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
            >
              {chain.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-300 italic font-medium">
                  Waiting for first word...
                </div>
              )}
              {chain.map((word, i) => (
                <div key={i} className="flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div 
                    className={`px-12 py-6 font-bold rounded-2xl text-2xl capitalize shadow-sm transition-all duration-300 border-2 ${i === chain.length - 1 ? 'scale-105 shadow-xl' : 'opacity-70'}`} 
                    style={{ 
                      backgroundColor: i === chain.length - 1 ? theme.primary : 'white', 
                      color: i === chain.length - 1 ? theme.textInverse : theme.textHeading, 
                      borderColor: i === chain.length - 1 ? theme.primary : theme.primarySubtle,
                      minWidth: '320px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      direction: 'ltr'
                    }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full text-lg border-2" 
                      style={{ 
                        backgroundColor: i === chain.length - 1 ? 'rgba(255,255,255,0.2)' : theme.primarySubtle,
                        color: i === chain.length - 1 ? 'white' : theme.primary,
                        borderColor: i === chain.length - 1 ? 'rgba(255,255,255,0.4)' : theme.primary
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 text-center">
                      {word.slice(0, -1)}
                      <span 
                        className={`underline underline-offset-8 decoration-4`} 
                        style={{ color: i === chain.length - 1 ? 'white' : theme.primary }}
                      >
                        {word.slice(-1)}
                      </span>
                    </div>
                  </div>
                  {i < chain.length - 1 && (
                    <div className="my-2 text-gray-300 font-black text-2xl">↓</div>
                  )}
                </div>
              ))}
            </div>

            {/* Feedback Message (Floating above input) */}
            {lastAction && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-32 z-10 animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-2 rounded-full shadow-lg border-2 text-sm font-black uppercase tracking-widest whitespace-nowrap"
                  style={{
                    backgroundColor: lastAction.includes('got it') ? '#F0FDF4' : '#FEF2F2',
                    borderColor: lastAction.includes('got it') ? '#22C55E' : '#EF4444',
                    color: lastAction.includes('got it') ? '#166534' : '#991B1B'
                  }}>
                  {lastAction}
                </div>
              </div>
            )}

            {/* Bottom Section: Input Area */}
            <div className="shrink-0 flex flex-col gap-4 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-4 relative overflow-visible">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                    <span className="text-xl font-black">?</span>
                  </div>
                  {errorFeedback ? (
                    <span className="text-sm font-bold text-red-500 animate-bounce">
                      {errorFeedback}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      {gt.roundInProgress}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{gt.startWith}:</span>
                  <span className="text-2xl font-black text-blue-600 underline underline-offset-4">
                    {isArabic ? getLastArabicLetter(chain[chain.length - 1]) : chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black pointer-events-none select-none opacity-10 group-focus-within:opacity-20 transition-opacity" style={{ color: theme.primary }}>
                    {isArabic ? getLastArabicLetter(chain[chain.length - 1]) : chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={gt.typeWordIn(category === 'animals' ? gt.catAnimalsW : category === 'countries' ? gt.catCountries : gt.catFoods)}
                    className="w-full h-20 pl-16 pr-6 text-3xl font-black bg-gray-50 border-4 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all shadow-inner uppercase placeholder:text-gray-300"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-10 h-20 text-white font-black text-xl rounded-2xl active:scale-95 transition-all shadow-lg hover:brightness-110 flex items-center justify-center" 
                  style={{ backgroundColor: theme.primary }}
                >
                  {gt.submit}
                </button>
              </form>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 bg-white p-10 rounded-3xl shadow-xl animate-in zoom-in-95">
            <Trophy size={80} className="text-yellow-400" />

            <div className="text-center">
              <h2 className="text-5xl font-black mb-2 text-gray-800">
                {winner === 'draw' ? gt.itsADrawW : winner === 1 ? gt.player1Wins : gt.player2Wins}
              </h2>
              <div className="flex justify-center gap-8 mt-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase">{gt.player1}</p>
                  <p className="text-3xl font-black" style={{ color: theme.primary }}>{scores[1]}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase">{gt.player2}</p>
                  <p className="text-3xl font-black" style={{ color: theme.primary }}>{scores[2]}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-4 mt-4">
              <button onClick={() => setGameState('menu')} className="w-full py-5 text-white font-bold text-xl rounded-2xl shadow-lg active:scale-95 transition-all hover:brightness-110" style={{ backgroundColor: theme.primary }}>
                {gt.playAgain}
              </button>
              <button onClick={onBackToGames} className="w-full py-5 bg-gray-100 text-gray-700 font-bold text-xl rounded-2xl active:scale-95 transition-all hover:bg-gray-200">
                {gt.backToGames}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 150,
          }}
        >
          <div
            className="flex flex-col items-center gap-8 px-16 py-12"
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radiusCard,
              boxShadow: SHADOW["2xl"],
              border: theme.cardBorder,
              maxWidth: "500px",
              width: "90%"
            }}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primarySubtle }}>
              <RotateCcw size={48} style={{ color: theme.primary }} />
            </div>

            <div className="text-center gap-2 flex flex-col">
              <h2 style={{ fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                {gt.resumeGame}
              </h2>
              <p style={{ fontSize: TYPE_SCALE.md, color: theme.textMuted }}>
                {gt.resumeDesc}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={loadGameState}
                className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95 text-white shadow-md"
                style={{ fontSize: TYPE_SCALE.md, backgroundColor: theme.primary }}
              >
                {gt.continuePlaying}
              </button>
              <button
                onClick={handleNewGameFromResume}
                className="w-full py-5 rounded-2xl font-bold transition-all hover:bg-gray-100 active:scale-95 border-2 border-gray-200"
                style={{ backgroundColor: theme.surfaceElevated, color: theme.textHeading, fontSize: TYPE_SCALE.md }}
              >
                {gt.startNewGame}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
