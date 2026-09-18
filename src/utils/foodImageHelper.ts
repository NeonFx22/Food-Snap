/**
 * Food Image Resolver & Photographic Library
 * Provides verified high-resolution food photography for worldwide dishes,
 * regional cuisines, and authentic foundational dataset images.
 */

import { aiImageVerifier } from '../services/aiImageVerifierService';

import jollofImg from '../assets/images/jollof_rice_photo_1786969421486.jpg';
import egusiImg from '../assets/images/egusi_soup_photo_1786969435060.jpg';
import suyaImg from '../assets/images/suya_skewers_photo_1786969448824.jpg';
import efoImg from '../assets/images/efo_riro_photo_1786969461222.jpg';
import moiImg from '../assets/images/moi_moi_photo_1786969474655.jpg';
import chinImg from '../assets/images/chin_chin_photo_1786969483837.jpg';
import yamImg from '../assets/images/pounded_yam_photo_1786969496819.jpg';
import amalaImg from '../assets/images/amala_dish_photo_1786969511303.jpg';
import ogbonoImg from '../assets/images/ogbono_soup_1789710460803.jpg';
import afangImg from '../assets/images/afang_soup_1789710473735.jpg';
import bangaImg from '../assets/images/banga_soup_1789710484614.jpg';
import pepperSoupImg from '../assets/images/pepper_soup_1789710497135.jpg';
import waakyeImg from '../assets/images/waakye_dish_1789710511588.jpg';
import thiebouImg from '../assets/images/thieboudienne_dish_1789710524880.jpg';
import akaraImg from '../assets/images/akara_fritters_1789710541023.jpg';
import fufuImg from '../assets/images/fufu_light_soup_1789710554157.jpg';

export const LOCAL_BUNDLED_DISH_IMAGES: Record<string, string> = {
  jollof: jollofImg,
  'jollof-rice': jollofImg,
  'jollof rice': jollofImg,
  egusi: egusiImg,
  'egusi-soup': egusiImg,
  'egusi soup': egusiImg,
  suya: suyaImg,
  'beef-suya': suyaImg,
  'beef suya': suyaImg,
  efo: efoImg,
  'efo-riro': efoImg,
  'efo riro': efoImg,
  moi: moiImg,
  'moi-moi': moiImg,
  'moi moi': moiImg,
  'moin-moin': moiImg,
  'moin moin': moiImg,
  chin: chinImg,
  'chin-chin': chinImg,
  'chin chin': chinImg,
  yam: yamImg,
  pounded: yamImg,
  'pounded-yam': yamImg,
  'pounded yam': yamImg,
  amala: amalaImg,
  'amala and ewedu': amalaImg,
  'amala-ewedu': amalaImg,
  ogbono: ogbonoImg,
  'ogbono-soup': ogbonoImg,
  'ogbono soup': ogbonoImg,
  afang: afangImg,
  'afang-soup': afangImg,
  'afang soup': afangImg,
  banga: bangaImg,
  'banga-soup': bangaImg,
  'banga soup': bangaImg,
  pepper: pepperSoupImg,
  'pepper-soup': pepperSoupImg,
  'pepper soup': pepperSoupImg,
  waakye: waakyeImg,
  thieboudienne: thiebouImg,
  'ceebu-jen': thiebouImg,
  akara: akaraImg,
  kosai: akaraImg,
  fufu: fufuImg,
  'fufu-light-soup': fufuImg,
  'fufu and light soup': fufuImg,
};

