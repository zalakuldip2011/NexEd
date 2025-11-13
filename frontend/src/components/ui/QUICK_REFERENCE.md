# 🎨 NexEd UI Component System - Quick Reference

## 🚀 Import & Use

```jsx
import { 
  Button, IconButton, ButtonGroup,
  Card, StatsCard, CourseCard, GlassCard,
  Input, Textarea, Select, SearchInput, Checkbox, Radio,
  Badge, NotificationBadge, StatusBadge, Chip,
  Modal, ConfirmModal, Drawer,
  Avatar, AvatarGroup,
  Tooltip, InfoTooltip
} from '@/components/ui';
```

---

## 🎯 Quick Examples

### Buttons
```jsx
// Primary gradient button
<Button variant="primary" size="md">Click Me</Button>

// With icon and loading
<Button variant="gradient" icon={<StarIcon />} loading={true}>
  Featured
</Button>

// Icon only button
<IconButton icon={<BellIcon />} variant="ghost" />

// Button group
<ButtonGroup>
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
```

### Cards
```jsx
// Elevated card with hover
<Card variant="elevated" hover padding="lg">
  <CardHeader>
    <CardTitle>Course Title</CardTitle>
    <CardDescription>Learn React</CardDescription>
  </CardHeader>
  <CardContent>
    Course content here...
  </CardContent>
  <CardFooter>
    <Button variant="primary" fullWidth>Enroll Now</Button>
  </CardFooter>
</Card>

// Stats card for dashboard
<StatsCard
  title="Total Students"
  value="1,234"
  icon={<UsersIcon />}
  trend="up"
  trendValue="+12%"
  variant="primary"
/>

// Course display card
<CourseCard
  image="/course.jpg"
  title="React Masterclass"
  instructor="John Doe"
  rating={4.8}
  students={5420}
  price={49.99}
  originalPrice={99.99}
  badge="Bestseller"
  onClick={() => navigate('/course/123')}
/>

// Glass morphism card
<GlassCard className="p-6">
  Beautiful backdrop blur effect
</GlassCard>
```

### Inputs
```jsx
// Text input with icon and validation
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  leftIcon={<MailIcon />}
  error={!!errors.email}
  helperText={errors.email?.message}
  fullWidth
/>

// Textarea
<Textarea
  label="Description"
  rows={4}
  placeholder="Tell us about yourself..."
  fullWidth
/>

// Select dropdown
<Select
  label="Category"
  options={[
    { value: 'dev', label: 'Development' },
    { value: 'design', label: 'Design' }
  ]}
  fullWidth
/>

// Search input with autocomplete
<SearchInput
  placeholder="Search courses..."
  onSearch={(value) => handleSearch(value)}
/>

// Checkbox & Radio
<Checkbox label="Remember me" />
<Radio label="Option 1" name="options" />
```

### Badges & Chips
```jsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="error" size="sm">Expired</Badge>

// Removable badge
<Badge variant="primary" removable onRemove={() => {}}>
  JavaScript
</Badge>

// Notification badge
<div className="relative">
  <BellIcon className="w-6 h-6" />
  <NotificationBadge count={5} />
</div>

// Status indicator
<StatusBadge status="online" label="Available" />

// Achievement badge
<AchievementBadge 
  icon={<TrophyIcon />}
  label="Course Complete"
  variant="gold"
/>

// Material UI Chip
<Chip
  label="React"
  variant="filled"
  color="primary"
  deletable
  onDelete={() => {}}
/>
```

### Modals & Drawers
```jsx
// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Course Details"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary">Enroll Now</Button>
    </>
  }
>
  <p>Course information here...</p>
</Modal>

// Confirmation modal
<ConfirmModal
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="Delete Course"
  message="Are you sure you want to delete this course? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  cancelText="Cancel"
/>

// Drawer from right
<Drawer
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  title="Course Filters"
  position="right"
  size="md"
>
  <div className="space-y-4">
    <Select label="Category" options={categories} />
    <Select label="Level" options={levels} />
    <Select label="Price" options={prices} />
  </div>
</Drawer>
```

### Avatars
```jsx
// User avatar with image
<Avatar
  src="/user.jpg"
  alt="John Doe"
  size="lg"
  status="online"
  variant="circular"
/>

// Initials avatar (auto-gradient)
<Avatar
  name="John Doe"
  size="md"
/>

// Avatar group
<AvatarGroup
  avatars={[
    { src: '/user1.jpg', name: 'User 1' },
    { src: '/user2.jpg', name: 'User 2' },
    { src: '/user3.jpg', name: 'User 3' },
    { name: 'User 4' }
  ]}
  max={3}
  size="sm"
/>

// Avatar with notification badge
<AvatarWithBadge
  src="/user.jpg"
  badge={<NotificationBadge count={5} />}
  badgePosition="top-right"
  size="lg"
/>
```

