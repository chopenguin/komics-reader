/* ============================================================
   作品資料檔
   新增作品：複製一個物件、改資料、把圖片放進同名資料夾即可。
   ============================================================ */

const SITE = {
  name: '小漫畫書房',
  subtitle: '收藏那些值得一再翻開的小漫畫',
  author: '書房管理員',
};

/* 作品分類：只有「有作品的分類」才會顯示在書架上。 */
const CATEGORIES = [
  { id: 'keion',    name: 'K-ON! 輕音部', icon: '🎸' },
  { id: 'daily',    name: '日常小品',     icon: '☀️' },
  { id: 'original', name: '原創短篇',     icon: '✍️' },
  { id: 'other',    name: '其他',         icon: '📚' },
];

const WORKS = [
  {
    id: 'kirakira-days',
    title: '閃亮亮 Days！',
    originalTitle: 'キラキラDays！',
    author: 'まっさん',
    category: 'keion',
    tags: ['K-ON!', '校園', '日常'],
    description: '輕音部成員們閃閃發光的日常。作者まっさん發表於 X 的短篇漫畫，五頁完整收錄。',
    date: '2026-11-23',
    source: 'https://x.com/mamamassan0901/status/2124817996036378808',
    pages: [
      'keion_kirakira_days/01.jpg',
      'keion_kirakira_days/02.jpg',
      'keion_kirakira_days/03.jpg',
      'keion_kirakira_days/04.jpg',
      'keion_kirakira_days/05.jpg',
    ],
  },
];