// Comprehensive dictionary mapping dish names and culinary keywords to authentic food photography
export const AUTHENTIC_DISH_IMAGES: Record<string, string> = {
  // Primary Foundational Project Dataset Images (Bundled Asset Imports)
  'jollof rice': jollofImg,
  'jollof': jollofImg,
  'party jollof rice': jollofImg,
  'egusi soup': egusiImg,
  'egusi': egusiImg,
  'suya': suyaImg,
  'beef suya': suyaImg,
  'suya skewers': suyaImg,
  'efo riro': efoImg,
  'efo': efoImg,
  'moin moin': moiImg,
  'moi moi': moiImg,
  'chin chin': chinImg,
  'pounded yam': yamImg,
  'pounded yam & egusi': yamImg,
  'pounded yam and egusi': yamImg,
  'amala': amalaImg,
  'amala and ewedu': amalaImg,
  'amala with ewedu': amalaImg,
  'amala dish': amalaImg,
  'ogbono soup': ogbonoImg,
  'ogbono': ogbonoImg,
  'apon': ogbonoImg,
  'afang soup': afangImg,
  'afang': afangImg,
  'banga soup': bangaImg,
  'banga': bangaImg,
  'ofe akwu': bangaImg,
  'pepper soup': pepperSoupImg,
  'goat meat pepper soup': pepperSoupImg,
  'catfish pepper soup': pepperSoupImg,
  'waakye': waakyeImg,
  'thieboudienne': thiebouImg,
  'ceebu jen': thiebouImg,
  'akara': akaraImg,
  'kosai': akaraImg,
  'fufu and light soup': fufuImg,
  'fufu': fufuImg,
  'doro wat': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
  'tagine': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
  'moroccan tagine': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
  'shakshuka': 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80',
  'bobotie': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'injera': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
  'eba': yamImg,
  'plantain': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'fried plantain': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'dodo': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'couscous': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',

  // Asian & Oriental Gastronomy
  'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'tonkotsu ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  'murgh makhani': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'hyderabadi biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  'vietnamese pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  'sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'dim sum': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'dumplings': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  'gyoza': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  'bao': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'bibimbap': 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80',
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'nasi goreng': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'katsu curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'japanese curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'kimchi': 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80',
  'curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
  'tikka masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  'naan': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  'tandoori': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  'peking duck': 'https://images.unsplash.com/photo-1514944265431-7b953d6118d2?auto=format&fit=crop&w=800&q=80',

  // European, Italian & Mediterranean
  'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
  'spaghetti': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
  'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80',
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'margherita pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  'paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  'paella valenciana': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
  'risotto': 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
  'moussaka': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
  'ratatouille': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?auto=format&fit=crop&w=800&q=80',
  'goulash': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'borscht': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'falafel': 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&w=800&q=80',
  'hummus': 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80',
  'shawarma': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
  'kebab': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  'crepe': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80',

  // Americas & Street Food
  'birria': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'birria tacos': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'tacos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
  'jerk chicken': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  'jamaican jerk chicken': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  'ceviche': 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
  'feijoada': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'guacamole': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  'steak': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'bbq': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  'soup': egusiImg,
  'seafood': 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  'salmon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'
};

/**
 * Returns a high-definition, verified food photo for any dish name, category, or keyword.
 */
export function getVerifiedFoodImage(dishName: string, category: string = '', fallbackUrl?: string): string {
  const cleanName = dishName.toLowerCase().trim();
  const normalizedKey = cleanName.replace(/[\s_]+/g, '-');

  // 1. Check AI Image Verifier Registry first (respects user mode: original vs ai_verified)
  const registryImage = aiImageVerifier.getActiveImageUrl(normalizedKey);
  if (registryImage && !registryImage.includes('placeholder')) {
    return registryImage;
  }

  // 2. Direct exact match in dictionary
  if (AUTHENTIC_DISH_IMAGES[cleanName]) {
    return AUTHENTIC_DISH_IMAGES[cleanName];
  }

  // 3. Fallback provided by caller
  if (fallbackUrl && (fallbackUrl.startsWith('http') || fallbackUrl.startsWith('/')) && !fallbackUrl.includes('placeholder')) {
    return fallbackUrl;
  }

  // 4. Keyword tokens matching
  for (const [key, url] of Object.entries(AUTHENTIC_DISH_IMAGES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return url;
    }
  }

  const words = cleanName.split(/[\s,/-]+/);
  for (const word of words) {
    if (word.length >= 3 && AUTHENTIC_DISH_IMAGES[word]) {
      return AUTHENTIC_DISH_IMAGES[word];
    }
  }

  // 5. Category matching
  const cleanCategory = category.toLowerCase();
  if (cleanCategory.includes('rice') || cleanCategory.includes('grain')) {
    return AUTHENTIC_DISH_IMAGES['jollof rice'];
  }
  if (cleanCategory.includes('noodle') || cleanCategory.includes('ramen') || cleanCategory.includes('pasta')) {
    return AUTHENTIC_DISH_IMAGES['ramen'];
  }
  if (cleanCategory.includes('soup') || cleanCategory.includes('stew') || cleanCategory.includes('broth')) {
    return AUTHENTIC_DISH_IMAGES['egusi soup'];
  }
  if (cleanCategory.includes('bbq') || cleanCategory.includes('grill') || cleanCategory.includes('meat') || cleanCategory.includes('poultry')) {
    return AUTHENTIC_DISH_IMAGES['grilled chicken'];
  }
  if (cleanCategory.includes('salad') || cleanCategory.includes('healthy') || cleanCategory.includes('vegetable')) {
    return AUTHENTIC_DISH_IMAGES['vegetable salad'];
  }
  if (cleanCategory.includes('taco') || cleanCategory.includes('mexican') || cleanCategory.includes('street')) {
    return AUTHENTIC_DISH_IMAGES['birria tacos'];
  }
  if (cleanCategory.includes('seafood') || cleanCategory.includes('fish')) {
    return AUTHENTIC_DISH_IMAGES['seafood'];
  }

  // Default fallback
  return '/dataset/images/jollof-rice.jpg';
}
