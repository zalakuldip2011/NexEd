# 🎨 NexEd UI Component Library

Beautiful Material UI-inspired component library built with React and Tailwind CSS. Designed for **butter-smooth** animations, professional aesthetics, and seamless dark/light mode support.

---

## 📦 Components

### 1. **Button** (`Button.jsx`)
Professional gradient buttons with ripple effects and loading states.

#### Variants
- `primary` - Blue to purple gradient (default)
- `secondary` - Pink to red gradient
- `success` - Cyan to teal gradient
- `outline` - Transparent with border
- `ghost` - Subtle hover effect
- `gradient` - Animated gradient background
- `text` - No background

#### Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

#### Usage
```jsx
import { Button, IconButton, ButtonGroup } from '@/components/ui';

// Basic button
<Button variant="primary" size="md">
  Click Me
</Button>

// With icon
<Button 
  variant="gradient" 
  icon={<StarIcon />} 
  iconPosition="left"
>
  Featured
</Button>

// Loading state
<Button loading={true}>
  Processing...
</Button>

// Icon button
<IconButton 
  icon={<BellIcon />} 
  variant="ghost"
/>

// Button group
<ButtonGroup>
  <Button>Left</Button>
  <Button>Middle</Button>
  <Button>Right</Button>
</ButtonGroup>
```

---

### 2. **Card** (`Card.jsx`)
Flexible card components with hover effects and multiple variants.

#### Variants
- `elevated` - Shadow with hover effect (default)
- `outlined` - Border with hover effect
- `filled` - Subtle background
- `gradient` - Gradient background

#### Specialized Cards
- `GlassCard` - Backdrop blur glass morphism
- `StatsCard` - Perfect for dashboards with icon and trend
- `CourseCard` - Complete course display with image, rating, price

#### Usage
```jsx
import { Card, CardHeader, CardTitle, CardContent, StatsCard, CourseCard } from '@/components/ui';

// Basic card
<Card variant="elevated" padding="md">
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
</Card>

// Stats card
<StatsCard
  title="Total Students"
  value="1,234"
  icon={<UsersIcon />}
  trend="up"
  trendValue="+12%"
  variant="primary"
/>

// Course card
<CourseCard
  image="/course.jpg"
  title="React Masterclass"
  instructor="John Doe"
  rating={4.8}
  students={5420}
  price={49.99}
  originalPrice={99.99}
  badge="Bestseller"
/>
```

---

### 3. **Input** (`Input.jsx`)
Beautiful form inputs with validation states and icons.

#### Variants
- `outlined` - Border outline (default)
- `filled` - Filled background
- `standard` - Bottom border only

#### Input Types
- `Input` - Text input with icons
- `Textarea` - Multi-line input
- `Select` - Dropdown select
- `SearchInput` - Search with clear button
- `Checkbox` - Styled checkbox
- `Radio` - Styled radio button

#### Usage
```jsx
import { Input, Textarea, Select, SearchInput, Checkbox } from '@/components/ui';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  leftIcon={<MailIcon />}
/>

// With validation
<Input
  label="Password"
  type="password"
  error={true}
  helperText="Password must be 8+ characters"
/>

// Textarea
<Textarea
  label="Description"
  rows={4}
  placeholder="Tell us about yourself..."
/>

// Select
<Select
  label="Category"
  options={[
    { value: 'dev', label: 'Development' },
    { value: 'design', label: 'Design' }
  ]}
/>

// Search
<SearchInput
  placeholder="Search courses..."
  onSearch={(value) => console.log(value)}
/>

// Checkbox
<Checkbox label="Remember me" />
```

---

### 4. **Badge** (`Badge.jsx`)
Status indicators, labels, and chips.

#### Variants
- `primary`, `secondary`, `success`, `error`, `warning`, `info`, `gray`, `gradient`

#### Badge Types
- `Badge` - Basic badge
- `NotificationBadge` - Number counter
- `StatusBadge` - Online/offline indicator
- `AchievementBadge` - Icon badge with gradient
- `Chip` - Material UI chip with avatar/icon

#### Usage
```jsx
import { Badge, NotificationBadge, StatusBadge, Chip } from '@/components/ui';

// Basic badge
<Badge variant="success" size="md">
  Active
</Badge>

// Removable badge
<Badge variant="primary" removable onRemove={() => {}}>
  JavaScript
</Badge>

// Notification badge
<div className="relative">
  <BellIcon />
  <NotificationBadge count={5} />
</div>

// Status badge
<StatusBadge status="online" label="Online" />

// Chip
<Chip
  label="React"
  variant="filled"
  color="primary"
  deletable
  onDelete={() => {}}
/>
```

---

### 5. **Modal** (`Modal.jsx`)
Beautiful modals and drawers with backdrop blur.

#### Modal Types
- `Modal` - Center modal
- `ConfirmModal` - Confirmation dialog
- `Drawer` - Slide-in panel

#### Sizes
- `sm`, `md`, `lg`, `xl`, `full`

