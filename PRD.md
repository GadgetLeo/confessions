# Product Requirements Document
## Web3 Confessions - Privacy Platform with FHEVM

**Version:** 1.0
**Last Updated:** October 25, 2025

---

## Executive Summary

### Product Overview
A Web3 confession platform using Fully Homomorphic Encryption (FHEVM) on Sepolia testnet. Users can share encrypted confessions anonymously and upvote content without revealing vote counts.

### Core Features
- Complete privacy through FHE encryption
- Anonymous wallet-based authentication
- Encrypted voting system
- Decentralized smart contract enforcement

### Target Users
- Privacy-focused Web3 users
- Crypto community members
- FHE technology developers

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### **Smart Contracts Layer**
- **Language**: Solidity ^0.8.24
- **Framework**: Hardhat
- **Network**: Sepolia Testnet
- **FHE Library**: fhevm-contracts (Zama)
- **Testing**: Hardhat test suite with FHEVM mocks
- **Development Tools**: 
  - dotenv for environment management
  - hardhat-deploy for deployment tracking
  - @nomicfoundation/hardhat-toolbox

#### **Frontend Application**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS 3+ with custom configuration
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Web3 Integration**:
  - viem 2+ (Ethereum interactions)
  - wagmi 2+ (React hooks for Ethereum)
  - @rainbow-me/rainbowkit (Wallet connection UI)
- **State Management**: Zustand
- **Additional Libraries**:
  - react-hot-toast (notifications)
  - recharts (analytics charts)
  - react-intersection-observer (scroll animations)
  - boring-avatars (anonymous user avatars)
  - lucide-react (icon system)

#### **Development Tools**
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with Solidity plugin
- **Git Hooks**: Husky for pre-commit checks
- **Testing**: 
  - Hardhat for smart contracts
  - Playwright or React Testing Library for frontend

#### **Deployment & Infrastructure**
- **Frontend Hosting**: Vercel (primary) or Netlify
- **RPC Provider**: Infura, Alchemy, or public Sepolia endpoint
- **Optional Storage**: IPFS (via Pinata or web3.storage) for confession blobs
- **Optional Cache**: Supabase or Neon Postgres (metadata only, no plaintext)

### 2.2 Smart Contract Architecture

#### **Primary Contract: ConfessionVault.sol**

**State Variables:**
```solidity
struct Confession {
    ebytes encryptedMessage;      // FHE encrypted confession text
    euint32 encryptedVotes;       // FHE encrypted upvote counter
    euint64 encryptedCreatedAt;   // FHE encrypted timestamp
    address author;                // Wallet address (pseudonymous)
    bytes32 ipfsCID;              // Optional: IPFS hash for blob storage
    bool exists;                   // Existence flag
}

mapping(uint256 => Confession) public confessions;
uint256 public confessionCount;
mapping(address => uint256) public lastSubmissionTime; // Rate limiting
```

**Core Functions:**

1. **`submitConfession(ebytes calldata _encryptedMessage)`**
   - Validates sender is connected wallet
   - Enforces rate limiting (configurable cooldown period)
   - Initializes encrypted votes to 0 using FHE
   - Sets encrypted timestamp to block.timestamp
   - Stores author address
   - Emits `ConfessionSubmitted(uint256 id, address author)` event
   - Returns confession ID

2. **`upvote(uint256 _confessionId, euint32 _encryptedOne)`**
   - Validates confession exists
   - Prevents double-voting (one vote per address per confession)
   - Performs FHE addition: `votes = FHE.add(confession.votes, _encryptedOne)`
   - Emits `ConfessionUpvoted(uint256 id, address voter)` event
   - Gas-optimized for encrypted arithmetic

3. **`getConfessionCiphertext(uint256 _confessionId)`**
   - Returns encrypted message, votes, and timestamp
   - Public read access (ciphertext only)
   - Client-side decryption required

4. **`requestDecryption(uint256 _confessionId, DecryptionPolicy _policy)`** *(Optional)*
   - Integrates with FHEVM decryption oracle
   - Only for aggregate outputs (leaderboard calculations)
   - Enforces policy: time-bounded, threshold-based, admin-only
   - Returns request ID for async result retrieval

5. **`updateRateLimit(uint256 _newCooldown)` (Admin)**
   - Owner-only function
   - Sets minimum time between submissions per address

6. **`emergencyPause()` / `unpause()` (Admin)**
   - Circuit breaker for critical issues
   - Pauses all state-changing functions

**Security Considerations:**
- No plaintext values in contract storage or events
- Access control using OpenZeppelin Ownable
- Reentrancy guards on state-changing functions
- Input validation for all external calls
- Rate limiting to prevent spam
- No branching logic based on encrypted values (maintains FHE security)

### 2.3 Frontend Architecture

#### **Page Structure (App Router)**

1. **`/` (Home Feed)**
   - Displays all confessions in reverse chronological order
   - Infinite scroll pagination
   - Filter options: Recent, Trending (encrypted scores), All
   - Each confession rendered as ConfessionCard component

2. **`/create` (New Confession)**
   - Modal overlay or dedicated page
   - Encryption form with real-time character count
   - Preview of encrypted state
   - Submission flow with transaction status

3. **`/confession/[id]` (Detail View)**
   - Single confession display
   - Full text (expandable)
   - Upvote interaction
   - Share functionality
   - Comment section (future feature)

4. **`/admin` (Admin Console)**
   - Protected route (wallet signature verification)
   - Dashboard with key metrics
   - Rate limit configuration
   - Decryption oracle settings
   - Moderation tools (flag review)
   - Analytics charts

5. **`/about` (Info Page)**
   - Explanation of FHE technology
   - How privacy is maintained
   - FAQ section
   - Link to documentation

#### **Component Library**

**Core Components:**

1. **`<ConfessionCard>`**
   - Props: `confession` object, `onUpvote` handler
   - Displays encrypted/decrypted state
   - Interactive upvote button
   - Share and report actions
   - Hover animations

