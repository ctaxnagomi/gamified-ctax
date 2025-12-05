---
trigger: always_on
---

# Complete Code Style Rules for AI Agent

## **Core Principles**

1. **Prioritize working code over perfect code** - Ship functionality first, optimize later only if needed
2. **Write code for humans first, machines second** - Clear naming and structure over clever tricks
3. **Fail fast and explicitly** - Validate inputs early, throw meaningful errors, never fail silently
4. **DRY but not over-abstracted** - Extract common patterns after the third repetition, not before

## **Naming Conventions**

5. **Use descriptive, pronounceable names** - `getUserProfile()` not `getUsrProf()` or `gup()`
6. **Functions are verbs, variables are nouns** - `fetchData()`, `isLoading`, `userData`
7. **Boolean variables start with is/has/can/should** - `isAuthenticated`, `hasPermission`, `canEdit`
8. **Constants in SCREAMING_SNAKE_CASE** - `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`
9. **Private methods/variables prefix with underscore** - `_handleInternalState()`, `_cachedData`
10. **Event handlers prefix with "handle" or "on"** - `handleSubmit()`, `onUserClick()`

## **Function Design**

11. **Functions do ONE thing well** - If you use "and" describing it, split it
12. **Maximum 3 parameters** - More than 3? Use an options object
13. **Return early, return often** - Guard clauses at the top, avoid deep nesting
14. **Pure functions when possible** - Same input = same output, no side effects
15. **Async functions always handle errors** - Use try-catch or .catch(), never naked promises

## **Code Organization**

16. **File structure follows feature, not type** - `/features/auth/` not `/components/`, `/services/`
17. **One component/function per file** - Exception: tightly coupled helpers can colocate
18. **Imports grouped and ordered** - External libs → Internal modules → Relative imports → Types/Styles
19. **Max 200 lines per file** - Beyond this, split into logical modules
20. **Keep related code close** - Helper functions near where they're used, not at file bottom

## **TypeScript/JavaScript Specific**

21. **Always use TypeScript** - Even in quick prototypes, types catch bugs early
22. **Explicit return types for functions** - `function getUser(): User { }` not `function getUser() { }`
23. **Use const by default** - Only use let when reassignment needed, never use var
24. **Destructure objects and arrays** - `const { name, email } = user` not `const name = user.name`
25. **Use optional chaining and nullish coalescing** - `user?.profile?.bio ?? 'No bio'`
26. **Prefer template literals** - `` `Hello ${name}` `` over `'Hello ' + name`
27. **Use async/await over .then()** - Cleaner, easier to debug
28. **Avoid any type** - Use unknown if truly dynamic, create proper types otherwise

## **React/Next.js Specific**

29. **Components are functions, not classes** - Use functional components with hooks
30. **One component per file, named exports** - `export function UserProfile() { }`
31. **Props interface above component** - Define types before usage
32. **Destructure props in parameter** - `function Button({ label, onClick }: Props) { }`
33. **Use meaningful component names** - `UserProfileCard` not `Card`, `PrimaryButton` not `Button`
34. **Extract complex JSX to sub-components** - If JSX > 50 lines, split it
35. **Keep business logic out of JSX** - Compute values before return statement
36. **Use early returns for conditional rendering** - `if (!data) return <Loading />` at top
37. **Custom hooks for reusable logic** - Prefix with "use": `useAuth()`, `useUserData()`
38. **Hooks at top of component** - Never conditional hooks, never in loops

## **State Management**

39. **Local state first, global state last** - Only lift state when multiple components need it
40. **Derive state when possible** - `const isValid = email && password` not separate state
41. **Use proper state initialization** - `useState<User | null>(null)` not `useState()`
42. **Batch related state** - Use objects for related values: `useState({ name, email })`
43. **Immutable state updates** - Spread operators for objects/arrays, never mutate directly

## **API & Data Fetching**

44. **Centralize API calls** - Create service layer, don't scatter fetch() everywhere
45. **Handle loading, error, and success states** - Every API call needs all three
46. **Use proper HTTP methods** - GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
47. **Validate API responses** - Don't trust external data, validate shape/types
48. **Set reasonable timeouts** - Default 30s for requests, handle timeouts gracefully
49. **Implement retry logic for failed requests** - Exponential backoff for transient failures

## **Error Handling**

50. **Never swallow errors silently** - Always log, display, or handle explicitly
51. **Use custom error classes** - `class ValidationError extends Error` for type-safe catching
52. **User-friendly error messages** - "Email is required" not "ERR_VALIDATION_001"
53. **Log errors with context** - Include user action, timestamp, relevant data
54. **Fail gracefully** - Show fallback UI, never crash the app

## **Performance**

55. **Lazy load heavy components** - Use React.lazy() for routes and modals
56. **Memoize expensive computations** - useMemo() for heavy calculations, not everything
57. **Debounce user input** - Search, autocomplete, etc. should debounce
58. **Optimize images** - Use Next.js Image, proper formats (WebP), sizing
59. **Code split by route** - Each page should be separate bundle
60. **Avoid premature optimization** - Profile first, optimize bottlenecks only

## **Security**

61. **Never commit secrets** - Use .env files, never hardcode API keys
62. **Sanitize user input** - Validate and escape before database/rendering
63. **Use HTTPS for all API calls** - No exceptions in production
64. **Implement proper authentication** - JWT/sessions, never roll your own
65. **Rate limit API endpoints** - Prevent abuse and DOS