#### Usage
```jsx
import { Modal, ConfirmModal, Drawer } from '@/components/ui';

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Welcome"
  size="md"
  footer={
    <>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Modal content here</p>
</Modal>

// Confirm modal
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Course"
  message="Are you sure you want to delete this course?"
  variant="danger"
/>

// Drawer
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Filters"
  position="right"
  size="md"
>
  <p>Drawer content here</p>
</Drawer>
```

---

### 6. **Avatar** (`Avatar.jsx`)
User avatars with status indicators and groups.

#### Variants
- `circular` - Round (default)
- `rounded` - Rounded corners
- `square` - No rounding

#### Avatar Types
- `Avatar` - Single avatar
- `AvatarGroup` - Multiple avatars
- `AvatarWithBadge` - Avatar with badge

#### Usage
```jsx
import { Avatar, AvatarGroup, AvatarWithBadge } from '@/components/ui';

// Image avatar
<Avatar
  src="/user.jpg"
  alt="John Doe"
  size="md"
  status="online"
/>

// Initials avatar (auto-generated gradient)
<Avatar
  name="John Doe"
  size="lg"
  variant="circular"
/>

// Avatar group
<AvatarGroup
  avatars={[
    { src: '/user1.jpg', name: 'User 1' },
    { src: '/user2.jpg', name: 'User 2' },
    { src: '/user3.jpg', name: 'User 3' }
  ]}
  max={3}
  size="md"
/>

// Avatar with badge
<AvatarWithBadge
  src="/user.jpg"
  badge={<NotificationBadge count={3} />}
  badgePosition="top-right"
/>
```

---

### 7. **Tooltip** (`Tooltip.jsx`)
Informative tooltips with smooth animations.

#### Positions
- `top`, `bottom`, `left`, `right`

#### Usage
```jsx
import { Tooltip, InfoTooltip } from '@/components/ui';

// Basic tooltip
<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>

// Info tooltip
<InfoTooltip 
  content="This field is required" 
  position="right"
/>
```

---

## 🎨 Design System

The components use a comprehensive design system (`designSystem.js`) with:

### Color Palette
- Primary: Blue (50-900)
- Secondary: Purple (50-900)
- Status: Success, Error, Warning, Info
- 8 Gradient presets

### Typography
- Font families: Inter, Poppins, JetBrains Mono
- 11 size scales (xs to 7xl)
- Weight scale (300-900)

### Spacing
- 20 spacing tokens (px to 32rem)
- 4px base unit

### Shadows
- 7 elevation levels
- Glow effects for focus states

### Animations
- 9 preset animations (fadeIn, slideUp, scaleIn, etc.)
- 6 transition durations
- 5 easing functions

---

## 🌙 Dark Mode Support

All components automatically support dark mode via Tailwind's `dark:` prefix.

```jsx
// Automatically adapts to theme
<Card variant="elevated">
  <CardTitle>Works in both modes!</CardTitle>
</Card>
```

---

## 🚀 Getting Started

### Import Components
```jsx
// Import specific components
import { Button, Card, Input } from '@/components/ui';

// Or import from individual files
import Button from '@/components/ui/Button';
```

### Import Theme CSS
Add to your main file:
```jsx
import '@/styles/theme-enhanced.css';
```

---

## 📱 Responsive Design

All components are fully responsive with mobile-first approach.

---

## ✨ Features

✅ **Butter-smooth animations**  
✅ **Material Design inspired**  
✅ **Dark/Light mode**  
✅ **Fully accessible (ARIA)**  
✅ **TypeScript ready** (add .d.ts files)  
✅ **Tree-shakeable**  
✅ **Zero external dependencies** (except React)  
✅ **Production-ready**  

---

## 🎯 Examples

### Login Form
```jsx
import { Input, Button, Card } from '@/components/ui';

<Card variant="elevated" padding="lg">
  <Input
    label="Email"
    type="email"
    leftIcon={<MailIcon />}
    fullWidth
  />
  <Input
    label="Password"
    type="password"
    leftIcon={<LockIcon />}
    fullWidth
  />
  <Button variant="primary" fullWidth>
    Sign In
  </Button>
</Card>
```

### Dashboard Stats
```jsx
import { StatsCard } from '@/components/ui';

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard
    title="Total Students"
    value="1,234"
    icon={<UsersIcon />}
    trend="up"
    trendValue="+12%"
    variant="primary"
  />
  <StatsCard
    title="Active Courses"
    value="45"
    icon={<BookIcon />}
    variant="success"
  />
  <StatsCard
    title="Revenue"
    value="$12,345"
    icon={<DollarIcon />}
    trend="up"
    trendValue="+23%"
    variant="default"
  />
</div>
```

---

## 🔧 Customization

### Extend Variants
```jsx
// Add custom button variant
<Button 
  className="bg-gradient-to-r from-orange-500 to-pink-500"
>
  Custom Gradient
</Button>
```

### Override Styles
```jsx
// Use Tailwind classes
<Card className="border-4 border-purple-500">
  Custom card
</Card>
```

---

## 📄 License

MIT License - Use freely in your projects!

---

## 🎉 Happy Coding!

Built with ❤️ for the NexEd project.