2. **`<EncryptionForm>`**
   - Textarea with character limit (500 chars)
   - Real-time encryption indicator
   - Submit button with loading states
   - Error handling and validation

3. **`<WalletConnect>`**
   - RainbowKit integration
   - Network switcher (auto-switch to Sepolia)
   - Account display with avatar
   - Disconnect option

4. **`<ThemeToggle>`**
   - Dark/light mode switcher
   - Animated icon transition
   - Persists preference to localStorage

5. **`<EncryptedStats>`**
   - Dashboard metrics with animated counters
   - Icons for each stat type
   - Hover effects with holographic shimmer

6. **`<LoadingSkeleton>`**
   - Matches ConfessionCard layout
   - Pulsing gradient animation
   - Used during data fetching

7. **`<ToastNotification>`**
   - Success, error, info, warning variants
   - Auto-dismiss with progress bar
   - Slide-in animation from top-right

8. **`<AdminPanel>`**
   - Tabbed interface for different settings
   - Form controls with auto-save
   - Status indicators and live metrics

#### **State Management (Zustand)**

```typescript
interface AppState {
  // Wallet state
  isConnected: boolean;
  address: string | null;
  network: string | null;
  
  // UI state
  theme: 'dark' | 'light';
  isLoading: boolean;
  
  // Confession state
  confessions: Confession[];
  selectedConfession: Confession | null;
  
  // Actions
  setWallet: (address: string, network: string) => void;
  toggleTheme: () => void;
  addConfession: (confession: Confession) => void;
  updateConfession: (id: string, updates: Partial<Confession>) => void;
}
```

#### **Client-Side Encryption Flow**

1. User types confession in form
2. On submit, encrypt plaintext using FHEVM client library
3. Encrypted bytes generated in browser (never leaves in plaintext)
4. Submit transaction with encrypted payload
5. Wait for confirmation
6. Display success toast with transaction hash
7. Redirect to home feed

**Decryption Flow (Optional):**
- User requests decryption (if they have proper key material)
- Client-side decryption using FHEVM library
- Decrypted text shown only to authorized user
- No decryption for leaderboard scores (remains encrypted)

---

## 3. Design System Specifications

### 3.1 Visual Design Language

**Design Philosophy:**  
Premium Web3 product combining Stripe's polish, Linear's fluidity, and Uniswap's credibility. Every interaction communicates trust, security, and cutting-edge technology.

### 3.2 Color Palette

#### **Dark Mode (Primary Theme)**
```css
--bg-deep-space-1: #0a0118;
--bg-deep-space-2: #1a0b2e;
--bg-deep-space-3: #2d1b4e;
--surface-glass: rgba(255, 255, 255, 0.05);
--surface-glass-border: rgba(255, 255, 255, 0.1);

--primary-purple-start: #9333ea;
--primary-purple-end: #c026d3;
--secondary-cyan-start: #06b6d4;
--secondary-cyan-end: #3b82f6;

--text-primary: #ffffff;
--text-secondary: #c4b5fd;
--text-muted: #a78bfa;

--success-green: #10b981;
--warning-amber: #f59e0b;
--error-pink: #ec4899;
--info-blue: #3b82f6;
```

#### **Light Mode**
```css
--bg-light-1: #faf5ff;
--bg-light-2: #f3e8ff;
--bg-light-3: #e9d5ff;
--surface-white: #ffffff;
--surface-border: rgba(147, 51, 234, 0.2);

--primary-purple: #7c3aed;
--text-primary-light: #1e1b4b;
--text-secondary-light: #6d28d9;
```