### Tooltips
```jsx
// Basic tooltip
<Tooltip content="Edit profile" position="top">
  <IconButton icon={<PencilIcon />} />
</Tooltip>

// Info tooltip
<div className="flex items-center gap-2">
  <label>Password</label>
  <InfoTooltip content="Must be 8+ characters" position="right" />
</div>
```

---

## 🎨 Design Tokens

### Colors
```jsx
// Use in components or CSS
className="bg-primary-500 text-white"
className="bg-gradient-to-r from-blue-500 to-purple-600"
```

### Spacing
```jsx
// Consistent spacing
className="p-4 m-6 gap-3" // Uses design system spacing scale
```

### Shadows
```jsx
// Elevation levels
className="shadow-md hover:shadow-xl"
className="shadow-glow" // Glowing effect
```

### Animations
```jsx
// Built-in animations
className="animate-fadeInUp stagger-1"
className="animate-scaleIn stagger-2"
className="hover-lift" // Lift on hover
className="hover-glow" // Glow on hover
```

---

## 📱 Responsive Design

All components are fully responsive:

```jsx
// Example: Responsive grid of cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {courses.map(course => (
    <CourseCard key={course.id} {...course} />
  ))}
</div>
```

---

## 🌙 Dark Mode

All components automatically support dark mode:

```jsx
// No extra code needed - components adapt automatically!
<Button variant="primary">Works in both modes</Button>
```

---

## 🎯 Real-World Examples

### Login Form
```jsx
<Card variant="elevated" padding="lg" className="max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Welcome Back</CardTitle>
    <CardDescription>Sign in to continue</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Input
        label="Email"
        type="email"
        leftIcon={<MailIcon />}
        placeholder="you@example.com"
        fullWidth
      />
      <Input
        label="Password"
        type="password"
        leftIcon={<LockIcon />}
        placeholder="••••••••"
        fullWidth
      />
      <Checkbox label="Remember me" />
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="primary" fullWidth size="lg">
      Sign In
    </Button>
  </CardFooter>
</Card>
```

### Dashboard Stats
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  />
  <StatsCard
    title="Completion Rate"
    value="87%"
    icon={<ChartIcon />}
    trend="up"
    trendValue="+5%"
    variant="success"
  />
</div>
```

### Course Grid
```jsx
<div className="space-y-6">
  {/* Filters */}
  <div className="flex flex-wrap gap-3">
    <SearchInput placeholder="Search courses..." />
    <Select options={categories} placeholder="Category" />
    <Select options={levels} placeholder="Level" />
    <Button 
      variant="outline" 
      icon={<FilterIcon />}
      onClick={() => setShowFilters(true)}
    >
      More Filters
    </Button>
  </div>

  {/* Course Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map(course => (
      <CourseCard
        key={course.id}
        image={course.thumbnail}
        title={course.title}
        instructor={course.instructor.name}
        rating={course.rating}
        students={course.enrollments}
        price={course.price}
        originalPrice={course.originalPrice}
        badge={course.badge}
        onClick={() => navigate(`/course/${course.id}`)}
      />
    ))}
  </div>
</div>
```

### User Profile Header
```jsx
<Card variant="gradient" padding="lg">
  <div className="flex items-center gap-6">
    <AvatarWithBadge
      src={user.avatar}
      name={user.name}
      size="2xl"
      status="online"
      badge={<Badge variant="success">Verified</Badge>}
    />
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-white mb-2">
        {user.name}
      </h2>
      <p className="text-white/80 mb-4">{user.bio}</p>
      <div className="flex gap-3">
        <Chip label={`${user.courseCount} Courses`} color="primary" />
        <Chip label={`${user.studentCount} Students`} color="secondary" />
        <Chip label={`${user.rating} Rating`} color="success" />
      </div>
    </div>
    <div className="flex gap-3">
      <Button variant="outline" icon={<ShareIcon />}>
        Share
      </Button>
      <Button variant="primary" icon={<MailIcon />}>
        Message
      </Button>
    </div>
  </div>
</Card>
```

---

## 🎨 Customization

### Extend with Tailwind
```jsx
<Button 
  variant="primary" 
  className="transform hover:rotate-2 transition-transform"
>
  Custom Animation
</Button>
```

### Custom Colors
```jsx
<Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
  Custom gradient card
</Card>
```

---

## 📚 Documentation

Full documentation available in:
- `/frontend/src/components/ui/README.md` - Component API docs
- `/frontend/src/styles/designSystem.js` - Design tokens
- `/frontend/src/styles/theme-enhanced.css` - CSS utilities

---

## 🎉 Quick Wins

✅ **Copy-paste ready** - All examples work out of the box  
✅ **Consistent design** - All components follow Material Design  
✅ **Dark mode** - Automatic support everywhere  
✅ **Responsive** - Mobile-first, works on all devices  
✅ **Accessible** - ARIA labels, keyboard navigation  
✅ **Performant** - CSS animations, optimized renders  

---

**Happy building! 🚀**
