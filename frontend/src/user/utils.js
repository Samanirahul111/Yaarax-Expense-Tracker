export const getCategoryIcon = (name) => {
  const map = {
    'Hotels, Motels, Resorts': '🏨',
    'To People': '👨🏽',
    'Food, Beverages and Groceries': '🛒',
    'Utility & Bills': '📝',
    'Fuel': '⛽',
    'Durables and Home Goods': '📦',
    'Repair and Services': '⚒️',
    'Clothing and Apparel': '👕',
    'Others': '🏷️'
  };
  return map[name] || '🏷️';
};

export const getCategoryColor = (name, index) => {
  const colors = ['#F87171', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA', '#F472B6', '#38BDF8'];
  const map = {
    'Fuel': '#F87171',
    'Food, Beverages and Groceries': '#34D399',
    'To People': '#60A5FA',
    'Utility & Bills': '#FBBF24'
  };
  return map[name] || colors[index % colors.length];
};
