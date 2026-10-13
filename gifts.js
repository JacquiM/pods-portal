// The gift registry. To add a gift, copy one block and change its details.
//
// id     its own short code (lowercase letters, numbers and dashes). Never change it afterwards:
//        it is how the site remembers which gifts have been taken.
// group  the heading it appears under.
// many   true for things more than one guest can bring (nappies, wipes). These never disappear.
//        Leave it out for one-off gifts, which hide once a guest marks them.
// img    a photo in the images folder. Without one, give an icon instead:
//        heart, star, cloud, moon or rainbow.
// price, shop and url are optional; leave them out when any brand will do.
window.GIFTS = [
  // ---- From Momcozy ----
  {
    id: 'nasal-aspirator', group: 'From Momcozy',
    name: 'Baby Nasal Aspirator',
    blurb: 'Gentle electric suction with three levels, for stuffy little noses.',
    price: 'R699', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/nasal-aspirator-1?variant=54064705372435',
    img: 'images/aspirator.jpg'
  },
  {
    id: 'nail-file', group: 'From Momcozy',
    name: 'Electric Baby Nail File',
    blurb: 'Quiet, with soft lights, so tiny nails can be trimmed while she sleeps.',
    price: 'R499', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/eelcteic-baby-nail-file?variant=54064704651539',
    img: 'images/nailfile.jpg'
  },
  {
    id: 'bottle-brush-kit', group: 'From Momcozy',
    name: 'Foam Bottle Brush Cleaning Kit',
    blurb: 'Push-press silicone brush that foams as it cleans bottles.',
    price: 'R449.90', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/push-press-foam-bottle-brush-cleaning-kit?variant=54638791033107',
    img: 'images/brush.jpg'
  },
  {
    id: 'sound-machine', group: 'From Momcozy',
    name: 'Smart Baby Sound Machine',
    blurb: 'Soothing sounds and a soft night light for settling her to sleep.',
    price: 'R899.90', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/smart-baby-sound-machine-app-remote-control',
    img: 'images/sound-machine.jpg'
  },
  {
    id: 'wipe-warmer', group: 'From Momcozy',
    name: 'Baby Wipe Warmer and Dispenser',
    blurb: 'Warm wipes for those middle-of-the-night nappy changes.',
    price: 'R599', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/baby-wipw-warmer',
    img: 'images/wipe-warmer.jpg'
  },
  {
    id: 'bottle-warmer', group: 'From Momcozy',
    name: 'Portable Bottle Warmer',
    blurb: 'Warms a bottle anywhere, for feeds when we are out and about.',
    price: 'R1,999', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/portable-bottle-warmer',
    img: 'images/bottle-warmer.jpg'
  },
  {
    id: 'sterilizer', group: 'From Momcozy',
    name: 'Compact Bottle Sterilizer and Dryer',
    blurb: 'Sterilises and dries bottles and pump parts in one go.',
    price: 'R1,499', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/compact-bottle-sterilizer-dryer',
    img: 'images/sterilizer.jpg'
  },
  {
    id: 'storage-bags', group: 'From Momcozy', many: true,
    name: 'Breastmilk Storage Bags',
    blurb: 'A pack of 50 freezer bags. We will get through plenty.',
    price: 'R179', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/milk-storage-bags-50',
    img: 'images/storage-bags.jpg'
  },
  {
    id: 'momcozy-gift-card', group: 'From Momcozy', many: true,
    name: 'Momcozy Gift Card',
    blurb: 'Not sure what to choose? A gift card lets us pick what we still need.',
    price: 'Any amount', shop: 'Momcozy',
    url: 'https://www.momcozyza.co.za/products/momcozy-gift-card',
    img: 'images/gift-card.jpg'
  },

  // ---- From Baby Brezza ----
  {
    id: 'brezza-formula-pro', group: 'From Baby Brezza',
    name: 'Formula Pro Advanced',
    blurb: 'Mixes a warm formula bottle at the push of a button. Comes in white or black.',
    price: 'R4,999', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/formula-pro-advanced',
    img: 'images/brezza-formula-pro.jpg'
  },
  {
    id: 'brezza-instant-warmer', group: 'From Baby Brezza',
    name: 'Instant Warmer',
    blurb: 'Keeps water at the right temperature, ready for a bottle day or night.',
    price: 'R1,299', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/instant-warmer',
    img: 'images/brezza-instant-warmer.jpg'
  },
  {
    id: 'brezza-bottle-warmer', group: 'From Baby Brezza',
    name: 'Bottle and Breastmilk Warmer',
    blurb: 'Warms breastmilk and formula safely and evenly.',
    price: 'R1,699', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/breastmilk-bottle-warmer',
    img: 'images/brezza-bottle-warmer.jpg'
  },
  {
    id: 'brezza-sterilizer', group: 'From Baby Brezza',
    name: 'Sterilizer Dryer Advanced',
    blurb: 'Sterilises, dries and stores bottles, ready for the next feed.',
    price: 'R2,499', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/steriliser-dryer-advanced',
    img: 'images/brezza-sterilizer.jpg'
  },
  {
    id: 'brezza-bottle-washer', group: 'From Baby Brezza',
    name: 'Bottle Washer Pro',
    blurb: 'Washes, sterilises and dries bottles in one machine.',
    price: 'R5,999', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/bottle-washer-pro%C2%AE',
    img: 'images/brezza-bottle-washer.jpg'
  },
  {
    id: 'brezza-gift-card', group: 'From Baby Brezza', many: true,
    name: 'Baby Brezza Gift Card',
    blurb: 'From R500 to R5,000, to go towards one of the bigger items.',
    price: 'From R500', shop: 'Baby Brezza',
    url: 'https://www.babybrezza.co.za/products/baby-brezza-south-africa-gift-card',
    img: 'images/brezza-gift-card.jpg'
  },

  // ---- Bigger things (one of each) ----
  { id: 'thermometer', group: 'Bigger things', icon: 'star', name: 'Digital Thermometer', blurb: 'A no-touch or ear thermometer for quick checks. Any brand.' },
  { id: 'baby-monitor', group: 'Bigger things', icon: 'moon', name: 'Baby Monitor', blurb: 'So we can keep an eye and an ear on her while she naps. Any brand.' },
  { id: 'baby-bath', group: 'Bigger things', icon: 'cloud', name: 'Baby Bath and Bath Support', blurb: 'A small tub or a newborn bath seat for bath time.' },
  { id: 'changing-mat', group: 'Bigger things', icon: 'heart', name: 'Changing Mat', blurb: 'A wipe-clean mat for nappy changes at home.' },
  { id: 'nappy-bag', group: 'Bigger things', icon: 'rainbow', name: 'Nappy Bag', blurb: 'A roomy bag or backpack for outings, with plenty of pockets.' },
  { id: 'baby-carrier', group: 'Bigger things', icon: 'heart', name: 'Baby Carrier or Wrap', blurb: 'For keeping her close with both hands free.' },
  { id: 'play-gym', group: 'Bigger things', icon: 'star', name: 'Play Gym', blurb: 'A soft activity mat for tummy time and play.' },
  { id: 'hooded-towels', group: 'Bigger things', icon: 'cloud', name: 'Hooded Towels', blurb: 'A set of soft hooded towels to wrap her up after her bath.' },
  { id: 'cot-linen', group: 'Bigger things', icon: 'moon', name: 'Cot Sheets', blurb: 'Fitted cot sheets and a waterproof mattress protector.' },

  // ---- Always welcome (as many as you like) ----
  { id: 'nappies', group: 'Always welcome', many: true, icon: 'cloud', name: 'Nappies', blurb: 'Any size from newborn up. She will grow into them all.' },
  { id: 'wipes', group: 'Always welcome', many: true, icon: 'heart', name: 'Baby Wipes', blurb: 'Fragrance-free or water wipes, by the box.' },
  { id: 'bum-cream', group: 'Always welcome', many: true, icon: 'star', name: "Johnson's Baby Toiletries", blurb: "Johnson's baby wash, shampoo, lotion and bum cream." },
  { id: 'clothes', group: 'Always welcome', many: true, icon: 'rainbow', name: 'Babygrows and Vests', blurb: 'Everyday basics. If your invite gives an age range, that is the size to shop for.' },
  { id: 'muslins', group: 'Always welcome', many: true, icon: 'cloud', name: 'Muslins and Burp Cloths', blurb: 'You can never have too many.' },
  { id: 'blankets', group: 'Always welcome', many: true, icon: 'moon', name: 'Receiving Blankets and Swaddles', blurb: 'Soft cotton blankets for swaddling and cuddles.' },
  { id: 'bibs', group: 'Always welcome', many: true, icon: 'star', name: 'Bibs', blurb: 'Soft dribble bibs now, feeding bibs for later.' },
  { id: 'books', group: 'Always welcome', many: true, icon: 'rainbow', name: 'Storybooks', blurb: 'A favourite from your own childhood, to start her first library.' },
  { id: 'for-mom', group: 'Always welcome', many: true, icon: 'heart', name: 'Something for Mom', blurb: 'Breast pads, nipple cream, or a little treat for the early weeks.' }
];
