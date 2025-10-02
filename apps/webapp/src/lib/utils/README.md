# Date Utils

This directory contains utility functions for date and time handling in the application.

## Migration from date-fns to Luxon

We migrated from date-fns to Luxon for more comprehensive date handling capabilities. Here's a guide to help with the transition:

### Key Benefits of Luxon

- Better timezone handling
- Comprehensive formatting options
- Improved internationalization support
- Immutable date objects
- More consistent API

### Common Use Cases and Examples

#### 1. Formatting Dates

```typescript
// OLD (date-fns)
import { format } from 'date-fns';
format(new Date(timestamp), 'PPP');

// NEW (Luxon via our utility)
import { formatDate } from '@/lib/utils/date';
formatDate(timestamp, "FULL_DATE");
```

#### 2. Date Operations

```typescript
// Creating dates
import { createDate } from '@/lib/utils/date';
const date = createDate(2023, 4, 20);  // April 20, 2023

// Adding time
import { addToDate } from '@/lib/utils/date';
const nextMonth = addToDate(date, { months: 1 });
const nextWeek = addToDate(date, { days: 7 });

// Comparing dates
import { compareDate } from '@/lib/utils/date';
const isBefore = compareDate(date1, date2) < 0;
const isAfter = compareDate(date1, date2) > 0;
const isEqual = compareDate(date1, date2) === 0;
```

#### 3. Working with DateTime objects

```typescript
import { parseToDateTime, now } from '@/lib/utils/date';

// Get current time
const currentTime = now();

// Convert various formats to DateTime
const dt1 = parseToDateTime(new Date());
const dt2 = parseToDateTime("2023-04-20T15:30:00");
const dt3 = parseToDateTime(1682012400000);  // timestamp

// Use Luxon's DateTime methods directly
console.log(dt1.toISO());
console.log(dt1.toRelative());  // "2 days ago"
```

### Available Format Types

Our `formatDate` function supports the following predefined formats:

- `FULL_DATE`: "April 20, 2023" (equivalent to date-fns 'PPP')
- `SHORT_DATE`: "04/20/2023"
- `DATE_TIME`: "April 20, 2023 at 2:30 PM"
- `TIME`: "2:30 PM"

For custom formats, use `formatDateCustom` with a Luxon format string.

### Custom Formatting

```typescript
import { formatDateCustom } from '@/lib/utils/date';

// Custom format
formatDateCustom(date, "yyyy-MM-dd");  // "2023-04-20"
formatDateCustom(date, "ccc, LLL d");  // "Thu, Apr 20"
```

## Best Practices

1. Always use the date utility functions instead of direct Luxon or built-in JavaScript Date methods
2. Use the predefined format types for consistency
3. When needed, convert to DateTime using `parseToDateTime` for more advanced operations 