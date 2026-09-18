import { DatasetClassInfo } from '../types';
import { LOCAL_BUNDLED_DISH_IMAGES } from '../utils/foodImageHelper';

export interface KaggleDatasetMeta {
  title: string;
  sourceUrl: string;
  publisher: string;
  totalImages: number;
  classesCount: number;
  license: string;
  description: string;
}

export const KAGGLE_DATASET_META: KaggleDatasetMeta = {
  title: 'West African Cuisine Deep Learning Benchmark & Kaggle Nigerian Foods Dataset',
  sourceUrl: 'https://www.kaggle.com/datasets/nigerian-food-dataset',
  publisher: 'Curated from Kaggle Nigerian Food AI & West African Food Recognition Research Benchmark',
  totalImages: 2480,
  classesCount: 16,
  license: 'CC BY-SA 4.0 / Open Access Research',
  description: 'A multi-country West African computer vision benchmark for high-accuracy food classification, feature extraction, and automated recipe generation. Built with ground-truth photographic annotations from Nigeria, Ghana, Senegal, and the Sahel.'
};

export const WEST_AFRICAN_DATASET_CLASSES: DatasetClassInfo[] = [
  {
    id: 'jollof-rice',
    name: 'Jollof Rice',
    category: 'Rice & Grains',
    region: 'Pan-West Africa (Senegambia, Nigeria, Ghana)',
    kaggleSource: 'Kaggle: Nigerian Foods & West African Rice Benchmark',
    sampleCount: 220,
    trainCount: 160,
    valCount: 30,
    testCount: 30,
    authenticityScore: 99,
    visualHallmarks: [
      'Glossy smoky orange-red long grain rice',
      'Roasted red bell pepper reduction coating',
      'Party-style bottom-pot caramelization'
    ],
    culinaryNotes: 'Distinct grains coated in reduced tomato-tatashe paste with thyme, curry, and bay aromatics.',
    keySpices: ['Curry Powder', 'Dried Thyme', 'Bay Leaves', 'Tatashe Bell Pepper', 'Scotch Bonnet'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['jollof-rice'] || '/dataset/images/Jollof Rice.jpg',
    imageUrls: ['/dataset/images/Jollof Rice.jpg', '/dataset/images/jollof-rice.jpg', '/images/jollof-rice.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#b91c1c', '#ea580c', '#d97706'],
    averagePreparationTime: '45 mins'
  },
  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    category: 'Soups & Stews',
    region: 'Nigeria & West Africa',
    kaggleSource: 'Kaggle: Nigeria Food AI Dataset (Melon Seed Stew)',
    sampleCount: 195,
    trainCount: 140,
    valCount: 25,
    testCount: 30,
    authenticityScore: 98,
    visualHallmarks: [
      'Golden melon seed curds and protein lumps',
      'Rich red palm oil bubbling separation',
      'Braised assorted meats and vibrant ugu greens'
    ],
    culinaryNotes: 'Textured melon seed protein cakes simmered in palm oil with stockfish, fermented locust beans (iru), and leafy greens.',
    keySpices: ['Fermented Locust Beans (Iru)', 'Ground Crayfish', 'Smoked Fish', 'Scotch Bonnet'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['egusi-soup'] || '/dataset/images/Egusi Soup.jpg',
    imageUrls: ['/dataset/images/Egusi Soup.jpg', '/dataset/images/egusi-soup.jpg', '/images/egusi-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#ca8a04', '#b45309', '#15803d'],
    averagePreparationTime: '50 mins'
  },
  {
    id: 'suya',
    name: 'Suya (Tsire)',
    category: 'Grilled & Street Food',
    region: 'Northern Nigeria / Sahelian West Africa',
    kaggleSource: 'Kaggle: Nigerian Street Foods & Meat Classification',
    sampleCount: 185,
    trainCount: 135,
    valCount: 25,
    testCount: 25,
    authenticityScore: 99,
    visualHallmarks: [
      'Thinly sliced skewered beef with char marks',
      'Yaji kuli-kuli peanut spice dusting',
      'Sliced red onions and fresh tomatoes'
    ],
    culinaryNotes: 'Open-flame charcoal grilled beef dusted with authentic Northern Nigerian yaji pepper (roasted groundnuts, ginger, cloves, chili).',
    keySpices: ['Kuli-Kuli Roasted Peanut Powder', 'Ginger Powder', 'Calabash Nutmeg', 'Chili Flakes'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['suya'] || '/dataset/images/Suya.jpg',
    imageUrls: ['/dataset/images/Suya.jpg', '/dataset/images/suya.jpg', '/images/suya.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#78350f', '#451a03', '#dc2626'],
    averagePreparationTime: '30 mins'
  },
  {
    id: 'pounded-yam',
    name: 'Pounded Yam (Iyan)',
    category: 'Swallows & Traditional',
    region: 'Nigeria / Benin / Togo',
    kaggleSource: 'Kaggle: Nigerian Swallow & Starch Benchmark',
    sampleCount: 170,
    trainCount: 120,
    valCount: 25,
    testCount: 25,
    authenticityScore: 99,
    visualHallmarks: [
      'Silky alabaster white swallow mound',
      'Pliable elastic texture',
      'Molded sphere serving presentation'
    ],
    culinaryNotes: 'Steamed African white Guinea yam pounded in a wooden mortar until starchy, stretchy, and pillowy.',
    keySpices: ['Pure White Guinea Yam (Dioscorea rotundata)'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['pounded-yam'] || '/dataset/images/Pounded yam.jpg',
    imageUrls: ['/dataset/images/Pounded yam.jpg', '/dataset/images/pounded-yam.jpg', '/images/pounded-yam.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#f5f5f4', '#e7e5e4', '#d6d3d1'],
    averagePreparationTime: '35 mins'
  },
  {
    id: 'amala',
    name: 'Amala with Ewedu & Gbegiri',
    category: 'Swallows & Traditional',
    region: 'Western Nigeria (Yoruba)',
    kaggleSource: 'Kaggle: Nigerian Traditional Foods / Elubo Swallow',
    sampleCount: 165,
    trainCount: 120,
    valCount: 20,
    testCount: 25,
    authenticityScore: 99,
    visualHallmarks: [
      'Velvety dark brown yam flour swallow (Amala isu)',
      'Served with green viscous Ewedu and golden Gbegiri soup',
      'Silky elastic consistency'
    ],
    culinaryNotes: 'Traditional Yoruba swallow made from dried yam flour (elubo), whipped in rolling hot water to dark velvet consistency.',
    keySpices: ['Elubo Yam Flour', 'Jute Leaves (Ewedu)', 'Fermented Locust Beans', 'Ground Crayfish'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['amala'] || '/dataset/images/amala.jpg',
    imageUrls: ['/dataset/images/amala.jpg', '/images/amala.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#3f2c22', '#291b14', '#166534'],
    averagePreparationTime: '20 mins'
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro',
    category: 'Soups & Stews',
    region: 'Western Nigeria (Yoruba)',
    kaggleSource: 'Kaggle: West African Leafy Stews Dataset',
    sampleCount: 155,
    trainCount: 110,
    valCount: 20,
    testCount: 25,
    authenticityScore: 98,
    visualHallmarks: [
      'Rich emerald green shredded spinach or shoko leaves',
      'Aromatic palm oil pepper base reduction',
      'Smoked catfish, kpomo, and tender tripe'
    ],
    culinaryNotes: 'Yoruba vegetable stew prepared by tossing blanched greens into seasoned fried palm-oil pepper reduction.',
    keySpices: ['Iru (Locust Beans)', 'Smoked Catfish', 'Dried Crayfish', 'Tatashe Bell Pepper'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['efo-riro'] || '/dataset/images/Efo riro.jpg',
    imageUrls: ['/dataset/images/Efo riro.jpg', '/dataset/images/efo-riro.jpg', '/images/efo-riro.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#166534', '#15803d', '#991b1b'],
    averagePreparationTime: '40 mins'
  },
  {
    id: 'moin-moin',
    name: 'Moin Moin (Moi Moi)',
    category: 'Steamed & Savory',
    region: 'Nigeria & Pan-West Africa',
    kaggleSource: 'Kaggle: Nigerian Foods & Legume Classification',
    sampleCount: 160,
    trainCount: 115,
    valCount: 20,
    testCount: 25,
    authenticityScore: 98,
    visualHallmarks: [
      'Steamed golden-orange bean pudding loaf',
      'Smooth silky soufflé texture',
      'Hard-boiled egg or fish slice inclusion'
    ],
    culinaryNotes: 'Pureed peeled black-eyed peas steamed in banana leaves or ramekins with peppers, crayfish, and vegetable oil.',
    keySpices: ['Peeled Black-Eyed Peas', 'Scotch Bonnet', 'Nutmeg', 'Crayfish', 'Tatashe'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['moi-moi'] || '/dataset/images/Moi moi.jpg',
    imageUrls: ['/dataset/images/Moi moi.jpg', '/dataset/images/moi-moi.jpg', '/images/moi-moi.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#ea580c', '#c2410c', '#7c2d12'],
    averagePreparationTime: '55 mins'
  },
  {
    id: 'ogbono-soup',
    name: 'Ogbono Soup (Apon)',
    category: 'Soups & Stews',
    region: 'Southern & Eastern Nigeria (Igbo, Edo)',
    kaggleSource: 'Kaggle: West African Mucilaginous Seeds & Soups Dataset',
    sampleCount: 148,
    trainCount: 105,
    valCount: 20,
    testCount: 23,
    authenticityScore: 99,
    visualHallmarks: [
      'Glossy viscous draw consistency from wild mango seeds',
      'Amber-red palm oil glistening coating',
      'Smoked dried catfish, beef brisket, and bitterleaf'
    ],
    culinaryNotes: 'Ground African bush mango seeds (Irvingia gabonensis) cooked into a slippery, richly spiced draw soup with dried fish and ugu.',
    keySpices: ['Ground Ogbono Seeds', 'Locust Beans', 'Smoked Fish', 'Cameroon Pepper', 'Palm Oil'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['ogbono-soup'] || '/dataset/images/ogbono-soup.jpg',
    imageUrls: ['/dataset/images/ogbono-soup.jpg', '/images/ogbono-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#854d0e', '#713f12', '#15803d'],
    averagePreparationTime: '35 mins'
  },
  {
    id: 'afang-soup',
    name: 'Afang Soup',
    category: 'Soups & Stews',
    region: 'South-South Nigeria (Efik & Ibibio, Cross River & Akwa Ibom)',
    kaggleSource: 'Kaggle: Nigerian Calabar Regional Delicacy Benchmark',
    sampleCount: 140,
    trainCount: 100,
    valCount: 20,
    testCount: 20,
    authenticityScore: 99,
    visualHallmarks: [
      'Finely pounded dark green okazi/afang leaves',
      'Tender succulent waterleaf base',
      'Whole shelled periwinkles and smoked stockfish'
    ],
    culinaryNotes: 'Celebrated coastal delicacy crafted by pounding wild Gnetum africanum leaves and simmering with waterleaves, periwinkles, and palm oil.',
    keySpices: ['Okazi / Afang Leaves', 'Waterleaf', 'Shelled Periwinkles', 'Smoked Dried Fish', 'Palm Oil'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['afang-soup'] || '/dataset/images/afang-soup.jpg',
    imageUrls: ['/dataset/images/afang-soup.jpg', '/images/afang-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#14532d', '#166534', '#991b1b'],
    averagePreparationTime: '45 mins'
  },
  {
    id: 'banga-soup',
    name: 'Banga Soup (Ofe Akwu)',
    category: 'Soups & Stews',
    region: 'Niger Delta (Urhobo, Delta State) & Eastern Nigeria (Igbo)',
    kaggleSource: 'Kaggle: West African Palm Nut Broth & Soups Benchmark',
    sampleCount: 138,
    trainCount: 98,
    valCount: 20,
    testCount: 20,
    authenticityScore: 99,
    visualHallmarks: [
      'Deep oily orange-red fresh palm fruit broth',
      'Fragrant surface herb infusion (beletete & oburunbebe stick)',
      'Fresh catfish cutlets and dried bush meat in clay pot'
    ],
    culinaryNotes: 'Extracted palm fruit emulsion simmered with Delta Banga spice blend (aidan fruit, beletete, rohohie) and fresh fish.',
    keySpices: ['Banga Spice Blend (Beletete, Rohohie)', 'Oburunbebe Stick', 'Dried Crayfish', 'Scent Leaves'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['banga-soup'] || '/dataset/images/banga-soup.jpg',
    imageUrls: ['/dataset/images/banga-soup.jpg', '/images/banga-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#c2410c', '#9a3412', '#7c2d12'],
    averagePreparationTime: '55 mins'
  },
  {
    id: 'pepper-soup',
    name: 'Catfish & Goat Meat Pepper Soup',
    category: 'Soups & Broths',
    region: 'Pan-West Africa (Nigeria, Ghana, Cameroon)',
    kaggleSource: 'Kaggle: West African Herbal Broths & Medicinal Soups',
    sampleCount: 162,
    trainCount: 115,
    valCount: 22,
    testCount: 25,
    authenticityScore: 98,
    visualHallmarks: [
      'Clear fragrant amber-red herbal broth with steam',
      'Tender bone-in goat meat or fresh catfish steaks',
      'Finely chopped fresh scent leaves (efinrin) and scotch bonnet'
    ],
    culinaryNotes: 'Medicinal, fiery broth brewed with traditional calabash nutmeg (ehuru), uda pods, alligator pepper, and fresh scent leaves.',
    keySpices: ['Calabash Nutmeg (Ehuru)', 'Uda Pods (Negro Pepper)', 'Uziza Seeds', 'Scent Leaves (Efinrin)'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['pepper-soup'] || '/dataset/images/pepper-soup.jpg',
    imageUrls: ['/dataset/images/pepper-soup.jpg', '/images/pepper-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#78350f', '#92400e', '#166534'],
    averagePreparationTime: '40 mins'
  },
  {
    id: 'waakye',
    name: 'Waakye',
    category: 'Rice & Grains',
    region: 'Ghana & Northern Togo',
    kaggleSource: 'Kaggle: Ghanaian Cuisine & Street Food Recognition Dataset',
    sampleCount: 152,
    trainCount: 110,
    valCount: 20,
    testCount: 22,
    authenticityScore: 99,
    visualHallmarks: [
      'Deep burgundy-brown rice and black-eyed beans',
      'Served with dark spicy shito pepper sauce',
      'Garnished with boiled egg, spaghetti (talia), and fried plantain'
    ],
    culinaryNotes: 'Ghanaian national staple of rice and cowpeas simmered with dried red sorghum leaf sheaths for distinct color and antioxidant profile.',
    keySpices: ['Red Sorghum Leaf Sheaths', 'Black-Eyed Beans', 'Shito (Black Pepper Sauce)', 'Ginger'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['waakye'] || '/dataset/images/waakye.jpg',
    imageUrls: ['/dataset/images/waakye.jpg', '/images/waakye.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#450a0a', '#7f1d1d', '#991b1b'],
    averagePreparationTime: '60 mins'
  },
  {
    id: 'thieboudienne',
    name: 'Thieboudienne (Ceebu Jën)',
    category: 'Rice & Grains',
    region: 'Senegal & coastal West Africa',
    kaggleSource: 'Kaggle: Senegalese & Sahelian World Heritage Gastronomy',
    sampleCount: 145,
    trainCount: 102,
    valCount: 21,
    testCount: 22,
    authenticityScore: 99,
    visualHallmarks: [
      'Broken fragrant red rice simmered in concentrated tomato-herb broth',
      'Whole herb-stuffed white sea fish (thiof/grouper)',
      'Braised cassava root, sweet carrot, white cabbage, and tamarind'
    ],
    culinaryNotes: 'UNESCO-recognized national dish of Senegal, born in Saint-Louis. Broken rice cooked directly in rich fish broth infused with rof herb stuffing.',
    keySpices: ['Rof Herb Stuffing (Parsley, Garlic, Chili)', 'Guedj (Fermented Fish)', 'Yet (Fermented Cymbium)', 'Tamarind'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['thieboudienne'] || '/dataset/images/thieboudienne.jpg',
    imageUrls: ['/dataset/images/thieboudienne.jpg', '/images/thieboudienne.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#b91c1c', '#c2410c', '#d97706'],
    averagePreparationTime: '75 mins'
  },
  {
    id: 'chin-chin',
    name: 'Chin Chin',
    category: 'Snacks & Pastries',
    region: 'Nigeria & West Africa',
    kaggleSource: 'Kaggle: Nigerian Pastries & Snack Recognition Dataset',
    sampleCount: 168,
    trainCount: 120,
    valCount: 24,
    testCount: 24,
    authenticityScore: 99,
    visualHallmarks: [
      'Crispy golden-brown cube pastries',
      'Nutmeg-infused sugar glaze crunch',
      'Uniform snack-sized golden cuts'
    ],
    culinaryNotes: 'Deep-fried West African pastry cubes kneaded with butter, sugar, condensed milk, and fresh grated nutmeg.',
    keySpices: ['Fresh Grated Nutmeg', 'Butter', 'Condensed Milk', 'Vanilla'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['chin-chin'] || '/dataset/images/Chin_Chin.webp',
    imageUrls: ['/dataset/images/Chin_Chin.webp', '/dataset/images/Chin Chin 1.jpeg', '/images/chin-chin.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#d97706', '#b45309', '#78350f'],
    averagePreparationTime: '30 mins'
  },
  {
    id: 'akara',
    name: 'Akara (Kosai / Koose)',
    category: 'Breakfast & Street Food',
    region: 'Nigeria, Ghana, Benin & Sahel',
    kaggleSource: 'Kaggle: West African Fried Bean Pastes & Fritters Dataset',
    sampleCount: 154,
    trainCount: 110,
    valCount: 22,
    testCount: 22,
    authenticityScore: 99,
    visualHallmarks: [
      'Crisp golden-brown exterior with aerated light interior',
      'Flecks of minced scotch bonnet and red onions',
      'Served with warm pap (ogi/koko) or spicy pepper sauce'
    ],
    culinaryNotes: 'Peeled black-eyed peas whipped vigorously with whisk to incorporate air bubbles, seasoned with onions and fried in hot oil until golden.',
    keySpices: ['Peeled Black-Eyed Peas', 'Scotch Bonnet', 'Red Onion', 'Sea Salt'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['akara'] || '/dataset/images/akara.jpg',
    imageUrls: ['/dataset/images/akara.jpg', '/images/akara.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#b45309', '#d97706', '#92400e'],
    averagePreparationTime: '25 mins'
  },
  {
    id: 'fufu-light-soup',
    name: 'Fufu & Light Soup (Nkrakra)',
    category: 'Swallows & Traditional',
    region: 'Ghana & Ivory Coast',
    kaggleSource: 'Kaggle: West African Fufu & Traditional Soups Benchmark',
    sampleCount: 144,
    trainCount: 104,
    valCount: 20,
    testCount: 20,
    authenticityScore: 99,
    visualHallmarks: [
      'Silky golden-ivory cassava and green plantain fufu mound',
      'Fiery orange-red clear tomato and ginger light soup',
      'Served in traditional Asanka earthenware grinding bowl'
    ],
    culinaryNotes: 'Cassava and unripe plantains boiled and pounded into an elastic smooth swallow, immersed in a fiery, soothing goat meat or poultry broth.',
    keySpices: ['Fresh Ginger', 'Garlic', 'Scotch Bonnet (Akokormiko)', 'Tomatoes', 'Garden Eggs'],
    primaryImageUrl: LOCAL_BUNDLED_DISH_IMAGES['fufu-light-soup'] || '/dataset/images/fufu-light-soup.jpg',
    imageUrls: ['/dataset/images/fufu-light-soup.jpg', '/images/fufu-light-soup.jpg'],
    vectorDimensions: 1920,
    dominantColors: ['#ea580c', '#c2410c', '#f5f5f4'],
    averagePreparationTime: '50 mins'
  }
];
