// src/utils/productImages.js

const CATEGORY_IMAGES = {
  'Electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
  ],
  'Clothing': [
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4f52?w=400&h=300&fit=crop',
  ],
  'Home & Garden': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&h=300&fit=crop',
  ],
  'Food & Beverage': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop',
  ],
  'Health & Beauty': [
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583241475880-083f84372725?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=400&h=300&fit=crop',
  ],
  'Fruits': [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1564750497011-ead0ce4b9448?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
  ],
  'Default': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
  ],
};

export function getProductImage(category, productId, product) {
  if (product && product.imageUrl) {
    return product.imageUrl;
  }
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Default'];
  const index = (productId || 0) % images.length;
  return images[index];
}

export function getFallbackLabel(category) {
  const labels = {
    'Electronics':     'Electronics',
    'Clothing':        'Clothing',
    'Home & Garden':   'Home & Garden',
    'Food & Beverage': 'Food & Beverage',
    'Health & Beauty': 'Health & Beauty',
    'Fruits':          'Fruits',
    'Default':         'Product',
  };
  return labels[category] || labels['Default'];
}
