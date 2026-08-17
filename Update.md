# UI/UX Redesign Prompt — Chat App

## Project Context
This is a real-time chat application built with **Next.js, Tailwind CSS, Node.js, Express, and MongoDB**. It currently has these screens: Login/Signup, Chat List + Conversation view, and Profile.

## Scope Constraint (IMPORTANT)
Do **NOT** add new features, pages, or components. Only redesign and improve the **existing** modules — Login, Signup, Chat List sidebar, Chat conversation window, Message bubbles, Profile page, Navbar/header. Keep all existing functionality, routes, API calls, and state logic exactly as-is. This is a **pure visual/UX/responsiveness upgrade**.

---

## 1. Current Design Reference (extracted from screenshots)

Use these as the **starting palette** for dark mode — refine/adjust for better contrast and consistency, don't treat them as pixel-perfect requirements:

| Token | Approx. Hex | Usage |
|---|---|---|
| `bg-base` (dark) | `#0B1120` | App background |
| `bg-surface` (dark) | `#1A2332` | Cards, sidebar, chat panel |
| `bg-input` | `#E8EEFB` | Input fields (currently light even in dark mode — fix this, see below) |
| `accent-primary` | `#2563EB` / `#1D4ED8` | Primary buttons (Login, Send, Edit Profile) |
| `accent-link` | `#60A5FA` | Links ("Signup", User ID text) |
| `text-primary` (dark) | `#F1F5F9` | Headings, main text |
| `text-secondary` (dark) | `#94A3B8` | Timestamps, muted labels, placeholders |
| `avatar-fallback` | `#2563EB` | Circular avatar initials background |
| `border-subtle` | `#2A3548` | Dividers, card borders |

**Known issue to fix:** Input fields (login email/password) currently use a light/white fill even in dark mode, which breaks visual consistency. Redesign inputs to use a dark, subtly-bordered style (e.g., `bg-surface` with `border-subtle`, focus ring in `accent-primary`) instead of a flat light box.

### Light theme (new — must be designed, not just inverted)
| Token | Suggested Hex | Usage |
|---|---|---|
| `bg-base` (light) | `#F8FAFC` | App background |
| `bg-surface` (light) | `#FFFFFF` | Cards, sidebar, chat panel |
| `text-primary` (light) | `#0F172A` | Headings, main text |
| `text-secondary` (light) | `#64748B` | Timestamps, muted labels |
| `border-subtle` (light) | `#E2E8F0` | Dividers, card borders |
| `accent-primary` (light) | `#2563EB` | Keep same accent blue across both themes for brand consistency |

---

## 2. Visual Design Direction
- Modern, clean, minimal aesthetic — generous whitespace, soft shadows, subtle rounded corners (`rounded-xl`/`rounded-2xl`), no visual clutter.
- Keep the current dark navy/blue identity as the base for dark mode, but refine it: consistent spacing scale, subtle glassmorphism on cards (login card, profile card) rather than flat fills.
- Improve visual hierarchy: clearer typographic scale (headings vs body vs meta text like timestamps), consistent use of `text-secondary` for labels/timestamps.
- Add smooth micro-interactions: hover/active states on buttons, list items, and avatars; subtle transitions (150–250ms) on theme switch, message send, and navigation.
- **Message bubbles:** differentiate sent vs received more clearly (color, alignment, tail/shape). Sent messages currently use `accent-primary` blue on the right — keep this pattern but improve contrast/readability. Improve timestamp placement and spacing between consecutive messages from the same sender.
- **Sidebar chat list:** add hover/active state for the selected conversation, unread indicators if supported by existing data, better avatar/text alignment and consistent row height.

## 3. Light + Dark Theme
- Add a theme toggle button (sun/moon icon) in the top navbar/header, visible on all screens (Login, Chat, Profile).
- Use Tailwind's `dark:` class strategy (class-based dark mode via `darkMode: 'class'` in `tailwind.config`), not media-query based, so it can be toggled manually.
- Persist theme choice in `localStorage`; respect system preference (`prefers-color-scheme`) on first load only.
- Every existing component (login form, chat list, chat bubbles, profile card, buttons, inputs) must have both light and dark variants — no unstyled/broken states in either mode.
- Fix the input-field inconsistency noted above so inputs look intentional in both themes, not just "light box on dark background."

## 4. Responsiveness (Mobile / Tablet / Desktop)
- **Mobile (< 640px):** Chat list and conversation view behave like a stack — show chat list full-width by default; tapping a user navigates to a full-screen conversation view with a back button (WhatsApp-style mobile layout). Login/Signup/Profile cards go full-width with proper padding, no fixed desktop widths.
- **Tablet (640–1024px):** Sidebar + chat view coexist, but with a narrower sidebar; adjust padding/font sizes.
- **Desktop (> 1024px):** Keep the current two-pane layout (sidebar + chat window) but refine proportions, max-widths, and centering for large screens (avoid content stretching edge-to-edge on ultra-wide monitors).
- Ensure touch targets (buttons, list items) are at least 44px tall on mobile.
- Message input bar stays properly anchored/sticky at the bottom on all breakpoints, with safe-area padding for mobile devices (notch/home-indicator).
- Fix any overflow issues in chat message containers (scroll behavior, long message wrapping).

## 5. Specific Component Notes
- **Login/Signup:** Center card, refine input field styling (focus states, subtle border instead of flat light fill), improve button states (loading/disabled), better spacing between elements.
- **Chat List (sidebar):** Improve search bar styling ("Search by email or user ID"), add subtle dividers or card-based list items, clear selected-state highlight, better empty state.
- **Chat Window:** Refine header (avatar + name + email), improve message bubble spacing/grouping, polish the "+" attachment button and Send button alignment on mobile.
- **Profile Page:** Improve avatar upload (camera icon) button visibility/placement, refine "Edit Profile" button and User ID display styling for both themes — User ID box should feel like a secondary/muted element, not compete visually with the primary content.

## 6. Technical Implementation Notes
- Use Tailwind config to define a consistent design token set (colors, spacing, radius, shadows) reused across components — avoid hardcoded one-off hex values in JSX.
- Keep component file structure and prop/data interfaces unchanged; only modify JSX `className`/styling.
- If no theme provider exists yet, create a minimal `ThemeProvider`/`useTheme` hook (React context + localStorage) to toggle the `dark` class on `<html>`.
- No changes to Express/Node/MongoDB backend logic, API contracts, or data models.

---

## Deliverable
Updated styling across existing components/pages only, fully responsive across mobile/tablet/desktop, with a working light/dark theme toggle using the palette above — no new features, no new pages, no changed backend logic.