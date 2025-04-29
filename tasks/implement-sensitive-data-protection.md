# Task: Implement Sensitive Data Protection in rd-logger

## Overview

Add a robust mechanism to rd-logger that makes it impossible to accidentally log sensitive information such as API keys, passwords, tokens, and other credentials.
 
## Background

During development of the OpenBadges Modular Server, we identified a security risk where API keys were being logged in plain text. Rather than relying on developer discipline to avoid logging sensitive data, we need a systematic solution that makes it impossible to accidentally log such information.

## Requirements

1. Create a `SensitiveValue<T>` wrapper class/type that:
   - Wraps sensitive values (strings, objects, etc.)
   - Overrides toString(), toJSON(), and inspection methods to return redacted values
   - Provides a controlled method to access the actual value when needed
   - Is immutable to prevent accidental modification

2. Modify the logger's serialization process to:
   - Automatically detect and redact `SensitiveValue` instances
   - Apply pattern-based detection for common sensitive data formats (API keys, tokens, etc.)
   - Work across all logging methods (info, warn, error, debug, etc.)

3. Add explicit opt-in methods for rare cases when logging sensitive data is necessary:
   - Create a `logWithSensitiveData()` method that requires explicit approval information
   - Log additional metadata about who approved the sensitive data logging and why
   - Potentially add special highlighting/marking in the logs for these cases

4. Add comprehensive documentation:
   - Usage examples for the `SensitiveValue` wrapper
   - Best practices for handling sensitive data
   - Explanation of the automatic detection patterns
   - Guidelines for when (if ever) to use the opt-in sensitive data logging

## Implementation Details

### SensitiveValue Class

```typescript
export class SensitiveValue<T> {
  private readonly value: T;
  private readonly redactedValue: string;
  
  constructor(value: T, redactedValue: string = '[REDACTED]') {
    this.value = value;
    this.redactedValue = redactedValue;
  }
  
  public getValue(): T {
    return this.value;
  }
  
  public toString(): string {
    return this.redactedValue;
  }
  
  public toJSON(): string {
    return this.redactedValue;
  }
  
  public [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.redactedValue;
  }
  
  public valueOf(): string {
    return this.redactedValue;
  }
  
  public static from<T>(value: T, redactedValue?: string): SensitiveValue<T> {
    return new SensitiveValue(value, redactedValue);
  }
}
```

### Logger Serialization Modification

Modify the existing serialization logic to:
1. Check if a value is an instance of `SensitiveValue`
2. If it is, use the redacted value instead of the actual value
3. Apply pattern-based detection for values that look like sensitive data

### Pattern Detection

Implement pattern detection for common sensitive data formats:
- API keys (typically containing random alphanumeric characters)
- JWT tokens (three base64-encoded segments separated by periods)
- OAuth tokens
- Passwords
- Credit card numbers
- Social security numbers
- Other PII (Personally Identifiable Information)

### Opt-in Sensitive Data Logging

```typescript
interface SensitiveLoggingApproval {
  reason: string;
  approvedBy: string;
  expiresAt?: Date;
}

// Add to Logger class
logWithSensitiveData(
  message: string, 
  data: Record<string, any>, 
  approval: SensitiveLoggingApproval
): void {
  // Log with special formatting and include approval information
}
```

## Usage Examples

```typescript
import { logger, SensitiveValue } from 'rd-logger';

// Creating an API key
const apiKey = 'api_key_12345';
const sensitiveApiKey = SensitiveValue.from(apiKey);

// Safe logging - will show [REDACTED]
logger.info('Created API key', { key: sensitiveApiKey });

// Accessing the actual value when needed for operations
const actualKey = sensitiveApiKey.getValue();

// If absolutely necessary to log (rare case):
logger.logWithSensitiveData(
  'Debug API key issue', 
  { key: apiKey }, 
  { 
    reason: 'Debugging authentication issue #1234',
    approvedBy: 'Security Team'
  }
);
```

## Testing

1. Unit tests for the `SensitiveValue` class
2. Integration tests for the logger with sensitive data
3. Pattern detection tests with various formats of sensitive data
4. Edge cases (null values, nested sensitive data, arrays of sensitive data)

## Security Considerations

1. Ensure that the `SensitiveValue` class cannot be easily circumvented
2. Consider memory safety (how long sensitive values remain in memory)
3. Evaluate the trade-offs of pattern detection (false positives vs. missed sensitive data)
4. Consider adding audit logging for when sensitive data is explicitly logged

## Timeline

- Research and design: 1 day
- Implementation of `SensitiveValue` class: 1 day
- Modification of logger serialization: 1 day
- Pattern detection implementation: 2 days
- Testing and documentation: 2 days
- Code review and refinement: 1 day

Total: 8 days

## Dependencies

- rd-logger core functionality
- TypeScript's type system for type safety

## Success Criteria

1. It should be impossible to accidentally log sensitive data when using the `SensitiveValue` wrapper
2. Common patterns of sensitive data should be automatically detected and redacted
3. Developers should have a clear, explicit way to log sensitive data when absolutely necessary
4. The solution should have minimal performance impact on normal logging operations