#### **Semantic Colors**
- **Encrypted State**: Neon green (#10b981) with lock icon
- **Decrypting**: Amber (#f59e0b) with spinner
- **Error/Rejected**: Hot pink (#ec4899)
- **Success/Confirmed**: Green (#10b981)

### 3.3 Typography System

#### **Font Families**
```css
--font-heading: 'Space Grotesk', 'Inter', sans-serif;
--font-body: 'Inter', 'system-ui', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### **Font Scale (Fluid Typography)**
```css
--text-hero: clamp(2.5rem, 5vw, 4rem);        /* 40-64px */
--text-h1: clamp(2rem, 4vw, 3rem);            /* 32-48px */
--text-h2: clamp(1.5rem, 3vw, 2rem);          /* 24-32px */
--text-h3: clamp(1.25rem, 2.5vw, 1.5rem);     /* 20-24px */
--text-body: clamp(1rem, 2vw, 1.125rem);      /* 16-18px */
--text-small: 0.875rem;                        /* 14px */
--text-xs: 0.75rem;                            /* 12px */
```

#### **Font Weights**
- Headings: 600-700 (Semibold to Bold)
- Body: 400 (Regular)
- Emphasis: 500 (Medium)
- Monospace: 400 (Regular)

#### **Letter Spacing**
- Headlines: -0.02em (tighter)
- Body: 0.01em (slightly open)
- Uppercase labels: 0.05em (wide)

#### **Line Height**
- Headings: 1.2
- Body text: 1.7
- Small text: 1.5

### 3.4 Spacing System
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 6rem;     /* 96px */
```

### 3.5 Border Radius
```css
--radius-sm: 8px;      /* Small elements, badges */
--radius-md: 12px;     /* Buttons, inputs */
--radius-lg: 16px;     /* Cards, modals */
--radius-xl: 24px;     /* Large cards */
--radius-full: 9999px; /* Pills, circular elements */
```

### 3.6 Shadows & Glows
```css
--shadow-sm: 0 2px 8px rgba(139, 92, 246, 0.1);
--shadow-md: 0 4px 16px rgba(139, 92, 246, 0.15);
--shadow-lg: 0 8px 32px rgba(139, 92, 246, 0.2);
--shadow-xl: 0 16px 64px rgba(139, 92, 246, 0.25);

--glow-purple: 0 0 20px rgba(147, 51, 234, 0.5);
--glow-cyan: 0 0 20px rgba(6, 182, 212, 0.5);
--glow-green: 0 0 20px rgba(16, 185, 129, 0.5);
```

### 3.7 Glassmorphism Effects
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

---

## 4. Component Design Specifications

### 4.1 Confession Card

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│ [Avatar] Anonymous User     2h ago  🔒  │ ← Header
├─────────────────────────────────────────┤
│                                         │
│  Sometimes I feel like I'm the only    │ ← Content
│  one who doesn't understand crypto...  │
│  [Read more]                           │
│                                         │
├─────────────────────────────────────────┤
│  [♥ 🔒 Hidden]  [Share]  [Report]      │ ← Actions
└─────────────────────────────────────────┘
```

**Specifications:**
- **Container**:
  - Max-width: 640px
  - Padding: 24px (desktop), 16px (mobile)
  - Border-radius: 24px
  - Glass background with backdrop blur
  - Animated gradient border (subtle pulse on hover)
  
- **Header Section**:
  - Avatar: 40px × 40px, generated from address hash
  - Username: "Anonymous" + last 4 of address (or just "Anonymous")
  - Timestamp: Relative time (2h ago, 1d ago) with clock icon
  - Encryption badge: Shield icon + "Encrypted" label, green glow
  
- **Content Area**:
  - Font: --font-body, size 16-18px
  - Line height: 1.7
  - Max 3 lines visible initially (line-clamp-3)
  - Expandable with "Read more" link
  - Encrypted state: Shimmer overlay effect
  - Decrypted state: Clear text with subtle fade-in animation
  
- **Footer Actions**:
  - Upvote button: 
    - Purple gradient pill shape
    - Heart or flame icon
    - Count display: "🔒 Hidden" or decrypted number
    - Active state: Filled icon, brighter gradient
  - Share button: Link icon, copies URL, shows toast
  - Report button: Flag icon, opens modal
  
- **Hover State**:
  - Transform: translateY(-4px)
  - Shadow: Intensifies to --shadow-xl
  - Border: Animated glow effect
  - Duration: 300ms ease-out
  
- **Mobile Adjustments**:
  - Padding: 16px
  - Font-size: 16px (no scaling down)
  - Touch targets: Minimum 44px × 44px

### 4.2 Create Confession Form

**Modal Layout:**
```
┌───────────────────────────────────────────┐
│  [X Close]                                │
│                                           │
│  Share Your Encrypted Confession ✨       │ ← Title
│  ─────────────────────────────────────── │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Type your confession here...        │ │ ← Textarea
│  │                                     │ │
│  │                                     │ │
│  └─────────────────────────────────────┘ │
│  Characters: 0 / 500                     │
│                                           │
│  🔒 This will be encrypted on-chain      │ ← Indicator
│                                           │
│  [Confess Anonymously 🔐]                │ ← Submit
└───────────────────────────────────────────┘
```

**Specifications:**
- **Modal Container**:
  - Desktop: Centered, max-width 600px, height auto
  - Mobile: Full-screen slide-up panel
  - Background: Dark overlay with backdrop-blur(8px)
  - Entry animation: Scale from center (0.95 → 1) + fade-in
  
- **Textarea**:
  - Min-height: 200px
  - Auto-expanding as user types
  - Font-size: 16px (prevent iOS zoom)
  - Placeholder: "Share your encrypted confession..." with sparkle icon
  - Border: 2px solid transparent
  - Focus state: Border glows purple, --shadow-lg
  
- **Character Counter**:
  - Position: Bottom-right of textarea
  - Colors: 
    - 0-400 chars: Green
    - 401-450 chars: Yellow
    - 451-500 chars: Orange
    - 500+ chars: Red (disable submit)
  
- **Encryption Indicator**:
  - Lock icon with animated shimmer
  - Text: "This will be encrypted on-chain"
  - Visual strength meter (always 100% for FHE)
  
- **Submit Button**:
  - Width: 100%
  - Height: 56px
  - Border-radius: 9999px (fully rounded)
  - Background: Purple-to-cyan gradient
  - Text: "Confess Anonymously 🔐"
  - States:
    - Default: Gradient, white text
    - Hover: Scale 1.02, shadow intensifies
    - Active: Scale 0.98
    - Loading: Spinner + "Encrypting..." → "Submitting..."
    - Success: Green checkmark + confetti burst
    - Disabled: Grayed out, cursor-not-allowed
  
- **Validation**:
  - Min 10 characters
  - Max 500 characters
  - No empty submissions
  - Rate limit check before submit

### 4.3 Navigation Header

**Desktop Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [🔐 Logo] Confessions  Home Explore Create Admin         │
│                                    [🌙] [Connect Wallet] │
└──────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Container**:
  - Position: Sticky top
  - Height: 80px
  - Padding: 0 5vw
  - Glass background with backdrop-blur(12px)
  - Border-bottom: 1px solid rgba(255,255,255,0.1)
  
- **Logo**:
  - Animated gradient icon (lock + sparkle)
  - Text: "Confessions" in --font-heading
  - Clickable, returns to home
  
- **Nav Items**:
  - Display: Inline-flex, gap 32px
  - Font-size: 16px, weight 500
  - Active state: 
    - Gradient underline (2px thick)
    - Bold weight (600)
  - Hover state:
    - Icon shifts up 2px
    - Color transition to purple
    
- **Wallet Button**:
  - Not connected: 
    - "Connect Wallet" with wallet icon
    - Purple gradient background
  - Connected:
    - Avatar (32px) + address (0x1234...5678)
    - Dropdown on click: Balance, network, disconnect
  - Network badge: "Sepolia" chip with orange dot
  
- **Theme Toggle**:
  - Sun/Moon icon
  - Rotation animation (180deg) on toggle
  - Smooth theme transition (300ms)
  
- **Mobile**: 
  - Hamburger menu icon
  - Slide-out drawer navigation
  - Bottom navigation bar with key actions

### 4.4 Leaderboard Dashboard

**Grid Layout:**
```
┌─────────────┬─────────────┬─────────────┐
│ 🔥 Trending │ 🔒 Encrypted│ 📊 Total    │
│    127      │    1,234    │   5,678     │
└─────────────┴─────────────┴─────────────┘

Top Confessions This Week
┌───────────────────────────────────────┐
│ [🥇1] "I think pineapple..."  🔒 ---  │
│ [🥈2] "Sometimes I pretend..."  🔒 -- │
│ [🥉3] "My biggest fear is..."   🔒 -- │
└───────────────────────────────────────┘
```

**Specifications:**
- **Stat Cards**:
  - 3-column grid (desktop), stack (mobile)
  - Each card:
    - Large number with animated count-up effect
    - Icon above (flame, lock, chart)
    - Label below in secondary color
    - Holographic shimmer on hover
  
- **Top Confessions List**:
  - Rank badges: 
    - 1st: Gold gradient (#FFD700)
    - 2nd: Silver gradient (#C0C0C0)
    - 3rd: Bronze gradient (#CD7F32)
    - 4+: Purple number
  - Mini confession cards (max 2 lines)
  - "Encrypted Score" with lock icon
  - Animated rank changes (smooth reordering)
  
- **Filters**:
  - Time range: Today, Week, Month, All-time
  - Pills with active state
  
- **Empty State**:
  - Illustration or icon
  - "No confessions yet. Be the first!"
  - CTA button to create

### 4.5 Admin Console

**Dashboard Layout:**
```
┌────────────┬────────────────────────────┐
│ Sidebar    │ Main Content               │
│            │                            │
│ • Overview │ ┌────────────────────────┐ │
│ • Limits   │ │ Rate Limit Settings    │ │
│ • Oracle   │ │ [Toggle] [Slider]      │ │
│ • Moderate │ │ Auto-save: ✓ Saved     │ │
│ • Analytics│ └────────────────────────┘ │
│            │                            │
└────────────┴────────────────────────────┘
```

**Specifications:**
- **Sidebar**:
  - Width: 240px (desktop)
  - Glass background
  - Nav items with icons
  - Active: Purple highlight
  
- **Content Area**:
  - Max-width: 1000px
  - Cards for each setting group
  - Padding: 32px
  
- **Controls**:
  - Toggle switches: 
    - Animated, purple when active
    - Label + description
  - Sliders:
    - Purple track, gradient thumb
    - Value label follows thumb
  - Input fields:
    - Dark with purple focus ring
    - Validation feedback
  
- **Status Indicators**:
  - Badges: "Active", "Paused", "Warning"
  - Color-coded dots
  
- **Analytics Charts**:
  - Recharts with gradient fills
  - Responsive, mobile-friendly
  - Interactive tooltips

---

## 5. Animation & Interaction Specifications

### 5.1 Page Transitions
```css
/* Enter animation */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 400ms, easing: ease-out */
```

### 5.2 Loading States

**Skeleton Screen:**
- Matches actual card layout
- Pulsing gradient animation (1.5s infinite)
- Sequence: Background → shimmer overlay → fade-in real content

**Spinner:**
- Custom gradient ring (conic-gradient)
- Rotation: 360deg, 1s linear infinite
- Size: 24px (inline), 48px (full-page)

**Progressive Loading:**
- Cards fade in sequentially
- Stagger delay: 50ms per card
- Entry: Scale (0.95 → 1) + fade-in

### 5.3 Button Interactions

**Default State → Hover:**
- Transform: scale(1.05)
- Shadow: Increases to --shadow-lg
- Gradient: Shifts 10deg
- Duration: 200ms ease-out

**Active/Click:**
- Transform: scale(0.95)
- Ripple effect from click point (expanding circle)
- Duration: 150ms

**Success State:**
- Green checkmark slides in from right
- Button pulses once (scale 1 → 1.05 → 1)
- Confetti particles burst (optional)

### 5.4 Micro-interactions

**Upvote Animation:**
1. Icon scale + rotate (360deg)
2. Particle burst (5-8 small hearts)
3. Counter increments with spring animation
4. Duration: 600ms total

**Encryption Indicator:**
- Lock icon rotates 360deg
- Shimmer overlay fades in/out (wave effect)
- Duration: 800ms

**Toast Notifications:**
- Slide in from top-right (translateX(100%) → 0)
- Auto-dismiss after 4s with progress bar
- Slide out on close
- Duration: 300ms enter, 200ms exit

### 5.5 Scroll Behaviors

**Parallax Background:**
- Gradient mesh shifts slowly while scrolling
- Transform: translateY(-scrollY * 0.2)

**Fade-in on Scroll:**
- Intersection Observer triggers animation
- Elements below fold start at opacity 0
- Fade + slide-up when entering viewport
- Threshold: 0.1 (10% visible)

**Infinite Scroll:**
- Load more trigger: 200px from bottom
- Loading indicator: Spinner + "Loading more..."
- New items append with stagger animation

### 5.6 Special Effects

**Encryption Visual Language:**
- **Locked state**: Shimmer overlay (45deg diagonal gradient moving)
- **Encrypting**: Matrix-style character cascade
- **Decrypting**: Pixelated mosaic → clear (800ms transition)
- **FHE operation**: Glowing purple circuit-board pattern

**Background Elements:**
- Animated gradient mesh (subtle movement, 60s loop)
- Floating geometric shapes (triangles, circles)
- Particle field in hero section (canvas-based)
- Optional scanline overlay (very subtle, 2s loop)

---

## 6. Responsive Design Specifications

### 6.1 Breakpoint System
```css
/* Mobile: 0 - 639px */
@media (max-width: 639px) { }

/* Tablet: 640px - 1023px */
@media (min-width: 640px) and (max-width: 1023px) { }

/* Desktop: 1024px - 1439px */
@media (min-width: 1024px) and (max-width: 1439px) { }

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) { }
```

### 6.2 Mobile Optimizations (< 640px)

**Layout:**
- Single column, full-width cards
- Bottom navigation bar (fixed)
- Larger touch targets (min 44px × 44px)
- Reduced padding (16px instead of 24px)

**Typography:**
- Slightly smaller scale (clamp min values)
- Line-height: 1.6 for body text
- No font-size below 16px (prevents iOS zoom)

**Navigation:**
- Hamburger menu or bottom tab bar
- Full-screen drawer for menu
- Wallet button: Icon only, address in dropdown

**Forms:**
- Full-width inputs
- Larger tap areas
- Sticky submit button at bottom

**Cards:**
- Simplified layout (remove extra metadata)
- Actions: Icon-only buttons
- Expandable content collapsed by default

### 6.3 Tablet (640px - 1023px)

**Layout:**
- 2-column grid for confession feed
- Side drawer navigation (swipeable)
- Hybrid touch + hover interactions

**Cards:**
- Max-width: 480px per card
- Full metadata visible
- Hover effects active

### 6.4 Desktop (1024px+)

**Layout:**
- 3-column grid option for explore view
- Persistent sidebar navigation
- Max content width: 1440px, centered
- Generous whitespace

**Interactions:**
- Full hover states
- Keyboard shortcuts enabled
- Cursor effects (optional custom cursor)

---

## 7. Accessibility Requirements (WCAG 2.1 AA)

### 7.1 Color Contrast
- Text on background: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1
- Test tool: Use WebAIM contrast checker

### 7.2 Keyboard Navigation
- All interactive elements focusable via Tab
- Focus order: Logical, top-to-bottom, left-to-right
- Focus indicator: 2px purple ring, 2px offset
- Skip link: "Skip to main content" at top
- Keyboard shortcuts: Document in accessibility modal

### 7.3 Screen Reader Support
- Semantic HTML5 elements
- ARIA labels for all icons and icon-only buttons
- ARIA live regions for dynamic content
- Alt text for all images (if any)
- Descriptive link text (no "click here")

### 7.4 Motion Preferences
- Respect `prefers-reduced-motion` media query
- Disable complex animations if set
- Replace with simple fades or instant transitions
- Toggle in settings for manual control

### 7.5 Forms & Errors
- Labels associated with inputs (for/id)
- Error messages: aria-describedby, role="alert"
- Required fields: aria-required="true"
- Validation feedback: Visual + text

---

## 8. Functional Requirements

### 8.1 User Stories

**As a user, I want to:**
1. Connect my wallet with one click
2. Post an encrypted confession anonymously
3. Upvote confessions I relate to (encrypted votes)
4. Browse confessions without revealing my identity
5. Switch between dark and light themes
6. View trending confessions (based on encrypted scores)
7. Share confessions via link
8. Report inappropriate content
9. See my submission rate limit status

**As an admin, I want to:**
1. Configure rate limits per address
2. Pause the contract in emergencies
3. View aggregate metrics without seeing plaintext
4. Configure decryption oracle policies
5. Review flagged confessions (metadata only)
6. Monitor gas costs and contract health

### 8.2 Core Features

#### **Feature 1: Encrypted Confession Submission**

**Flow:**
1. User clicks "Create Confession" CTA
2. Modal opens with form
3. User types confession (max 500 chars)
4. Character counter updates in real-time
5. Click "Confess Anonymously"
6. Client-side encryption (FHEVM library)
7. Transaction prompt via wallet
8. User approves transaction
9. Loading state: "Encrypting..." → "Submitting..."
10. Transaction confirmed on-chain
11. Success toast with transaction hash
12. Redirect to home feed with new confession visible

**Edge Cases:**
- Empty confession: Disable submit, show error
- Over character limit: Disable submit, red counter
- Rate limited: Show countdown, disable submit
- Network error: Retry button, error toast
- Wallet rejection: Cancel gracefully, return to form

#### **Feature 2: Encrypted Upvoting**

**Flow:**
1. User clicks upvote button on confession card
2. If not connected: Prompt wallet connection
3. If already upvoted: Show toast "Already upvoted"
4. Transaction prompt with encrypted increment
5. User approves
6. Button shows loading spinner
7. Transaction confirmed
8. Button animates (heart burst, particle effect)
9. Count updates (still encrypted or "🔒 Hidden")
10. Button enters active/filled state

**Edge Cases:**
- Double voting: Prevent via contract mapping check
- Transaction fail: Show error, revert UI state
- Network congestion: Show pending toast, allow cancel

#### **Feature 3: Confession Feed & Filtering**

**Default View:**
- All confessions, reverse chronological
- Infinite scroll, load 20 per page
- Skeleton loaders while fetching

**Filters:**
- **Recent**: Last 24 hours
- **Trending**: Highest encrypted votes (leaderboard)
- **All**: No time filter

**Sorting:**
- Newest first (default)
- Oldest first
- Most upvoted (encrypted scores)

**Search:**
- Future feature: Search encrypted metadata only (not content)

#### **Feature 4: Admin Console**

**Tabs:**

1. **Overview Dashboard**
   - Total confessions count
   - Total upvotes (encrypted aggregate)
   - Active users (unique addresses)
   - Gas spent (read from contract)
   - Recent activity feed

2. **Rate Limits**
   - Set cooldown period (seconds)
   - Default: 300s (5 minutes)
   - Apply globally to all addresses
   - Override for specific addresses

3. **Decryption Oracle**
   - Enable/disable oracle for leaderboard
   - Set decryption policies:
     - Time-bounded: Only confessions older than X hours
     - Threshold: Only if votes > Y
     - Admin-only: Require admin signature
   - View pending decryption requests

4. **Moderation**
   - Flagged confessions list (metadata only)
   - Ban address (prevent future submissions)
   - Emergency pause contract

5. **Analytics**
   - Confessions over time (line chart)
   - Upvotes distribution (bar chart)
   - Gas costs trend
   - Network health status

### 8.3 Non-Functional Requirements

#### **Performance**
- **Page Load**: < 2s on 4G (Lighthouse score > 90)
- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Contract gas usage**: Optimized, < 200k gas per confession

#### **Security**
- No plaintext storage anywhere
- Input sanitization (prevent XSS)
- Rate limiting enforced on-chain
- Admin functions: Access control (Ownable)
- No branching on encrypted values (FHE security)
- Secure RPC connections (HTTPS only)

#### **Privacy**
- Zero plaintext logs (client or server)
- No analytics tracking PII
- Wallet address only identifier (pseudonymous)
- Optional IPFS for content (no centralized storage)
- Decryption oracle: Aggregate outputs only

#### **Scalability**
- Frontend: Static site, CDN-distributed
- Contract: Gas-optimized, no storage bloat
- Handle 10,000+ confessions gracefully
- Pagination for large datasets

#### **Maintainability**
- TypeScript strict mode
- Comprehensive inline comments
- Component documentation (Storybook optional)
- Git commit conventions (Conventional Commits)
- CI/CD: Automated tests on PR

---

## 9. FHEVM Integration Details

### 9.1 Library Installation

**Contracts:**
```bash
npm install fhevm-contracts --save
```

**Frontend:**
```bash
npm install fhevmjs --save
```

### 9.2 Contract Configuration

**hardhat.config.ts:**
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
```

### 9.3 Contract Implementation Example

**ConfessionVault.sol (Key Sections):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfessionVault is Ownable, GatewayCaller {
    using TFHE for *;

    struct Confession {
        ebytes encryptedMessage;
        euint32 encryptedVotes;
        euint64 encryptedCreatedAt;
        address author;
        bytes32 ipfsCID;
        bool exists;
    }

    mapping(uint256 => Confession) public confessions;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    mapping(address => uint256) public lastSubmissionTime;
    
    uint256 public confessionCount;
    uint256 public rateLimitCooldown = 300; // 5 minutes
    bool public paused;

    event ConfessionSubmitted(uint256 indexed id, address indexed author);
    event ConfessionUpvoted(uint256 indexed id, address indexed voter);
    event RateLimitUpdated(uint256 newCooldown);

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function submitConfession(
        bytes calldata _encryptedMessage
    ) external notPaused returns (uint256) {
        require(
            block.timestamp >= lastSubmissionTime[msg.sender] + rateLimitCooldown,
            "Rate limit active"
        );

        confessionCount++;
        uint256 id = confessionCount;

        // Initialize encrypted values
        euint32 initialVotes = TFHE.asEuint32(0);
        euint64 timestamp = TFHE.asEuint64(block.timestamp);

        confessions[id] = Confession({
            encryptedMessage: TFHE.asEbytes(_encryptedMessage),
            encryptedVotes: initialVotes,
            encryptedCreatedAt: timestamp,
            author: msg.sender,
            ipfsCID: bytes32(0),
            exists: true
        });

        lastSubmissionTime[msg.sender] = block.timestamp;

        emit ConfessionSubmitted(id, msg.sender);
        return id;
    }

    function upvote(uint256 _id, bytes calldata _encryptedOne) external notPaused {
        require(confessions[_id].exists, "Confession does not exist");
        require(!hasUpvoted[_id][msg.sender], "Already upvoted");

        euint32 one = TFHE.asEuint32(_encryptedOne);
        confessions[_id].encryptedVotes = TFHE.add(
            confessions[_id].encryptedVotes,
            one
        );

        hasUpvoted[_id][msg.sender] = true;

        emit ConfessionUpvoted(_id, msg.sender);
    }

    // Admin functions
    function updateRateLimit(uint256 _newCooldown) external onlyOwner {
        rateLimitCooldown = _newCooldown;
        emit RateLimitUpdated(_newCooldown);
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    // View functions return encrypted data
    function getConfession(uint256 _id) external view returns (Confession memory) {
        require(confessions[_id].exists, "Confession does not exist");
        return confessions[_id];
    }
}
```

### 9.4 Frontend Integration Example

**lib/fhevm.ts:**
```typescript
import { createInstance } from 'fhevmjs';

let fhevmInstance: any = null;

export async function initFhevm() {
  if (!fhevmInstance) {
    fhevmInstance = await createInstance({
      chainId: 11155111, // Sepolia
      publicKey: process.env.NEXT_PUBLIC_FHE_PUBLIC_KEY!
    });
  }
  return fhevmInstance;
}

export async function encryptText(text: string) {
  const instance = await initFhevm();
  const encrypted = instance.encrypt32(text);
  return encrypted;
}

export async function encryptUint32(value: number) {
  const instance = await initFhevm();
  const encrypted = instance.encrypt32(value);
  return encrypted;
}
```

**hooks/useConfession.ts:**
```typescript
import { useContractWrite } from 'wagmi';
import { encryptText } from '@/lib/fhevm';

export function useSubmitConfession() {
  const { writeAsync } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS,
    abi: ConfessionVaultABI,
    functionName: 'submitConfession'
  });

  const submit = async (plaintext: string) => {
    const encrypted = await encryptText(plaintext);
    const tx = await writeAsync({ args: [encrypted] });
    return tx;
  };

  return { submit };
}
```

---

## 10. Environment Variables

### 10.1 Contract Environment (.env in contracts/)
```bash
# Network RPC
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Deployment wallet
PRIVATE_KEY=your_private_key_here

# Block explorer verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: IPFS
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

### 10.2 Frontend Environment (.env.local in frontend/)
```bash
# Contract address (set after deployment)
NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=0x...

# Network
NEXT_PUBLIC_CHAIN_ID=11155111

# FHE public key (from Zama docs)
NEXT_PUBLIC_FHE_PUBLIC_KEY=your_fhe_public_key

# RPC endpoint
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# WalletConnect project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Analytics (privacy-preserving)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=confessions.example.com

# Optional: IPFS gateway
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 11. Testing Requirements

### 11.1 Smart Contract Tests

**Test Suite (Hardhat):**

1. **Deployment Tests**
   - Contract deploys successfully
   - Owner is set correctly
   - Initial state is correct (count = 0, not paused)

2. **Confession Submission Tests**
   - Submit valid encrypted confession
   - Verify confession count increments
   - Verify event emission
   - Test rate limiting (should fail if too soon)
   - Test when paused (should revert)

3. **Upvote Tests**
   - Upvote valid confession
   - Verify encrypted votes increment (via decryption in test)
   - Test double-voting prevention
   - Test upvoting non-existent confession (should revert)

4. **Admin Tests**
   - Update rate limit (owner only)
   - Pause/unpause contract (owner only)
   - Non-owner attempts (should revert)

5. **FHE Operations Tests**
   - Encrypt and add encrypted values
   - Verify no plaintext leakage
   - Test encrypted timestamp storage

**Coverage Target:** > 90%

### 11.2 Frontend Tests

**Test Types:**

1. **Unit Tests (Jest + RTL)**
   - Component rendering
   - Props handling
   - Event handlers
   - Utility functions

2. **Integration Tests (Playwright)**
   - Wallet connection flow
   - Confession submission end-to-end
   - Upvote interaction
   - Theme toggle
   - Navigation between pages

3. **Accessibility Tests**
   - Axe-core integration
   - Keyboard navigation
   - Screen reader compatibility

**Key Test Cases:**
- Connect wallet → wallet connected state shown
- Submit confession → success toast → new confession in feed
- Upvote → animation plays → button enters active state
- Toggle theme → UI updates → preference persisted
- Mobile navigation → hamburger menu → items accessible

---

## 12. Deployment Instructions

### 12.1 Contract Deployment

**Steps:**
1. Navigate to contracts directory
2. Set up `.env` with private key and RPC URL
3. Compile contracts: `npm run compile`
4. Run tests: `npm run test`
5. Deploy to Sepolia: `npm run deploy:sepolia`
6. Verify on Etherscan: `npx hardhat verify --network sepolia <CONTRACT_ADDRESS>`
7. Copy deployed address to frontend `.env.local`

**Deployment Script (scripts/deploy.ts):**
```typescript
import { ethers } from "hardhat";

async function main() {
  const ConfessionVault = await ethers.getContractFactory("ConfessionVault");
  const vault = await ConfessionVault.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("ConfessionVault deployed to:", address);
  
  // Save to file for frontend
  const fs = require('fs');
  fs.writeFileSync(
    '../frontend/.env.local',
    `NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=${address}\n`,
    { flag: 'a' }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 12.2 Frontend Deployment (Vercel)

**Prerequisites:**
- GitHub repository with code
- Vercel account connected to GitHub

**Steps:**
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel settings:
   - `NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_FHE_PUBLIC_KEY`
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy: Vercel auto-deploys on push to main
5. Custom domain (optional): Add in Vercel settings

**Build Configuration:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 12.3 Alternative: Netlify

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS = "0x..."
  NEXT_PUBLIC_CHAIN_ID = "11155111"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 13. Documentation Requirements

### 13.1 README.md Structure

```markdown
# Web3 Confessions - Privacy-Preserving Confession Platform

## Overview
Brief description, key features, tech stack

## Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH

## Installation

### Contracts
$ cd contracts
$ npm install
$ cp .env.example .env
# Edit .env with your keys
$ npm run compile
$ npm run deploy:sepolia

### Frontend
$ cd frontend
$ npm install
$ cp .env.example .env.local
# Add contract address from deployment
$ npm run dev

## Usage
- Connect wallet
- Create encrypted confession
- Upvote confessions
- View leaderboard

## Architecture
High-level diagram, contract structure

## Testing
$ npm run test (contracts)
$ npm run test:ui (frontend)

## Deployment
Vercel/Netlify instructions

## Contributing
Guidelines, code style

## License
MIT
```

### 13.2 Inline Code Comments

**Standard:**
- Every function: Purpose, parameters, return value
- Complex logic: Step-by-step explanation
- Magic numbers: Explain constants
- Security considerations: Highlight critical sections

**Example:**
```typescript
/**
 * Encrypts plaintext confession and submits to contract
 * @param plaintext - User's confession (max 500 chars)
 * @returns Transaction hash if successful
 * @throws Error if rate limited or encryption fails
 */
async function submitConfession(plaintext: string): Promise<string> {
  // Validate input length
  if (plaintext.length > 500) {
    throw new Error('Confession exceeds maximum length');
  }

  // Client-side encryption using FHEVM
  const encrypted = await encryptText(plaintext);

  // Submit to smart contract
  const tx = await contract.submitConfession(encrypted);
  
  // Wait for confirmation
  await tx.wait();
  
  return tx.hash;
}
```

### 13.3 API Documentation (if backend added)

If adding a caching layer or API:
- OpenAPI/Swagger spec
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Rate limits

---

## 14. Success Metrics & KPIs

### 14.1 Technical Metrics
- **Page Load Time**: < 2s (target)
- **Transaction Success Rate**: > 95%
- **Gas Efficiency**: < 200k gas per confession
- **Uptime**: > 99.5% (frontend)

### 14.2 User Engagement
- Daily active users (unique addresses)
- Confessions per day
- Upvotes per confession (average)
- Return rate (users submitting multiple confessions)

### 14.3 Privacy Metrics
- Zero plaintext logs (audit)
- Encryption success rate: 100%
- No decryption oracle misuse (monitor requests)

---

## 15. Future Enhancements (Phase 2)

### 15.1 Planned Features
1. **Threaded Comments**: Reply to confessions (encrypted)
2. **Categories/Tags**: Filter by topic (encrypted tags)
3. **User Profiles**: Anonymous reputation scores
4. **Tipping**: Send crypto to confession authors
5. **NFT Minting**: Turn top confessions into NFTs
6. **Mobile App**: React Native wrapper
7. **Multi-chain**: Expand beyond Sepolia

### 15.2 Advanced FHE Features
- Encrypted search (approximate matching)
- Encrypted recommendation engine
- Private analytics dashboard
- Threshold decryption (multi-sig for sensitive data)

---

## 16. Risk Assessment & Mitigation

### 16.1 Technical Risks

**Risk: FHEVM Library Breaking Changes**
- Mitigation: Pin specific versions, monitor Zama updates
- Fallback: Maintain test suite for regression detection

**Risk: Gas Costs Too High**
- Mitigation: Optimize contract, batch operations
- Fallback: Subsidize gas for early users

**Risk: Frontend Vulnerabilities (XSS, CSRF)**
- Mitigation: Input sanitization, CSP headers, security audits
- Fallback: Bug bounty program

### 16.2 Privacy Risks

**Risk: Metadata Leakage**
- Mitigation: No plaintext logs, anonymous identifiers only
- Monitoring: Regular privacy audits

**Risk: Decryption Oracle Misuse**
- Mitigation: Strict policies, admin-only, rate limits
- Fallback: Disable oracle if abuse detected

### 16.3 User Experience Risks

**Risk: Wallet Connection Complexity**
- Mitigation: Clear onboarding, network auto-switch
- Support: FAQ, video tutorials

**Risk: Slow Transaction Times**
- Mitigation: Show loading states, allow cancellation
- UX: Optimistic UI updates

---

## 17. Compliance & Legal

### 17.1 Data Privacy
- **GDPR**: No PII collected, wallet addresses pseudonymous
- **CCPA**: No California user tracking
- **Privacy Policy**: Required, link in footer

### 17.2 Content Moderation
- User reporting mechanism
- Admin review queue (metadata only)
- Terms of Service: Prohibited content list
- DMCA compliance (if applicable)

### 17.3 Disclaimers
- "Use at your own risk" notice
- No warranty on encryption security
- Not responsible for user-generated content
- Sepolia testnet only (no real value)

---

## 18. Support & Maintenance

### 18.1 User Support Channels
- Discord community
- GitHub issues (technical)
- Email support (abuse reports)
- FAQ page

### 18.2 Monitoring
- **Frontend**: Vercel analytics, error tracking (Sentry)
- **Contract**: Etherscan alerts, gas monitoring
- **Uptime**: StatusPage or custom dashboard

### 18.3 Maintenance Schedule
- Weekly dependency updates
- Monthly security audits
- Quarterly feature releases
- Continuous bug fixes

---

## 19. Acceptance Criteria

### 19.1 Definition of Done

**Contract:**
- [ ] Deployed to Sepolia testnet
- [ ] Verified on Etherscan
- [ ] All tests passing (>90% coverage)
- [ ] Gas optimized (<200k per confession)
- [ ] Admin functions working
- [ ] No plaintext storage

**Frontend:**
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Dark/light theme functional
- [ ] Wallet connection working (RainbowKit)
- [ ] Confession submission flow complete
- [ ] Upvote interaction working
- [ ] Admin console accessible
- [ ] Animations smooth (60fps)
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Lighthouse score > 90

**Documentation:**
- [ ] README with setup instructions
- [ ] Inline code comments
- [ ] Environment variable guide
- [ ] Deployment guide
- [ ] Architecture diagram

**Testing:**
- [ ] Contract tests: >90% coverage
- [ ] Frontend unit tests
- [ ] E2E tests (key user flows)
- [ ] Manual QA on 3 browsers

**Deployment:**
- [ ] Deployed to Vercel/Netlify
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] SSL certificate active

---

## 20. Development Timeline (Estimate)

### Phase 1: Foundation (Week 1)
- [ ] Project setup (monorepo, dependencies)
- [ ] Smart contract skeleton
- [ ] Frontend boilerplate (Next.js)
- [ ] Design system setup (Tailwind config)

### Phase 2: Core Features (Week 2-3)
- [ ] Smart contract: Confession submission, upvoting
- [ ] Frontend: Wallet connection, confession form
- [ ] Frontend: Confession feed, card component
- [ ] Encryption integration (FHEVM)

### Phase 3: Polish (Week 4)
- [ ] Admin console
- [ ] Animations and micro-interactions
- [ ] Responsive design refinement
- [ ] Accessibility improvements

### Phase 4: Testing & Deploy (Week 5)
- [ ] Write comprehensive tests
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deploy to Sepolia + Vercel
- [ ] Launch 🚀

---

## 21. References & Resources

### 21.1 Official Documentation
- **Zama FHEVM**: https://docs.zama.ai/fhevm/
- **FHEVM GitHub**: https://github.com/zama-ai/fhevm
- **Hardhat Template**: https://github.com/zama-ai/fhevm-hardhat-template
- **React Template**: https://github.com/zama-ai/fhevm-react-template

### 21.2 Web3 Tools
- **wagmi**: https://wagmi.sh/
- **viem**: https://viem.sh/
- **RainbowKit**: https://www.rainbowkit.com/

### 21.3 Design Resources
- **shadcn/ui**: https://ui.shadcn.com/
- **TailwindCSS**: https://tailwindcss.com/
- **Framer Motion**: https://www.framer.com/motion/

### 21.4 Learning Resources
- Zama blog: https://www.zama.ai/blog
- Ethereum dev docs: https://ethereum.org/en/developers/
- FHE explainer videos: Search "Fully Homomorphic Encryption"

---

## 22. Contact & Contribution

### 22.1 Project Maintainers
- Lead Developer: [Your Name/Team]
- Contract Auditor: [If applicable]
- Design Lead: [If applicable]

### 22.2 Contribution Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow code style (Prettier + ESLint)
4. Write tests for new features
5. Commit with conventional commits
6. Open Pull Request with description

### 22.3 Code of Conduct
- Be respectful and inclusive
- Constructive feedback only
- No harassment or discrimination
- Privacy-first mindset

---

**End of PRD**

---

**Approval Sign-off:**
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Design Lead
- [ ] Security Auditor

**Version History:**
- v1.0 (2025-10-25): Initial comprehensive PRD
