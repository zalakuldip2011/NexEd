# Theme Integration Guide for NexEd

This guide ensures that any new pages or components you add will automatically work with the light/dark mode system.

## 🎯 Quick Start for New Components

### 1. Import the Theme Hook
```jsx
import { useTheme } from '../context/ThemeContext';
import { themeClasses, themeTransitions } from '../styles/theme';
```

### 2. Basic Component Pattern
```jsx
const YourNewComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${themeClasses.pageContainer(isDarkMode)} ${themeTransitions}`}>
      <h1 className={themeClasses.heading(isDarkMode)}>Your Title</h1>
      <p className={themeClasses.bodyText(isDarkMode)}>Your content</p>
    </div>
  );
};
```

## 🛠️ Pre-built Theme Classes

### Page Layout
```jsx
// Page container
className={themeClasses.pageContainer(isDarkMode)}

// Card container
className={themeClasses.card(isDarkMode)}

// Modal/Dialog
className={themeClasses.modal(isDarkMode)}
```

### Typography
```jsx
// Main headings
className={themeClasses.heading(isDarkMode)}

// Subheadings
className={themeClasses.subheading(isDarkMode)}

// Body text
className={themeClasses.bodyText(isDarkMode)}
```

### Interactive Elements
```jsx
// Primary buttons
className={themeClasses.primaryButton(isDarkMode)}

// Secondary buttons
className={themeClasses.secondaryButton(isDarkMode)}

// Navigation links
className={themeClasses.navLink(isDarkMode)}

// Form inputs
className={themeClasses.input(isDarkMode)}
```

## 🎨 Custom Theme-Aware Styling

### Method 1: Using Theme Classes Helper
```jsx
import { getThemeClasses } from '../styles/theme';

const customClass = getThemeClasses(
  isDarkMode,
  'bg-blue-50 text-blue-900',     // Light mode
  'bg-slate-800 text-blue-400'    // Dark mode
);
```

### Method 2: Conditional Classes
```jsx
className={`base-classes ${
  isDarkMode 
    ? 'dark-mode-classes' 
    : 'light-mode-classes'
} ${themeTransitions}`}
```

### Method 3: Template Literals
```jsx
className={`
  p-4 rounded-lg border ${themeTransitions}
  ${isDarkMode 
    ? 'bg-slate-800 border-slate-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900'
  }
`}
```

## 📋 Component Checklist

When creating new components, ensure:

- [ ] Import `useTheme` hook
- [ ] Add theme-aware background colors
- [ ] Add theme-aware text colors
- [ ] Add theme-aware border colors
- [ ] Add theme-aware hover states
- [ ] Add theme-aware focus states (for interactive elements)
- [ ] Include `themeTransitions` for smooth animation
- [ ] Test both light and dark modes

## 🔧 Common Patterns

### Form Components
```jsx
const FormComponent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <form className={`${themeClasses.card(isDarkMode)} p-6 ${themeTransitions}`}>
      <input 
        type="text"
        className={`${themeClasses.input(isDarkMode)} w-full p-3 rounded-lg ${themeTransitions}`}
        placeholder="Enter text..."
      />
      <button className={`${themeClasses.primaryButton(isDarkMode)} px-4 py-2 rounded-lg ${themeTransitions}`}>
        Submit
      </button>
    </form>
  );
};
```

### List Components
```jsx
const ListComponent = ({ items }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${themeClasses.card(isDarkMode)} ${themeTransitions}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          className={`p-4 border-b ${
            isDarkMode ? 'border-slate-700' : 'border-gray-200'
          } ${themeTransitions}`}
        >
          <h3 className={themeClasses.subheading(isDarkMode)}>{item.title}</h3>
          <p className={themeClasses.bodyText(isDarkMode)}>{item.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### Dashboard/Layout Components
```jsx
const DashboardLayout = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${themeClasses.pageContainer(isDarkMode)} ${themeTransitions}`}>
      {/* Header */}
      <header className={`${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
      } border-b ${themeTransitions}`}>
        {/* Header content */}
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
```

## 🎯 Best Practices

1. **Always add transitions**: Include `themeTransitions` for smooth theme switching
2. **Use semantic color classes**: Use the pre-built theme classes when possible
3. **Test both modes**: Always check your component in both light and dark themes
4. **Maintain contrast**: Ensure good contrast ratios for accessibility
5. **Be consistent**: Use the same color patterns across similar components

## 🚀 Auto-Import Setup (Optional)

Add this to your VS Code settings for auto-imports:
```json
{
  "typescript.suggest.autoImports": true,
  "javascript.suggest.autoImports": true
}
```

## 📱 Responsive + Theme Example
```jsx
const ResponsiveCard = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`
      ${themeClasses.card(isDarkMode)}
      p-4 md:p-6 lg:p-8
      w-full max-w-md mx-auto
      ${themeTransitions}
    `}>
      <h2 className={`
        ${themeClasses.heading(isDarkMode)}
        text-lg md:text-xl lg:text-2xl
        mb-4
      `}>
        Responsive Card
      </h2>
      <p className={themeClasses.bodyText(isDarkMode)}>
        This card adapts to both screen size and theme!
      </p>
    </div>
  );
};
```

With this system, any new component you create will automatically support both light and dark themes with minimal effort!