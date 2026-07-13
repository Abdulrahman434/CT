import { useState, useCallback, useMemo, useEffect } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import GameLanguageToggle from "./GameLanguageToggle";
import { Trophy, ArrowLeft, CheckCircle2, XCircle, ChevronRight, HelpCircle, RotateCcw } from "lucide-react";
import { GAME_TRANSLATIONS } from "./gameTranslations";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Category = 'General' | 'Science' | 'Geography' | 'Islamic' | 'Saudi' | 'Health';

const TRIVIA_DATA: Record<Category, Question[]> = {
  General: [
    { id: 1, question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1, explanation: "Mars has an iron oxide-rich surface which gives it a reddish appearance." },
    { id: 2, question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: 3, explanation: "The Pacific Ocean covers about one-third of the Earth's surface." },
    { id: 3, question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correctAnswer: 2, explanation: "Leonardo da Vinci painted it in the early 16th century." },
    { id: 4, question: "Which country is famous for the Eiffel Tower?", options: ["Italy", "Germany", "France", "Spain"], correctAnswer: 2, explanation: "The Eiffel Tower is located in Paris, France." },
    { id: 5, question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correctAnswer: 2, explanation: "Diamond is the hardest natural material due to its strong carbon bonds." },
    { id: 6, question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America." },
    { id: 7, question: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Elephant", "Lion", "Giraffe"], correctAnswer: 2, explanation: "The Lion is famously called the king of the jungle, although they mostly live in savannas." },
    { id: 8, question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], correctAnswer: 1, explanation: "The Blue Whale can reach lengths of 30 meters and weigh up to 180 tonnes." },
    { id: 9, question: "Which language has the most native speakers in the world?", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correctAnswer: 2, explanation: "Mandarin Chinese has over 900 million native speakers." },
    { id: 10, question: "What is the name of the long-standing wall in China?", options: ["The Great Wall", "The Stone Wall", "The Dragon Wall", "The Silk Wall"], correctAnswer: 0, explanation: "The Great Wall of China was built to protect against invasions." },
    { id: 11, question: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], correctAnswer: 1, explanation: "Neil Armstrong famously walked on the moon in 1969." },
    { id: 12, question: "What is the capital of Italy?", options: ["Venice", "Milan", "Rome", "Florence"], correctAnswer: 2, explanation: "Rome is known as the Eternal City." },
    { id: 13, question: "Which gas do humans need to breathe to stay alive?", options: ["Nitrogen", "Hydrogen", "Oxygen", "Carbon Dioxide"], correctAnswer: 2, explanation: "Humans require oxygen for cellular respiration." },
    { id: 14, question: "What is the largest country in South America?", options: ["Argentina", "Chile", "Brazil", "Peru"], correctAnswer: 2, explanation: "Brazil is the largest country by both land area and population in South America." },
    { id: 15, question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correctAnswer: 1, explanation: "Spiders are arachnids and typically have 8 legs." },
    { id: 16, question: "Which fruit is known as the 'King of Fruits' in Southeast Asia?", options: ["Mango", "Durian", "Pineapple", "Papaya"], correctAnswer: 1, explanation: "Durian is famous for its large size, strong odor, and thorn-covered husk." },
    { id: 17, question: "What is the smallest unit of matter?", options: ["Molecule", "Cell", "Atom", "Electron"], correctAnswer: 2, explanation: "An atom is the basic unit of a chemical element." },
    { id: 18, question: "Who is the author of 'Romeo and Juliet'?", options: ["Charles Dickens", "Mark Twain", "William Shakespeare", "Jane Austen"], correctAnswer: 2, explanation: "Shakespeare wrote this famous tragedy in the late 16th century." },
    { id: 19, question: "Which ocean is the second largest in the world?", options: ["Indian", "Atlantic", "Arctic", "Pacific"], correctAnswer: 1, explanation: "The Atlantic Ocean is the second largest, after the Pacific." },
    { id: 20, question: "What is the currency of the United Kingdom?", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], correctAnswer: 2, explanation: "The British Pound (GBP) is the official currency." },
  ],
  Science: [
    { id: 1, question: "What is the chemical symbol for Gold?", options: ["Gd", "Go", "Ag", "Au"], correctAnswer: 3, explanation: "Au comes from the Latin word 'Aurum'." },
    { id: 2, question: "Which organ in the human body pumps blood?", options: ["Brain", "Lungs", "Heart", "Liver"], correctAnswer: 2, explanation: "The heart is a muscular organ that pumps blood through the circulatory system." },
    { id: 3, question: "What is the nearest star to Earth?", options: ["Alpha Centauri", "Sirius", "The Sun", "Betelgeuse"], correctAnswer: 2, explanation: "The Sun is the center of our solar system and the closest star to us." },
    { id: 4, question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, explanation: "Plants take in Carbon Dioxide (CO2) for photosynthesis." },
    { id: 5, question: "What is the boiling point of water in Celsius?", options: ["90°C", "100°C", "110°C", "120°C"], correctAnswer: 1, explanation: "Water boils at 100 degrees Celsius at sea level." },
    { id: 6, question: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Earth"], correctAnswer: 2, explanation: "Mercury is the smallest and closest planet to the Sun." },
    { id: 7, question: "What part of the cell contains genetic material?", options: ["Cytoplasm", "Nucleus", "Membrane", "Ribosome"], correctAnswer: 1, explanation: "The nucleus acts as the 'brain' of the cell and contains DNA." },
    { id: 8, question: "What is the most common gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correctAnswer: 2, explanation: "Nitrogen makes up about 78% of the Earth's atmosphere." },
    { id: 9, question: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], correctAnswer: 2, explanation: "Gravity is the force that pulls objects toward the center of the Earth." },
    { id: 10, question: "How many planets are in our Solar System?", options: ["7", "8", "9", "10"], correctAnswer: 1, explanation: "The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune." },
    { id: 11, question: "What is the chemical symbol for Silver?", options: ["Si", "Sl", "Ag", "Sr"], correctAnswer: 2, explanation: "Ag comes from the Latin word 'Argentum'." },
    { id: 12, question: "What is the center of an atom called?", options: ["Electron", "Proton", "Nucleus", "Neutron"], correctAnswer: 2, explanation: "The nucleus contains the protons and neutrons of an atom." },
    { id: 13, question: "Which planet is known for its prominent rings?", options: ["Jupiter", "Uranus", "Neptune", "Saturn"], correctAnswer: 3, explanation: "Saturn's rings are the most extensive and visible ring system." },
    { id: 14, question: "What is the study of living organisms called?", options: ["Geology", "Biology", "Physics", "Chemistry"], correctAnswer: 1, explanation: "Biology covers everything from cells to entire ecosystems." },
    { id: 15, question: "Which metal is liquid at room temperature?", options: ["Iron", "Mercury", "Copper", "Aluminum"], correctAnswer: 1, explanation: "Mercury is the only metal that is liquid at standard temperature and pressure." },
    { id: 16, question: "What is the speed of light approximately?", options: ["100,000 km/s", "300,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctAnswer: 1, explanation: "Light travels at about 299,792 kilometers per second in a vacuum." },
    { id: 17, question: "Which part of the plant is responsible for photosynthesis?", options: ["Roots", "Stem", "Leaves", "Flowers"], correctAnswer: 2, explanation: "Leaves contain chlorophyll which captures sunlight for energy." },
    { id: 18, question: "What is the main gas found on the Sun?", options: ["Oxygen", "Hydrogen", "Helium", "Carbon"], correctAnswer: 1, explanation: "The Sun is about 73% hydrogen and 25% helium." },
    { id: 19, question: "Which layer of the Earth is the hottest?", options: ["Crust", "Mantle", "Outer Core", "Inner Core"], correctAnswer: 3, explanation: "The inner core is a solid ball of iron and nickel with temperatures up to 5,200°C." },
    { id: 20, question: "What is the process of a liquid turning into a gas?", options: ["Freezing", "Condensation", "Evaporation", "Melting"], correctAnswer: 2, explanation: "Evaporation occurs when molecules at the surface of a liquid gain enough energy to become gas." },
  ],
  Geography: [
    { id: 1, question: "What is the capital of France?", options: ["London", "Berlin", "Madrid", "Paris"], correctAnswer: 3, explanation: "Paris is known as the 'City of Light'." },
    { id: 2, question: "Which is the smallest continent by land area?", options: ["Europe", "Australia", "Antarctica", "South America"], correctAnswer: 1, explanation: "Australia is both a country and the smallest continent." },
    { id: 3, question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Mississippi", "Yangtze"], correctAnswer: 1, explanation: "The Nile is traditionally considered the longest river, flowing through northeastern Africa." },
    { id: 4, question: "Which country has the largest population in the world?", options: ["India", "USA", "China", "Russia"], correctAnswer: 2, explanation: "China currently has the largest population, followed closely by India." },
    { id: 5, question: "In which country is the Taj Mahal located?", options: ["Pakistan", "India", "Bangladesh", "Nepal"], correctAnswer: 1, explanation: "The Taj Mahal is an ivory-white marble mausoleum in Agra, India." },
    { id: 6, question: "What is the largest country in the world by land area?", options: ["Canada", "USA", "China", "Russia"], correctAnswer: 3, explanation: "Russia is the largest country, spanning Eastern Europe and Northern Asia." },
    { id: 7, question: "Which desert is the largest hot desert in the world?", options: ["Gobi", "Kalahari", "Sahara", "Arabian"], correctAnswer: 2, explanation: "The Sahara Desert covers much of North Africa." },
    { id: 8, question: "Mount Everest is located in which mountain range?", options: ["Andes", "Rockies", "Alps", "Himalayas"], correctAnswer: 3, explanation: "The Himalayas contain many of the world's highest peaks, including Everest." },
    { id: 9, question: "Which island country is also a continent?", options: ["Greenland", "Australia", "Iceland", "Madagascar"], correctAnswer: 1, explanation: "Australia is unique as it is both an island nation and a continent." },
    { id: 10, question: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"], correctAnswer: 2, explanation: "Tokyo is the bustling capital of Japan and the world's most populous metropolitan area." },
    { id: 11, question: "Which ocean is located between the Americas and Europe/Africa?", options: ["Pacific", "Atlantic", "Indian", "Southern"], correctAnswer: 1, explanation: "The Atlantic Ocean separates the Old World from the New World." },
    { id: 12, question: "What is the capital of Egypt?", options: ["Alexandria", "Luxor", "Cairo", "Giza"], correctAnswer: 2, explanation: "Cairo is the largest city in the Arab world." },
    { id: 13, question: "Which country is both in Europe and Asia?", options: ["Greece", "Turkey", "Egypt", "Italy"], correctAnswer: 1, explanation: "Turkey spans across the Anatolian peninsula in Asia and the Balkan region in Europe." },
    { id: 14, question: "What is the largest island in the world?", options: ["Australia", "Greenland", "New Guinea", "Borneo"], correctAnswer: 1, explanation: "Greenland is the largest island; Australia is considered a continent." },
    { id: 15, question: "Which mountain is the highest in Africa?", options: ["Mount Kenya", "Mount Stanley", "Mount Kilimanjaro", "Mount Meru"], correctAnswer: 2, explanation: "Kilimanjaro is a dormant volcano in Tanzania." },
    { id: 16, question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correctAnswer: 3, explanation: "Ottawa is the political center of Canada." },
    { id: 17, question: "Which sea is located between Europe and Africa?", options: ["Red Sea", "Black Sea", "Mediterranean Sea", "Caspian Sea"], correctAnswer: 2, explanation: "The Mediterranean Sea connects to the Atlantic through the Strait of Gibraltar." },
    { id: 18, question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctAnswer: 2, explanation: "Canberra was chosen as a compromise between Sydney and Melbourne." },
    { id: 19, question: "Which country has the most volcanoes?", options: ["Japan", "USA", "Indonesia", "Iceland"], correctAnswer: 2, explanation: "Indonesia has over 130 active volcanoes." },
    { id: 20, question: "What is the official language of Brazil?", options: ["Spanish", "English", "Portuguese", "French"], correctAnswer: 2, explanation: "Brazil was colonized by Portugal, unlike most of South America." },
  ],
  Islamic: [
    { id: 1, question: "In which month do Muslims fast?", options: ["Shawwal", "Ramadan", "Rajab", "Dhul Hijjah"], correctAnswer: 1, explanation: "Ramadan is the ninth month of the Islamic calendar." },
    { id: 2, question: "What is the holy book of Islam?", options: ["Torah", "Bible", "Quran", "Psalms"], correctAnswer: 2, explanation: "The Quran is believed by Muslims to be the word of God revealed to Prophet Muhammad (PBUH)." },
    { id: 3, question: "How many times a day do Muslims pray?", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "The five daily prayers (Salah) are one of the pillars of Islam." },
    { id: 4, question: "What is the direction of prayer for Muslims?", options: ["East", "West", "The Kaaba", "Jerusalem"], correctAnswer: 2, explanation: "Muslims face the Kaaba in Mecca, known as the Qibla, during prayer." },
    { id: 5, question: "Who was the first Prophet in Islam?", options: ["Noah", "Abraham", "Moses", "Adam"], correctAnswer: 3, explanation: "Prophet Adam (AS) is recognized as the first human and the first Prophet." },
    { id: 6, question: "What are the five pillars of Islam?", options: ["Faith, Prayer, Charity, Fasting, Hajj", "Faith, Prayer, Kindness, Honesty, Hajj", "Prayer, Charity, Fasting, Respect, Hajj", "Faith, Peace, Charity, Fasting, Hajj"], correctAnswer: 0, explanation: "These five acts of worship are the foundation of Muslim life." },
    { id: 7, question: "Which city is the birthplace of Prophet Muhammad (PBUH)?", options: ["Medina", "Jerusalem", "Mecca", "Taif"], correctAnswer: 2, explanation: "Prophet Muhammad (PBUH) was born in Mecca around 570 CE." },
    { id: 8, question: "What is the name of the Islamic calendar?", options: ["Solar Calendar", "Hijri Calendar", "Lunar Calendar", "Gregorian Calendar"], correctAnswer: 1, explanation: "The Hijri calendar is based on the lunar cycle and starts from the Hijrah (migration)." },
    { id: 9, question: "How many chapters (Surahs) are in the Quran?", options: ["100", "114", "120", "132"], correctAnswer: 1, explanation: "The Quran consists of 114 Surahs of varying lengths." },
    { id: 10, question: "What is the name of the pilgrimage to Mecca?", options: ["Umrah", "Zakat", "Hajj", "Sadaqah"], correctAnswer: 2, explanation: "Hajj is the annual pilgrimage that every able Muslim should perform once in their lifetime." },
    { id: 11, question: "What is the first month of the Hijri calendar?", options: ["Ramadan", "Muharram", "Safar", "Rajab"], correctAnswer: 1, explanation: "Muharram marks the beginning of the Islamic New Year." },
    { id: 12, question: "Who was the first woman to embrace Islam?", options: ["Aisha", "Fatima", "Khadija", "Hafsa"], correctAnswer: 2, explanation: "Khadija (RA), the wife of Prophet Muhammad (PBUH), was the first to believe in his message." },
    { id: 13, question: "What is the name of the Prophet's migration from Mecca to Medina?", options: ["Isra", "Mi'raj", "Hijrah", "Hajj"], correctAnswer: 2, explanation: "The Hijrah took place in 622 CE and marks the start of the Hijri era." },
    { id: 14, question: "Which companion was the first Caliph of Islam?", options: ["Umar ibn al-Khattab", "Abu Bakr al-Siddiq", "Uthman ibn Affan", "Ali ibn Abi Talib"], correctAnswer: 1, explanation: "Abu Bakr (RA) led the Muslim community after the Prophet (PBUH)." },
    { id: 15, question: "What is the Arabic word for the oneness of God?", options: ["Ihsan", "Tawheed", "Shirk", "Fiqh"], correctAnswer: 1, explanation: "Tawheed is the most fundamental concept in Islam." },
    { id: 16, question: "In which city is the Al-Aqsa Mosque located?", options: ["Mecca", "Medina", "Jerusalem", "Damascus"], correctAnswer: 2, explanation: "Al-Aqsa is the third holiest site in Islam." },
    { id: 17, question: "What is the name of the Prophet's night journey to heaven?", options: ["Hijrah", "Isra and Mi'raj", "Fath", "Badr"], correctAnswer: 1, explanation: "This miraculous journey took the Prophet from Mecca to Jerusalem and then to the heavens." },
    { id: 18, question: "What is the tax given to the poor as a pillar of Islam?", options: ["Sadaqah", "Jizya", "Zakat", "Kharaj"], correctAnswer: 2, explanation: "Zakat is a mandatory charitable contribution (2.5% of wealth)." },
    { id: 19, question: "What is the name of the cave where the first revelation occurred?", options: ["Cave of Hira", "Cave of Thawr", "Cave of Seven Sleepers", "Cave of Kahf"], correctAnswer: 0, explanation: "The first verses of the Quran were revealed in the Cave of Hira." },
    { id: 20, question: "Which Prophet is known as 'Khalilullah' (Friend of Allah)?", options: ["Moses", "Jesus", "Abraham", "Noah"], correctAnswer: 2, explanation: "Prophet Ibrahim (AS) is honored with this title in Islamic tradition." },
  ],
  Saudi: [
    { id: 1, question: "What is the capital of Saudi Arabia?", options: ["Jeddah", "Riyadh", "Dammam", "Mecca"], correctAnswer: 1, explanation: "Riyadh is the largest city and political capital of the Kingdom." },
    { id: 2, question: "In which year was the modern Kingdom of Saudi Arabia founded?", options: ["1920", "1932", "1945", "1953"], correctAnswer: 1, explanation: "King Abdulaziz Al Saud founded the Kingdom on September 23, 1932." },
    { id: 3, question: "What is the official currency of Saudi Arabia?", options: ["Dinar", "Dirham", "Riyal", "Pound"], correctAnswer: 2, explanation: "The Saudi Riyal (SAR) is the official currency." },
    { id: 4, question: "What is the official language of Saudi Arabia?", options: ["English", "French", "Arabic", "Urdu"], correctAnswer: 2, explanation: "Arabic is the official language of the Kingdom." },
    { id: 5, question: "Which city is known as the 'Bride of the Red Sea'?", options: ["Jeddah", "Yanbu", "Dammam", "Abha"], correctAnswer: 0, explanation: "Jeddah is a major port city and is often called the Bride of the Red Sea." },
    { id: 6, question: "What is the national emblem of Saudi Arabia?", options: ["A Camel", "An Eagle", "Two Swords and a Palm Tree", "A Falcon"], correctAnswer: 2, explanation: "The two swords represent strength and the palm tree represents prosperity." },
    { id: 7, question: "Where is the Prophet's Mosque (Al-Masjid an-Nabawi) located?", options: ["Mecca", "Medina", "Riyadh", "Tabuk"], correctAnswer: 1, explanation: "The mosque is located in Medina and was established by the Prophet (PBUH)." },
    { id: 8, question: "Saudi Arabia contains which of these holy sites?", options: ["Petra", "The Pyramids", "The Kaaba", "Colosseum"], correctAnswer: 2, explanation: "The Kaaba, located in Mecca, is the holiest site in Islam." },
    { id: 9, question: "What is the traditional Saudi dress for men?", options: ["Sari", "Thobe", "Kimono", "Kilt"], correctAnswer: 1, explanation: "The Thobe is a long, ankle-length garment traditionally worn by Saudi men." },
    { id: 10, question: "Which sea borders Saudi Arabia to the west?", options: ["Arabian Sea", "Red Sea", "Mediterranean Sea", "Dead Sea"], correctAnswer: 1, explanation: "The Red Sea borders the western coast of Saudi Arabia." },
    { id: 11, question: "What is the name of the traditional Saudi dance?", options: ["Dabke", "Ardha", "Salsa", "Tango"], correctAnswer: 1, explanation: "The Ardha is a traditional sword dance performed at celebrations." },
    { id: 12, question: "Which city is the destination for the Hajj pilgrimage?", options: ["Riyadh", "Jeddah", "Mecca", "Medina"], correctAnswer: 2, explanation: "Mecca is the holiest city where the Kaaba is located." },
    { id: 13, question: "What is the name of the vast desert in southern Saudi Arabia?", options: ["Sahara", "Gobi", "Rub' al Khali", "Mojave"], correctAnswer: 2, explanation: "The Rub' al Khali (Empty Quarter) is the largest contiguous sand desert in the world." },
    { id: 14, question: "Which mountain range runs along the western coast of Saudi Arabia?", options: ["Atlas Mountains", "Sarawat Mountains", "Himalayas", "Alps"], correctAnswer: 1, explanation: "The Sarawat Mountains extend from the border of Jordan down to Yemen." },
    { id: 15, question: "What is the official name of the Saudi National Day?", options: ["Independence Day", "Founding Day", "National Day", "Unity Day"], correctAnswer: 2, explanation: "National Day is celebrated on September 23rd each year." },
    { id: 16, question: "Which international organization is headquartered in Jeddah?", options: ["OPEC", "OIC", "UN", "FIFA"], correctAnswer: 1, explanation: "The Organization of Islamic Cooperation (OIC) is based in Jeddah." },
    { id: 17, question: "What is the main ingredient of Kabsa?", options: ["Pasta", "Rice", "Bread", "Potatoes"], correctAnswer: 1, explanation: "Kabsa is a popular mixed rice dish with meat, vegetables, and spices." },
    { id: 18, question: "Which King of Saudi Arabia was the first to be called 'Custodian of the Two Holy Mosques'?", options: ["King Abdulaziz", "King Faisal", "King Fahd", "King Salman"], correctAnswer: 2, explanation: "King Fahd officially adopted the title in 1986." },
    { id: 19, question: "What is the name of the mega-city project in Northwest Saudi Arabia?", options: ["Neom", "Qiddiya", "Red Sea Project", "The Line"], correctAnswer: 0, explanation: "Neom is a visionary project being built as a sustainable smart city." },
    { id: 20, question: "What is the name of the historical area in Riyadh?", options: ["Al-Balad", "Diriyah", "Souq Waqif", "Corniche"], correctAnswer: 1, explanation: "Diriyah was the ancestral home of the Saudi Royal family and the first Saudi capital." },
  ],
  Health: [
    { id: 1, question: "How many bones are in an adult human body?", options: ["156", "206", "256", "306"], correctAnswer: 1, explanation: "Adults have 206 bones; infants are born with about 270." },
    { id: 2, question: "Which vitamin is known as the 'Sunshine Vitamin'?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctAnswer: 3, explanation: "The body produces Vitamin D when skin is exposed to sunlight." },
    { id: 3, question: "What is the normal body temperature in Celsius?", options: ["35°C", "37°C", "39°C", "41°C"], correctAnswer: 1, explanation: "37°C (98.6°F) is considered the average normal body temperature." },
    { id: 4, question: "Which organ is responsible for breathing?", options: ["Heart", "Lungs", "Stomach", "Kidneys"], correctAnswer: 1, explanation: "The lungs exchange oxygen and carbon dioxide from the blood." },
    { id: 5, question: "What is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Heart"], correctAnswer: 2, explanation: "Skin is the largest organ, covering and protecting the entire body." },
    { id: 6, question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "The human heart has four chambers: two atria and two ventricles." },
    { id: 7, question: "Which type of blood cells fight infections?", options: ["Red Blood Cells", "White Blood Cells", "Platelets", "Plasma"], correctAnswer: 1, explanation: "White blood cells are part of the body's immune system." },
    { id: 8, question: "What is the main source of energy for the body?", options: ["Protein", "Fats", "Carbohydrates", "Vitamins"], correctAnswer: 2, explanation: "Carbohydrates are broken down into glucose, the body's primary energy source." },
    { id: 9, question: "What mineral is important for strong bones and teeth?", options: ["Iron", "Calcium", "Zinc", "Magnesium"], correctAnswer: 1, explanation: "Calcium is essential for maintaining bone density and dental health." },
    { id: 10, question: "Which vitamin is found in high amounts in citrus fruits?", options: ["Vitamin A", "Vitamin K", "Vitamin C", "Vitamin E"], correctAnswer: 2, explanation: "Citrus fruits like oranges and lemons are rich in Vitamin C." },
    { id: 11, question: "What is the main function of the kidneys?", options: ["Pump blood", "Digest food", "Filter waste from blood", "Store bile"], correctAnswer: 2, explanation: "Kidneys filter waste products and excess water to form urine." },
    { id: 12, question: "What is the strongest muscle in the human body relative to its size?", options: ["Heart", "Biceps", "Tongue", "Masseter"], correctAnswer: 3, explanation: "The masseter (jaw muscle) can close the teeth with a force as great as 200 pounds." },
    { id: 13, question: "Which organ stores bile produced by the liver?", options: ["Spleen", "Pancreas", "Gallbladder", "Bladder"], correctAnswer: 2, explanation: "The gallbladder releases bile into the small intestine to help digest fats." },
    { id: 14, question: "What is the common name for the larynx?", options: ["Windpipe", "Voice box", "Throat", "Eardrum"], correctAnswer: 1, explanation: "The larynx contains the vocal cords." },
    { id: 15, question: "Which blood type is known as the 'universal donor'?", options: ["A+", "B-", "AB+", "O-"], correctAnswer: 3, explanation: "O-negative blood can be given to patients of any blood type." },
    { id: 16, question: "How many teeth does a normal adult human have?", options: ["28", "30", "32", "34"], correctAnswer: 2, explanation: "Adults typically have 32 teeth, including wisdom teeth." },
    { id: 17, question: "Which nutrient is essential for muscle repair?", options: ["Sugar", "Protein", "Fiber", "Salt"], correctAnswer: 1, explanation: "Proteins are the building blocks of body tissues." },
    { id: 18, question: "What is the name of the pigment that gives skin its color?", options: ["Hemoglobin", "Melanin", "Chlorophyll", "Keratin"], correctAnswer: 1, explanation: "Melanin protects the skin from UV radiation." },
    { id: 19, question: "Which part of the ear is responsible for balance?", options: ["Eardrum", "Cochlea", "Inner ear", "Outer ear"], correctAnswer: 2, explanation: "The vestibular system in the inner ear helps maintain equilibrium." },
    { id: 20, question: "What is the medical term for the kneecap?", options: ["Femur", "Tibia", "Patella", "Fibula"], correctAnswer: 2, explanation: "The patella is a thick, circular-triangular bone which articulates with the femur." },
  ]
};

const TRIVIA_DATA_AR: Record<Category, Question[]> = {
  General: [
    { id: 1, question: "أي كوكب يُعرف بالكوكب الأحمر؟", options: ["الزهرة", "المريخ", "المشتري", "زحل"], correctAnswer: 1, explanation: "سطح المريخ غني بأكسيد الحديد مما يعطيه مظهرًا أحمر." },
    { id: 2, question: "ما هو أكبر محيط على وجه الأرض؟", options: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"], correctAnswer: 3, explanation: "يغطي المحيط الهادئ حوالي ثلث مساحة سطح الأرض." },
    { id: 3, question: "من رسم لوحة الموناليزا؟", options: ["فان جوخ", "بيكاسو", "دافنشي", "مايكل أنجلو"], correctAnswer: 2, explanation: "رسمها ليوناردو دافنشي في أوائل القرن السادس عشر." },
    { id: 4, question: "أي دولة تشتهر ببرج إيفل؟", options: ["إيطاليا", "ألمانيا", "فرنسا", "إسبانيا"], correctAnswer: 2, explanation: "يقع برج إيفل في باريس، فرنسا." },
    { id: 5, question: "ما هي أصلب مادة طبيعية على وجه الأرض؟", options: ["الذهب", "الحديد", "الماس", "البلاتين"], correctAnswer: 2, explanation: "الماس هو أصلب مادة طبيعية بسبب روابط الكربون القوية." },
    { id: 6, question: "كم عدد القارات على الأرض؟", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "القارات السبع هي أفريقيا، القارة القطبية الجنوبية، آسيا، أستراليا، أوروبا، أمريكا الشمالية، وأمريكا الجنوبية." },
    { id: 7, question: "أي حيوان يُعرف بملك الغابة؟", options: ["النمر", "الفيل", "الأسد", "الزرافة"], correctAnswer: 2, explanation: "الأسد يُسمى ملك الغابة رغم أنه يعيش غالباً في السافانا." },
    { id: 8, question: "ما هو أكبر حيوان ثديي في العالم؟", options: ["الفيل", "الحوت الأزرق", "الزرافة", "فرس النهر"], correctAnswer: 1, explanation: "يمكن أن يصل طول الحوت الأزرق إلى 30 متراً ووزنه إلى 180 طناً." },
    { id: 9, question: "ما هي اللغة التي تمتلك أكبر عدد من المتحدثين الأصليين في العالم؟", options: ["الإنجليزية", "الإسبانية", "الصينية (الماندرين)", "الهندية"], correctAnswer: 2, explanation: "الصينية الماندرين يتحدث بها أكثر من 900 مليون شخص أصلي." },
    { id: 10, question: "ما هو اسم السور الشهير في الصين؟", options: ["سور الصين العظيم", "السور الحجري", "سور التنين", "سور الحرير"], correctAnswer: 0, explanation: "بُني سور الصين العظيم للحماية من الغزوات." },
    { id: 11, question: "من هو أول شخص مشى على سطح القمر؟", options: ["بز ألدرين", "نيل أرمسترونج", "يوري جاجارين", "جون غلين"], correctAnswer: 1, explanation: "نيل أرمسترونج مشى على القمر عام 1969." },
    { id: 12, question: "ما هي عاصمة إيطاليا؟", options: ["البندقية", "ميلانو", "روما", "فلورنسا"], correctAnswer: 2, explanation: "تُعرف روما بالمدينة الخالدة." },
    { id: 13, question: "ما هو الغاز الذي يحتاجه البشر للتنفس للبقاء على قيد الحياة؟", options: ["النيتروجين", "الهيدروجين", "الأكسجين", "ثاني أكسيد الكربون"], correctAnswer: 2, explanation: "يحتاج البشر إلى الأكسجين للتنفس الخلوي." },
    { id: 14, question: "ما هي أكبر دولة في أمريكا الجنوبية؟", options: ["الأرجنتين", "تشيلي", "البرازيل", "بيرو"], correctAnswer: 2, explanation: "البرازيل هي أكبر دولة من حيث المساحة وعدد السكان في أمريكا الجنوبية." },
    { id: 15, question: "كم عدد أرجل العنكبوت؟", options: ["6", "8", "10", "12"], correctAnswer: 1, explanation: "العناكب من العنكبيات ولها عادة 8 أرجل." },
    { id: 16, question: "أي فاكهة تُعرف بـ 'ملك الفواكه' في جنوب شرق آسيا؟", options: ["المانجو", "الدوريان", "الأناناس", "البابايا"], correctAnswer: 1, explanation: "يشتهر الدوريان بحجمه الكبير ورائحته القوية وقشرته المغطاة بالأشواك." },
    { id: 17, question: "ما هي أصغر وحدة للمادة؟", options: ["الجزيء", "الخلية", "الذرة", "الإلكترون"], correctAnswer: 2, explanation: "الذرة هي الوحدة الأساسية للعنصر الكيميائي." },
    { id: 18, question: "من هو مؤلف مسرحية 'روميو وجولييت'؟", options: ["تشارلز ديكنز", "مارك توين", "وليام شكسبير", "جين أوستن"], correctAnswer: 2, explanation: "كتب شكسبير هذه المأساة الشهيرة في أواخر القرن السادس عشر." },
    { id: 19, question: "أي محيط هو ثاني أكبر محيط في العالم؟", options: ["الهندي", "الأطلسي", "المتجمد الشمالي", "الهادئ"], correctAnswer: 1, explanation: "المحيط الأطلسي هو الثاني بعد المحيط الهادئ." },
    { id: 20, question: "ما هي عملة المملكة المتحدة؟", options: ["اليورو", "الدولار", "الجنيه الإسترليني", "الين"], correctAnswer: 2, explanation: "الجنيه الإسترليني هو العملة الرسمية." }
  ],
  Science: [
    { id: 1, question: "ما هو الرمز الكيميائي للذهب؟", options: ["Gd", "Go", "Ag", "Au"], correctAnswer: 3, explanation: "Au يأتي من الكلمة اللاتينية 'Aurum'." },
    { id: 2, question: "أي عضو في جسم الإنسان يضخ الدم؟", options: ["الدماغ", "الرئتان", "القلب", "الكبد"], correctAnswer: 2, explanation: "القلب هو عضو عضلي يضخ الدم عبر الدورة الدموية." },
    { id: 3, question: "ما هو أقرب نجم إلى الأرض؟", options: ["ألفا سنتوري", "سيريوس", "الشمس", "منكب الجوزاء"], correctAnswer: 2, explanation: "الشمس هي مركز نظامنا الشمسي وأقرب نجم إلينا." },
    { id: 4, question: "ما هو الغاز الذي تمتصه النباتات من الغلاف الجوي؟", options: ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"], correctAnswer: 2, explanation: "تأخذ النباتات ثاني أكسيد الكربون لعملية البناء الضوئي." },
    { id: 5, question: "ما هي درجة غليان الماء بالدرجة المئوية؟", options: ["90°C", "100°C", "110°C", "120°C"], correctAnswer: 1, explanation: "يغلي الماء عند 100 درجة مئوية عند مستوى سطح البحر." },
    { id: 6, question: "أي كوكب هو الأقرب إلى الشمس؟", options: ["الزهرة", "المريخ", "عطارد", "الأرض"], correctAnswer: 2, explanation: "عطارد هو أصغر الكواكب وأقربها للشمس." },
    { id: 7, question: "أي جزء من الخلية يحتوي على المادة الوراثية؟", options: ["السيتوبلازم", "النواة", "الغشاء", "الريبوسوم"], correctAnswer: 1, explanation: "تعمل النواة كـ 'دماغ' الخلية وتحتوي على الحمض النووي (DNA)." },
    { id: 8, question: "ما هو الغاز الأكثر شيوعاً في الغلاف الجوي للأرض؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الأرجون"], correctAnswer: 2, explanation: "يشكل النيتروجين حوالي 78٪ من الغلاف الجوي للأرض." },
    { id: 9, question: "ما هي القوة التي تبقينا على الأرض؟", options: ["المغناطيسية", "الاحتكاك", "الجاذبية", "القصور الذاتي"], correctAnswer: 2, explanation: "الجاذبية هي القوة التي تسحب الأشياء نحو مركز الأرض." },
    { id: 10, question: "كم عدد الكواكب في نظامنا الشمسي؟", options: ["7", "8", "9", "10"], correctAnswer: 1, explanation: "الكواكب الثمانية هي عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، ونبتون." },
    { id: 11, question: "ما هو الرمز الكيميائي للفضة؟", options: ["Si", "Sl", "Ag", "Sr"], correctAnswer: 2, explanation: "Ag يأتي من الكلمة اللاتينية 'Argentum'." },
    { id: 12, question: "ماذا يسمى مركز الذرة؟", options: ["الإلكترون", "البروتون", "النواة", "النيوترون"], correctAnswer: 2, explanation: "تحتوي النواة على بروتونات ونيوترونات الذرة." },
    { id: 13, question: "أي كوكب يشتهر بحلقاته البارزة؟", options: ["المشتري", "أورانوس", "نبتون", "زحل"], correctAnswer: 3, explanation: "حلقات زحل هي النظام الحلقي الأكثر شمولاً ووضوحاً." },
    { id: 14, question: "ما هو اسم دراسة الكائنات الحية؟", options: ["الجيولوجيا", "علم الأحياء", "الفيزياء", "الكيمياء"], correctAnswer: 1, explanation: "يغطي علم الأحياء كل شيء من الخلايا إلى النظم البيئية." },
    { id: 15, question: "أي معدن يكون سائلاً في درجة حرارة الغرفة؟", options: ["الحديد", "الزئبق", "النحاس", "الألومنيوم"], correctAnswer: 1, explanation: "الزئبق هو المعدن الوحيد السائل في درجة الحرارة والضغط القياسيين." },
    { id: 16, question: "كم تبلغ سرعة الضوء تقريباً؟", options: ["100,000 كم/ث", "300,000 كم/ث", "500,000 كم/ث", "1,000,000 كم/ث"], correctAnswer: 1, explanation: "ينتقل الضوء بحوالي 299,792 كيلومتراً في الثانية في الفراغ." },
    { id: 17, question: "أي جزء من النبات مسؤول عن البناء الضوئي؟", options: ["الجذور", "الساق", "الأوراق", "الزهور"], correctAnswer: 2, explanation: "تحتوي الأوراق على الكلوروفيل الذي يلتقط ضوء الشمس للطاقة." },
    { id: 18, question: "ما هو الغاز الرئيسي الموجود في الشمس؟", options: ["الأكسجين", "الهيدروجين", "الهيليوم", "الكربون"], correctAnswer: 1, explanation: "تتكون الشمس من حوالي 73٪ هيدروجين و 25٪ هيليوم." },
    { id: 19, question: "أي طبقة من طبقات الأرض هي الأكثر حرارة؟", options: ["القشرة", "الوشاح", "اللب الخارجي", "اللب الداخلي"], correctAnswer: 3, explanation: "اللب الداخلي هو كرة صلبة من الحديد والنيكل تصل حرارتها إلى 5200 درجة مئوية." },
    { id: 20, question: "ما هي عملية تحول السائل إلى غاز؟", options: ["التجمد", "التكثف", "التبخر", "الذوبان"], correctAnswer: 2, explanation: "يحدث التبخر عندما تكتسب الجزيئات على سطح السائل طاقة كافية لتصبح غازاً." }
  ],
  Geography: [
    { id: 1, question: "ما هي عاصمة فرنسا؟", options: ["لندن", "برلين", "مدريد", "باريس"], correctAnswer: 3, explanation: "تُعرف باريس بـ 'مدينة النور'." },
    { id: 2, question: "ما هي أصغر قارة من حيث مساحة اليابسة؟", options: ["أوروبا", "أستراليا", "القارة القطبية الجنوبية", "أمريكا الجنوبية"], correctAnswer: 1, explanation: "أستراليا هي دولة وأصغر قارة في نفس الوقت." },
    { id: 3, question: "ما هو أطول نهر في العالم؟", options: ["الأمازون", "النيل", "الميسيسيبي", "اليانغتسي"], correctAnswer: 1, explanation: "يُعتبر النيل تقليدياً أطول نهر، حيث يتدفق عبر شمال شرق أفريقيا." },
    { id: 4, question: "أي دولة لديها أكبر عدد من السكان في العالم؟", options: ["الهند", "الولايات المتحدة", "الصين", "روسيا"], correctAnswer: 2, explanation: "تمتلك الصين حالياً أكبر عدد من السكان، تليها الهند عن كثب." },
    { id: 5, question: "في أي دولة يقع تاج محل؟", options: ["باكستان", "الهند", "بنغلاديش", "نيبال"], correctAnswer: 1, explanation: "تاج محل هو ضريح من الرخام الأبيض العاجي يقع في أغرا، الهند." },
    { id: 6, question: "ما هي أكبر دولة في العالم من حيث المساحة؟", options: ["كندا", "الولايات المتحدة", "الصين", "روسيا"], correctAnswer: 3, explanation: "روسيا هي أكبر دولة وتمتد عبر أوروبا الشرقية وشمال آسيا." },
    { id: 7, question: "أي صحراء هي أكبر صحراء حارة في العالم؟", options: ["غوبي", "كالاهاري", "الصحراء الكبرى", "العربية"], correctAnswer: 2, explanation: "تغطي الصحراء الكبرى جزءاً كبيراً من شمال أفريقيا." },
    { id: 8, question: "في أي سلسلة جبال يقع جبل إيفرست؟", options: ["الأنديز", "روكي", "الألب", "الهيمالايا"], correctAnswer: 3, explanation: "تحتوي جبال الهيمالايا على العديد من أعلى القمم في العالم." },
    { id: 9, question: "أي دولة جزرية تُعتبر قارة أيضاً؟", options: ["جرينلاند", "أستراليا", "آيسلندا", "مدغشقر"], correctAnswer: 1, explanation: "أستراليا فريدة من نوعها لأنها دولة جزرية وقارة في نفس الوقت." },
    { id: 10, question: "ما هي عاصمة اليابان؟", options: ["أوساكا", "كيوتو", "طوكيو", "هيروشيما"], correctAnswer: 2, explanation: "طوكيو هي العاصمة الصاخبة لليابان وأكثر المناطق الحضرية اكتظاظاً بالسكان." },
    { id: 11, question: "أي محيط يقع بين الأمريكتين وأوروبا/أفريقيا؟", options: ["الهادئ", "الأطلسي", "الهندي", "الجنوبي"], correctAnswer: 1, explanation: "يفصل المحيط الأطلسي العالم القديم عن العالم الجديد." },
    { id: 12, question: "ما هي عاصمة مصر؟", options: ["الإسكندرية", "الأقصر", "القاهرة", "الجيزة"], correctAnswer: 2, explanation: "القاهرة هي أكبر مدينة في العالم العربي." },
    { id: 13, question: "أي دولة تقع في كل من أوروبا وآسيا؟", options: ["اليونان", "تركيا", "مصر", "إيطاليا"], correctAnswer: 1, explanation: "تمتد تركيا عبر شبه جزيرة الأناضول في آسيا ومنطقة البلقان في أوروبا." },
    { id: 14, question: "ما هي أكبر جزيرة في العالم؟", options: ["أستراليا", "جرينلاند", "غينيا الجديدة", "بورنيو"], correctAnswer: 1, explanation: "جرينلاند هي أكبر جزيرة؛ أستراليا تُعتبر قارة." },
    { id: 15, question: "أي جبل هو الأعلى في أفريقيا؟", options: ["جبل كينيا", "جبل ستانلي", "جبل كليمنجارو", "جبل ميرو"], correctAnswer: 2, explanation: "كليمنجارو هو بركان خامد في تنزانيا." },
    { id: 16, question: "ما هي عاصمة كندا؟", options: ["تورونتو", "فانكوفر", "مونتريال", "أوتاوا"], correctAnswer: 3, explanation: "أوتاوا هي المركز السياسي لكندا." },
    { id: 17, question: "أي بحر يقع بين أوروبا وأفريقيا؟", options: ["البحر الأحمر", "البحر الأسود", "البحر الأبيض المتوسط", "بحر قزوين"], correctAnswer: 2, explanation: "يتصل البحر الأبيض المتوسط بالمحيط الأطلسي عبر مضيق جبل طارق." },
    { id: 18, question: "ما هي عاصمة أستراليا؟", options: ["سيدني", "ملبورن", "كانبرا", "بيرث"], correctAnswer: 2, explanation: "تم اختيار كانبرا كحل وسط بين سيدني وملبورن." },
    { id: 19, question: "أي دولة بها أكبر عدد من البراكين؟", options: ["اليابان", "الولايات المتحدة", "إندونيسيا", "آيسلندا"], correctAnswer: 2, explanation: "يوجد في إندونيسيا أكثر من 130 بركاناً نشطاً." },
    { id: 20, question: "ما هي اللغة الرسمية في البرازيل؟", options: ["الإسبانية", "الإنجليزية", "البرتغالية", "الفرنسية"], correctAnswer: 2, explanation: "تم استعمار البرازيل من قبل البرتغال، على عكس معظم أمريكا الجنوبية." }
  ],
  Islamic: [
    { id: 1, question: "في أي شهر يصوم المسلمون؟", options: ["شوال", "رمضان", "رجب", "ذو الحجة"], correctAnswer: 1, explanation: "رمضان هو الشهر التاسع في التقويم الإسلامي." },
    { id: 2, question: "ما هو كتاب المسلمين المقدس؟", options: ["التوراة", "الإنجيل", "القرآن", "الزبور"], correctAnswer: 2, explanation: "يؤمن المسلمون بأن القرآن هو كلام الله المنزل على النبي محمد (صلى الله عليه وسلم)." },
    { id: 3, question: "كم مرة يصلي المسلمون في اليوم؟", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "الصلوات الخمس هي أحد أركان الإسلام." },
    { id: 4, question: "ما هي قبلة المسلمين في الصلاة؟", options: ["الشرق", "الغرب", "الكعبة", "القدس"], correctAnswer: 2, explanation: "يتجه المسلمون نحو الكعبة في مكة المكرمة أثناء الصلاة." },
    { id: 5, question: "من هو أول نبي في الإسلام؟", options: ["نوح", "إبراهيم", "موسى", "آدم"], correctAnswer: 3, explanation: "النبي آدم (عليه السلام) هو أول إنسان وأول نبي." },
    { id: 6, question: "ما هي أركان الإسلام الخمسة؟", options: ["الشهادتان، الصلاة، الزكاة، الصوم، الحج", "الشهادتان، الصلاة، اللطف، الصدق، الحج", "الصلاة، الزكاة، الصوم، الاحترام، الحج", "الإيمان، السلام، الزكاة، الصوم، الحج"], correctAnswer: 0, explanation: "هذه العبادات الخمس هي أساس حياة المسلم." },
    { id: 7, question: "ما هي المدينة التي وُلد فيها النبي محمد (صلى الله عليه وسلم)؟", options: ["المدينة المنورة", "القدس", "مكة المكرمة", "الطائف"], correctAnswer: 2, explanation: "وُلد النبي محمد (صلى الله عليه وسلم) في مكة حوالي عام 570 م." },
    { id: 8, question: "ما اسم التقويم الإسلامي؟", options: ["التقويم الشمسي", "التقويم الهجري", "التقويم القمري", "التقويم الميلادي"], correctAnswer: 1, explanation: "يعتمد التقويم الهجري على الدورة القمرية ويبدأ من الهجرة." },
    { id: 9, question: "كم عدد سور القرآن الكريم؟", options: ["100", "114", "120", "132"], correctAnswer: 1, explanation: "يتكون القرآن الكريم من 114 سورة." },
    { id: 10, question: "ما اسم الحج إلى مكة؟", options: ["العمرة", "الزكاة", "الحج", "الصدقة"], correctAnswer: 2, explanation: "الحج هو الفريضة التي يجب على كل مسلم قادر أداؤها مرة واحدة في العمر." },
    { id: 11, question: "ما هو الشهر الأول في التقويم الهجري؟", options: ["رمضان", "محرم", "صفر", "رجب"], correctAnswer: 1, explanation: "يمثل محرم بداية العام الإسلامي الجديد." },
    { id: 12, question: "من هي أول امرأة اعتنقت الإسلام؟", options: ["عائشة", "فاطمة", "خديجة", "حفصة"], correctAnswer: 2, explanation: "السيدة خديجة (رضي الله عنها) هي أول من آمن برسالة النبي." },
    { id: 13, question: "ما اسم هجرة النبي من مكة إلى المدينة؟", options: ["الإسراء", "المعراج", "الهجرة", "الحج"], correctAnswer: 2, explanation: "حدثت الهجرة عام 622 م وتمثل بداية التاريخ الهجري." },
    { id: 14, question: "من هو أول خليفة في الإسلام؟", options: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"], correctAnswer: 1, explanation: "تولى أبو بكر الصديق (رضي الله عنه) قيادة المسلمين بعد وفاة النبي." },
    { id: 15, question: "ما هي الكلمة العربية التي تعني توحيد الله؟", options: ["الإحسان", "التوحيد", "الشرك", "الفقه"], correctAnswer: 1, explanation: "التوحيد هو المفهوم الأساسي في الإسلام." },
    { id: 16, question: "في أي مدينة يقع المسجد الأقصى؟", options: ["مكة", "المدينة", "القدس", "دمشق"], correctAnswer: 2, explanation: "المسجد الأقصى هو ثالث أقدس المواقع في الإسلام." },
    { id: 17, question: "ما اسم رحلة النبي الليلية إلى السماء؟", options: ["الهجرة", "الإسراء والمعراج", "الفتح", "بدر"], correctAnswer: 1, explanation: "أخذت هذه الرحلة المعجزة النبي من مكة إلى القدس ثم إلى السموات." },
    { id: 18, question: "ما هي الضريبة المعطاة للفقراء كأحد أركان الإسلام؟", options: ["الصدقة", "الجزية", "الزكاة", "الخراج"], correctAnswer: 2, explanation: "الزكاة هي مساهمة خيرية إلزامية (2.5٪ من الثروة)." },
    { id: 19, question: "ما اسم الغار الذي نزل فيه الوحي لأول مرة؟", options: ["غار حراء", "غار ثور", "غار أصحاب الكهف", "غار الكهف"], correctAnswer: 0, explanation: "نزلت أولى آيات القرآن في غار حراء." },
    { id: 20, question: "من هو النبي الملقب بـ 'خليل الله'؟", options: ["موسى", "عيسى", "إبراهيم", "نوح"], correctAnswer: 2, explanation: "يُكرّم النبي إبراهيم (عليه السلام) بهذا اللقب في الإسلام." }
  ],
  Saudi: [
    { id: 1, question: "ما هي عاصمة المملكة العربية السعودية؟", options: ["جدة", "الرياض", "الدمام", "مكة"], correctAnswer: 1, explanation: "الرياض هي أكبر مدينة والعاصمة السياسية للمملكة." },
    { id: 2, question: "في أي عام تأسست المملكة العربية السعودية الحديثة؟", options: ["1920", "1932", "1945", "1953"], correctAnswer: 1, explanation: "أسس الملك عبد العزيز آل سعود المملكة في 23 سبتمبر 1932." },
    { id: 3, question: "ما هي العملة الرسمية للسعودية؟", options: ["الدينار", "الدرهم", "الريال", "الجنيه"], correctAnswer: 2, explanation: "الريال السعودي (SAR) هو العملة الرسمية." },
    { id: 4, question: "ما هي اللغة الرسمية في السعودية؟", options: ["الإنجليزية", "الفرنسية", "العربية", "الأوردية"], correctAnswer: 2, explanation: "اللغة العربية هي اللغة الرسمية للمملكة." },
    { id: 5, question: "أي مدينة تُعرف بـ 'عروس البحر الأحمر'؟", options: ["جدة", "ينبع", "الدمام", "أبها"], correctAnswer: 0, explanation: "جدة هي مدينة ساحلية رئيسية وغالباً ما تسمى عروس البحر الأحمر." },
    { id: 6, question: "ما هو الشعار الوطني للسعودية؟", options: ["الجمل", "النسر", "سيفان ونخلة", "الصقر"], correctAnswer: 2, explanation: "السيفان يمثلان القوة والنخلة تمثل الرخاء." },
    { id: 7, question: "أين يقع المسجد النبوي؟", options: ["مكة", "المدينة المنورة", "الرياض", "تبوك"], correctAnswer: 1, explanation: "يقع المسجد في المدينة المنورة وأسسه النبي (صلى الله عليه وسلم)." },
    { id: 8, question: "أي من هذه الأماكن المقدسة يوجد في السعودية؟", options: ["البتراء", "الأهرامات", "الكعبة", "الكولوسيوم"], correctAnswer: 2, explanation: "الكعبة، الواقعة في مكة، هي أقدس مكان في الإسلام." },
    { id: 9, question: "ما هو الزي التقليدي للرجال في السعودية؟", options: ["الساري", "الثوب", "الكيمونو", "النقبة"], correctAnswer: 1, explanation: "الثوب هو رداء طويل يرتديه الرجال السعوديون تقليدياً." },
    { id: 10, question: "أي بحر يحد السعودية من الغرب؟", options: ["بحر العرب", "البحر الأحمر", "البحر الأبيض المتوسط", "البحر الميت"], correctAnswer: 1, explanation: "يحد البحر الأحمر الساحل الغربي للسعودية." },
    { id: 11, question: "ما اسم الرقصة التقليدية السعودية؟", options: ["الدبكة", "العرضة", "السالسا", "التانغو"], correctAnswer: 1, explanation: "العرضة هي رقصة سيف تقليدية تُؤدى في الاحتفالات." },
    { id: 12, question: "أي مدينة هي وجهة الحجاج؟", options: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة"], correctAnswer: 2, explanation: "مكة هي أقدس مدينة حيث تقع الكعبة." },
    { id: 13, question: "ما اسم الصحراء الشاسعة في جنوب السعودية؟", options: ["الصحراء الكبرى", "غوبي", "الربع الخالي", "موهافي"], correctAnswer: 2, explanation: "الربع الخالي هو أكبر صحراء رملية متصلة في العالم." },
    { id: 14, question: "أي سلسلة جبال تمتد على طول الساحل الغربي للسعودية؟", options: ["جبال الأطلس", "جبال السروات", "الهيمالايا", "الألب"], correctAnswer: 1, explanation: "تمتد جبال السروات من حدود الأردن وصولاً إلى اليمن." },
    { id: 15, question: "ما هو الاسم الرسمي ليوم السعودية الوطني؟", options: ["يوم الاستقلال", "يوم التأسيس", "اليوم الوطني", "يوم الوحدة"], correctAnswer: 2, explanation: "يُحتفل باليوم الوطني في 23 سبتمبر من كل عام." },
    { id: 16, question: "أي منظمة دولية يقع مقرها في جدة؟", options: ["أوبك", "منظمة التعاون الإسلامي", "الأمم المتحدة", "الفيفا"], correctAnswer: 1, explanation: "يقع مقر منظمة التعاون الإسلامي (OIC) في جدة." },
    { id: 17, question: "ما هو المكون الرئيسي للكبسة؟", options: ["المعكرونة", "الأرز", "الخبز", "البطاطس"], correctAnswer: 1, explanation: "الكبسة طبق أرز شهير يُقدم مع اللحم والخضروات والتوابل." },
    { id: 18, question: "من هو أول ملك سعودي يُلقب بـ 'خادم الحرمين الشريفين'؟", options: ["الملك عبدالعزيز", "الملك فيصل", "الملك فهد", "الملك سلمان"], correctAnswer: 2, explanation: "تبنى الملك فهد هذا اللقب رسمياً عام 1986." },
    { id: 19, question: "ما اسم المشروع الضخم في شمال غرب السعودية؟", options: ["نيوم", "القدية", "مشروع البحر الأحمر", "ذا لاين"], correctAnswer: 0, explanation: "نيوم هو مشروع طموح يُبنى كمدينة ذكية مستدامة." },
    { id: 20, question: "ما اسم المنطقة التاريخية في الرياض؟", options: ["البلد", "الدرعية", "سوق واقف", "الكورنيش"], correctAnswer: 1, explanation: "الدرعية كانت موطن العائلة المالكة السعودية وأول عاصمة سعودية." }
  ],
  Health: [
    { id: 1, question: "كم عدد العظام في جسم الإنسان البالغ؟", options: ["156", "206", "256", "306"], correctAnswer: 1, explanation: "البالغون لديهم 206 عظمة؛ بينما يولد الأطفال بحوالي 270 عظمة." },
    { id: 2, question: "أي فيتامين يُعرف بـ 'فيتامين أشعة الشمس'؟", options: ["فيتامين أ", "فيتامين ب", "فيتامين ج", "فيتامين د"], correctAnswer: 3, explanation: "ينتج الجسم فيتامين د عند تعرض الجلد لأشعة الشمس." },
    { id: 3, question: "ما هي درجة حرارة الجسم الطبيعية بالمئوية؟", options: ["35°C", "37°C", "39°C", "41°C"], correctAnswer: 1, explanation: "تُعتبر 37 درجة مئوية متوسط درجة حرارة الجسم الطبيعية." },
    { id: 4, question: "أي عضو مسؤول عن التنفس؟", options: ["القلب", "الرئتان", "المعدة", "الكلى"], correctAnswer: 1, explanation: "تقوم الرئتان بتبادل الأكسجين وثاني أكسيد الكربون من الدم." },
    { id: 5, question: "ما هو أكبر عضو في جسم الإنسان؟", options: ["الكبد", "الدماغ", "الجلد", "القلب"], correctAnswer: 2, explanation: "الجلد هو أكبر عضو ويغطي ويحمي الجسم بالكامل." },
    { id: 6, question: "كم عدد حجرات قلب الإنسان؟", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "يحتوي قلب الإنسان على أربع حجرات: أذينين وبطينين." },
    { id: 7, question: "أي نوع من خلايا الدم يكافح العدوى؟", options: ["خلايا الدم الحمراء", "خلايا الدم البيضاء", "الصفائح الدموية", "البلازما"], correctAnswer: 1, explanation: "خلايا الدم البيضاء هي جزء من الجهاز المناعي للجسم." },
    { id: 8, question: "ما هو المصدر الرئيسي للطاقة في الجسم؟", options: ["البروتين", "الدهون", "الكربوهيدرات", "الفيتامينات"], correctAnswer: 2, explanation: "تتحلل الكربوهيدرات إلى جلوكوز وهو المصدر الرئيسي للطاقة." },
    { id: 9, question: "أي معدن مهم لعظام وأسنان قوية؟", options: ["الحديد", "الكالسيوم", "الزنك", "المغنيسيوم"], correctAnswer: 1, explanation: "الكالسيوم ضروري للحفاظ على كثافة العظام وصحة الأسنان." },
    { id: 10, question: "أي فيتامين يوجد بكثرة في الحمضيات؟", options: ["فيتامين أ", "فيتامين ك", "فيتامين ج", "فيتامين هـ"], correctAnswer: 2, explanation: "الفواكه الحمضية مثل البرتقال والليمون غنية بفيتامين ج (C)." },
    { id: 11, question: "ما هي الوظيفة الرئيسية للكلى؟", options: ["ضخ الدم", "هضم الطعام", "تصفية فضلات الدم", "تخزين الصفراء"], correctAnswer: 2, explanation: "تقوم الكلى بتصفية الفضلات والمياه الزائدة لتكوين البول." },
    { id: 12, question: "ما هي أقوى عضلة في جسم الإنسان مقارنة بحجمها؟", options: ["القلب", "العضلة ذات الرأسين", "اللسان", "العضلة الماضغة"], correctAnswer: 3, explanation: "يمكن للعضلة الماضغة (في الفك) إغلاق الأسنان بقوة تصل إلى 200 رطل." },
    { id: 13, question: "أي عضو يخزن العصارة الصفراوية التي ينتجها الكبد؟", options: ["الطحال", "البنكرياس", "المرارة", "المثانة"], correctAnswer: 2, explanation: "تفرز المرارة العصارة الصفراوية في الأمعاء الدقيقة للمساعدة في هضم الدهون." },
    { id: 14, question: "ما هو الاسم الشائع للحنجرة؟", options: ["القصبة الهوائية", "صندوق الصوت", "الحلق", "طبلة الأذن"], correctAnswer: 1, explanation: "تحتوي الحنجرة على الحبال الصوتية." },
    { id: 15, question: "أي فصيلة دم تُعرف بـ 'المتبرع العام'؟", options: ["A+", "B-", "AB+", "O-"], correctAnswer: 3, explanation: "يمكن إعطاء الدم من فصيلة O- للمرضى من جميع فصائل الدم." },
    { id: 16, question: "كم عدد الأسنان لدى إنسان بالغ طبيعي؟", options: ["28", "30", "32", "34"], correctAnswer: 2, explanation: "يمتلك البالغون عادة 32 سناً، بما في ذلك أسنان العقل." },
    { id: 17, question: "أي عنصر غذائي ضروري لإصلاح العضلات؟", options: ["السكر", "البروتين", "الألياف", "الملح"], correctAnswer: 1, explanation: "البروتينات هي اللبنات الأساسية لأنسجة الجسم." },
    { id: 18, question: "ما اسم الصبغة التي تعطي الجلد لونه؟", options: ["الهيموغلوبين", "الميلانين", "الكلوروفيل", "الكيراتين"], correctAnswer: 1, explanation: "يحمي الميلانين البشرة من الأشعة فوق البنفسجية." },
    { id: 19, question: "أي جزء من الأذن مسؤول عن التوازن؟", options: ["طبلة الأذن", "القوقعة", "الأذن الداخلية", "الأذن الخارجية"], correctAnswer: 2, explanation: "يساعد الجهاز الدهليزي في الأذن الداخلية على الحفاظ على التوازن." },
    { id: 20, question: "ما هو المصطلح الطبي لرضفة الركبة؟", options: ["عظم الفخذ", "الظنبوب", "الرضفة", "الشظية"], correctAnswer: 2, explanation: "الرضفة هي عظمة سميكة دائرية-مثلثية تتمفصل مع عظم الفخذ." }
  ]
};



export function TriviaQuizGame({ onClose, onBackToGames }: { onClose: () => void; onBackToGames: () => void }) {
  const { theme } = useTheme();
  const { fontFamily, locale, isRTL, dir } = useLocale();
  const [gameLang, setGameLang] = useState<string>(localStorage.getItem('game-lang-trivia-quiz') ?? (locale === 'ar' ? 'ar' : 'en'));
  const [gameState, setGameState] = useState<"category" | "playing" | "summary">("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [roundKey, setRoundKey] = useState(0);

  const gt = GAME_TRANSLATIONS[gameLang === 'ar' ? 'ar' : 'en'];
  const activeData = gameLang === 'ar' ? TRIVIA_DATA_AR : TRIVIA_DATA;

  const saveGameState = useCallback(() => {
    if (gameState !== "playing" || !selectedCategory) return;
    const state = {
      selectedCategory,
      currentQuestionIdx,
      userAnswers,
      score,
      roundKey,
      timestamp: Date.now()
    };
    localStorage.setItem('trivia-quiz-game-state', JSON.stringify(state));
  }, [gameState, selectedCategory, currentQuestionIdx, userAnswers, score, roundKey]);

  const loadGameState = () => {
    const saved = localStorage.getItem('trivia-quiz-game-state');
    console.log('=== LOAD GAME STATE ===', 'trivia-quiz-game-state', saved);
    if (saved) {
      const state = JSON.parse(saved);
      setSelectedCategory(state.selectedCategory);
      setCurrentQuestionIdx(state.currentQuestionIdx);
      setUserAnswers(state.userAnswers);
      setScore(state.score);
      setRoundKey(state.roundKey);
      setGameState("playing");
      setShowResumeModal(false);
    }
  };

  const clearGameState = () => {
    localStorage.removeItem('trivia-quiz-game-state');
  };

  const handleNewGame = () => {
    clearGameState();
    setHasSavedGame(false);
    setShowResumeModal(false);
    reset();
  };

  useEffect(() => {
    const saved = localStorage.getItem('trivia-quiz-game-state');
    if (saved) {
      setHasSavedGame(true);
      setShowResumeModal(true);
    }
  }, []);

  useEffect(() => {
    saveGameState();
  }, [saveGameState]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const questions = useMemo(() => {
    if (!selectedCategory) return [];
    // Better shuffle algorithm
    const pool = [...activeData[selectedCategory]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // Take only 10 for this round
    return pool.slice(0, 10);
  }, [selectedCategory, roundKey, activeData]);

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setRoundKey(prev => prev + 1);
    setGameState("playing");
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
    setScore(0);
    clearGameState();
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...userAnswers, idx];
    setUserAnswers(newAnswers);

    if (idx === questions[currentQuestionIdx].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setGameState("summary");
      clearGameState();
    }
  };

  const reset = () => {
    setGameState("category");
    setSelectedCategory(null);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.background }} dir={dir}>
      <div className="shrink-0 flex items-center justify-between px-8" style={{ height: "88px", backgroundColor: theme.surface, borderBottom: theme.cardBorder, boxShadow: SHADOW.lg }}>
        <div className="flex items-center gap-4">
          <button onClick={onBackToGames} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <ArrowLeft size={24} color={theme.textHeading} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h1 style={{ fontFamily: fontFamily, fontSize: TYPE_SCALE.xl, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{gt.triviaQuiz}</h1>
        </div>

        <div className="flex items-center gap-4">
          <GameLanguageToggle gameKey="trivia-quiz" initial={locale === 'ar' ? 'ar' : 'en'} onChange={(l) => setGameLang(l)} />
          {gameState === "playing" && (
            <div className="px-4 py-2 bg-blue-50 rounded-full">
              <span className="font-bold text-blue-600">{gt.question} {currentQuestionIdx + 1}/{questions.length}</span>
            </div>
          )}
          <button onClick={onClose} className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform" style={{ width: "56px", height: "56px", backgroundColor: theme.surfaceElevated, borderRadius: theme.radiusMd, border: "none", outline: "none" }}>
            <span style={{ fontSize: "24px", color: theme.textHeading }}>×</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-8">
        {gameState === "category" && (
          <div className="w-full max-w-4xl flex flex-col items-center gap-10">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4" style={{ color: theme.textHeading }}>{gt.selectCat}</h2>
              <p className="text-lg opacity-70" style={{ color: theme.textNormal }}>{gt.testKnowledge}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {(Object.keys(TRIVIA_DATA) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className="group flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 rounded-3xl transition-all shadow-md active:scale-95"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle size={32} color={theme.primary} />
                  </div>
                  <span className="text-xl font-bold" style={{ color: theme.textHeading }}>{gt[`cat${cat}` as keyof typeof gt] as string}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-3xl flex flex-col gap-8">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-100">
              <h3 className="text-3xl font-bold leading-tight mb-10" style={{ color: theme.textHeading }}>
                {questions[currentQuestionIdx].question}
              </h3>
              <div className="flex flex-col gap-4">
                {questions[currentQuestionIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="flex items-center justify-between p-6 bg-gray-50 hover:bg-blue-600 hover:text-white border-2 border-transparent hover:border-blue-400 rounded-2xl text-xl font-semibold transition-all group active:scale-98"
                    style={{ color: theme.textHeading }}
                  >
                    <span>{opt}</span>
                    <ChevronRight className={`opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === "summary" && (
          <div className="w-full max-w-4xl flex flex-col gap-8 py-8 min-h-0" style={{ minHeight: 0 }}>
            <div className="text-center">
              <Trophy size={80} color="#FFD700" className="mx-auto mb-4" />
              <h2 className="text-4xl font-black mb-2" style={{ color: theme.textHeading }}>{gt.quizComplete}</h2>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>{gt.youScored} {score} {gt.outOf} {questions.length}</p>
            </div>

            <div className="overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-xl flex flex-col" style={{ minHeight: 0, maxHeight: 'calc(100vh - 240px)' }}>
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500">{gt.summary}</p>
                    <h3 className="text-2xl font-bold" style={{ color: theme.textHeading }}>{gt.youScored} {score}</h3>
                  </div>
                  <div className="rounded-3xl bg-blue-50 px-4 py-3 text-blue-700 font-semibold">
                    {questions.length} {gt.questions}
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto p-8 flex flex-col gap-6" style={{ minHeight: 0 }}>
                {questions.map((q, i) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h4 className="text-lg font-bold" style={{ color: theme.textHeading }}>{q.question}</h4>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {userAnswers[i] === q.correctAnswer ? (
                          <CheckCircle2 color="#10B981" size={22} className="shrink-0" />
                        ) : (
                          <XCircle color="#EF4444" size={22} className="shrink-0" />
                        )}
                        <span>{userAnswers[i] === q.correctAnswer ? gt.correct : gt.incorrect}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500 font-semibold">{gt.correctAnswerLabel}</span>
                        <span className="font-bold text-green-600">{q.options[q.correctAnswer]}</span>
                      </div>
                      {userAnswers[i] !== q.correctAnswer && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500 font-semibold">{gt.yourAnswerLabel}</span>
                          <span className="font-bold text-red-500">{q.options[userAnswers[i]]}</span>
                        </div>
                      )}
                      <p className="text-sm italic text-gray-600">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md mx-auto sm:flex-row">
              <button onClick={() => selectCategory(selectedCategory!)} className="flex-1 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">{gt.replay}</button>
              <button onClick={reset} className="flex-1 py-5 bg-gray-100 font-bold rounded-2xl active:scale-95 transition-all" style={{ color: theme.textHeading }}>{gt.otherCat}</button>
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
            <div className="w-24 h-24 rounded-full bg-primarySubtle flex items-center justify-center" style={{ backgroundColor: theme.primarySubtle }}>
              <RotateCcw size={48} color={theme.primary} />
            </div>

            <div className="text-center gap-2 flex flex-col">
              <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                {gt.resumeGame}
              </h2>
              <p style={{ fontFamily, fontSize: TYPE_SCALE.md, color: theme.textMuted }}>
                {gt.resumeDesc}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={loadGameState}
                className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme.textInverse, fontSize: TYPE_SCALE.md }}
              >
                {gt.continuePlaying}
              </button>
              <button
                onClick={handleNewGame}
                className="w-full py-5 rounded-2xl font-bold transition-all hover:bg-black/5 active:scale-95"
                style={{ backgroundColor: theme.surfaceElevated, color: theme.textHeading, border: theme.cardBorder, fontSize: TYPE_SCALE.md }}
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