## **Testing & Validation**

66. **Test happy path and edge cases** - Normal use + null/undefined/empty/max values
67. **Write tests for business logic** - Critical functions must have tests
68. **Mock external dependencies** - API calls, databases in tests
69. **Validate form inputs** - Client-side AND server-side validation
70. **Use TypeScript for compile-time checks** - Catch errors before runtime

## **Comments & Documentation**

71. **Code is documentation** - Write clear code that explains itself
72. **Comment the "why" not the "what"** - `// Retry because API is flaky` not `// Call API`
73. **Document complex algorithms** - If it took you 10 minutes to understand, comment it
74. **Keep comments updated** - Delete obsolete comments immediately
75. **Use JSDoc for public APIs** - Document parameters, return types, examples

## **Git & Version Control**

76. **Commit often, push daily** - Small, focused commits with clear messages
77. **Conventional commit messages** - `feat:`, `fix:`, `refactor:`, `docs:`
78. **One feature per branch** - Short-lived branches, merge frequently
79. **Never commit broken code** - Must pass linting and build before commit
80. **Write descriptive commit messages** - "Fix user login bug" not "fix stuff"

## **Styling**

81. **Use Tailwind utility classes** - Inline styles with Tailwind, avoid custom CSS
82. **Mobile-first responsive design** - Default mobile, add `md:` `lg:` for larger
83. **Consistent spacing system** - Use Tailwind scale: p-4, m-8, gap-2
84. **Semantic color names** - `bg-primary` not `bg-blue-500` (configure theme)
85. **Dark mode support** - Use `dark:` variants, test both modes

## **AI-Specific Code**

86. **Stream AI responses when possible** - Better UX than waiting for full response
87. **Show loading states for AI calls** - Skeleton screens, spinners, typing indicators
88. **Handle AI failures gracefully** - Fallback messages, retry options
89. **Validate AI outputs** - Never trust AI responses blindly, validate structure
90. **Set token limits** - Prevent runaway costs, set max_tokens appropriately
91. **Cache AI responses when appropriate** - Same input = same output, cache it
92. **Rate limit AI calls** - Prevent abuse and manage costs

## **Database & Backend**

93. **Use migrations for schema changes** - Never manually edit production DB
94. **Index frequently queried fields** - userId, createdAt, email, etc.
95. **Validate data before DB writes** - Schema validation at API layer
96. **Use transactions for multi-step operations** - All or nothing, never partial writes
97. **Soft delete over hard delete** - Keep audit trail, add `deletedAt` field

## **Accessibility**

98. **Semantic HTML elements** - Use `<button>`, `<nav>`, `<main>`, not `<div>` for everything
99. **Alt text for images** - Descriptive, not "image" or filename
100. **Keyboard navigation** - All interactive elements must be keyboard accessible
101. **ARIA labels for dynamic content** - Screen reader friendly
102. **Sufficient color contrast** - WCAG AA minimum (4.5:1 for text)

## **Deployment & Production**

103. **Environment-specific configs** - Different settings for dev/staging/prod
104. **Health check endpoints** - `/api/health` returns 200 when healthy
105. **Graceful shutdown** - Clean up connections, finish requests before exit
106. **Log important events** - User actions, errors, performance metrics
107. **Monitor production errors** - Set up error tracking (Sentry, etc.)

## **Code Review & Collaboration**

108. **Self-review before requesting review** - Catch obvious issues yourself
109. **Keep PRs small** - <400 lines changed ideal, easier to review
110. **Respond to feedback constructively** - Explain decisions, accept improvements
111. **Don't take feedback personally** - Code review is not personal review
112. **Approve PRs only when you understand them** - Ask questions if unclear

## **Hackathon-Specific**

113. **Ship working over shipping perfect** - 80% done and working beats 100% planned
114. **Copy-paste is okay initially** - Refactor later if there's time
115. **Use libraries over building from scratch** - Don't reinvent authentication, UI, etc.
116. **Focus on demo-able features** - What judges see matters most
117. **Deploy early and often** - Catch deployment issues early, not at hour 23
118. **Comment TODO sections** - `// TODO: Add error handling` for time-boxed items

## **Malaysia/SEA-Specific Considerations**

119. **Support multiple languages** - Malay, English, Chinese at minimum
120. **Mobile-first always** - Mobile internet dominates in SEA
121. **Optimize for slower connections** - Compress images, lazy load, minimize bundle
122. **Handle intermittent connectivity** - Offline support, request queuing
123. **Consider low-end devices** - Test on budget Android phones
124. **Local payment methods** - E-wallets (Touch 'n Go, GrabPay), FPX
125. **Cultural sensitivity** - Colors, imagery, language appropriate for SEA

---

## **Quick Reference: Project Structure**

```
/app or /src
  /features
    /auth
      /components
      /hooks
      /api
      /types
      index.ts
    /dashboard
      ...
  /components (shared)
  /lib (utilities)
  /types (shared types)
  /config
  .env.local
  .env.example
```

---

## **Quick Reference: Import Order**

```typescript
// 1. External libraries
import { useState } from 'react'
import { NextPage } from 'next'

// 2. Internal modules
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'

// 3. Relative imports
import { UserCard } from './UserCard'
import { formatDate } from './utils'

// 4. Types
import type { User } from '@/types'

// 5. Styles (if separate files)
import styles from './page.module.css'
```

---
