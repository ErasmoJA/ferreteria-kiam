// Mapeo de categorías con íconos
export const getCategoryIcon = (categoryName) => {
  const icons = {
    'herramientas': '🔨',
    'tornilleria': '🔩',
    'pinturas': '🎨',
    'plomeria': '🚿',
    'electricos': '⚡',
    'construccion': '🏗️'
  };
  return icons[categoryName] || '📦';
};

// Mapeo de nombres de categorías para mostrar
export const getCategoryDisplayName = (categoryName) => {
  const names = {
    'herramientas': 'Herramientas',
    'tornilleria': 'Tornillería',
    'pinturas': 'Pinturas',
    'plomeria': 'Plomería',
    'electricos': 'Eléctricos',
    'construccion': 'Construcción'
  };
  return names[categoryName] || categoryName;
};

// Obtener todas las categorías disponibles
export const getAvailableCategories = () => {
  return [
    { id: 'herramientas', name: 'Herramientas', icon: '🔨' },
    { id: 'tornilleria', name: 'Tornillería', icon: '🔩' },
    { id: 'pinturas', name: 'Pinturas', icon: '🎨' },
    { id: 'plomeria', name: 'Plomería', icon: '🚿' },
    { id: 'electricos', name: 'Eléctricos', icon: '⚡' },
    { id: 'construccion', name: 'Construcción', icon: '🏗️' }
  ];
};

// Validar si una categoría existe
export const isValidCategory = (categoryName) => {
  const validCategories = ['herramientas', 'tornilleria', 'pinturas', 'plomeria', 'electricos', 'construccion'];
  return validCategories.includes(categoryName);
};