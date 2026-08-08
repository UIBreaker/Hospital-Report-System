// Global Lorem Ipsum generator on Enter key
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'in',
  'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const STANDARD_PARAGRAPH = 
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const STANDARD_SHORT = 
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

function generateLorem(wordCount, isTextarea) {
  if (!wordCount) {
    return isTextarea ? STANDARD_PARAGRAPH : STANDARD_SHORT;
  }
  const count = parseInt(wordCount, 10);
  if (isNaN(count) || count <= 0) return STANDARD_SHORT;
  
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  }
  // Capitalize first letter
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
  
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function initLoremShortcuts() {
  if (typeof window === 'undefined') return;

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    
    const target = e.target;
    if (!target) return;
    
    const isInput = target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || !target.type);
    const isTextarea = target.tagName === 'TEXTAREA';
    
    if (!isInput && !isTextarea) return;

    const val = target.value || '';
    const cursor = target.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursor);
    
    // Match 'lorem' or 'lorem20' (case-insensitive) right before cursor
    const match = textBeforeCursor.match(/(\b|[\s_])lorem(\d*)$/i);
    
    if (match) {
      e.preventDefault(); // Stop normal Enter submission
      e.stopPropagation();

      const matchedString = match[0];
      const matchIndex = textBeforeCursor.lastIndexOf(matchedString);
      const wordCount = match[2]; // e.g. "lorem10" -> "10"
      
      const dummyText = generateLorem(wordCount, isTextarea);
      
      // Replace 'lorem' with dummy text
      const newVal = val.slice(0, matchIndex + (matchedString.startsWith(' ') ? 1 : 0)) + dummyText + val.slice(cursor);
      
      setNativeValue(target, newVal);
      
      // Move cursor to end of inserted lorem text
      const newCursorPos = matchIndex + (matchedString.startsWith(' ') ? 1 : 0) + dummyText.length;
      setTimeout(() => {
        try {
          target.setSelectionRange(newCursorPos, newCursorPos);
        } catch (err) {}
      }, 0);
    }
  }, true); // Use capture phase so it runs before form submit handlers
}
