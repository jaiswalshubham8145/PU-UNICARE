// Structured Error Handler for Supabase Edge Functions

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): AppError {
  const statusMap: Record<ErrorCode, number> = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RATE_LIMITED: 429,
    EXTERNAL_SERVICE_ERROR: 502,
    DATABASE_ERROR: 500,
    INTERNAL_ERROR: 500,
  };

  return {
    code,
    message,
    statusCode: statusMap[code],
    details,
    timestamp: new Date().toISOString(),
  };
}

export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common Supabase errors
    if (error.message.includes('JWT')) {
      return createError('UNAUTHORIZED', 'Invalid or expired token');
    }
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return createError('DATABASE_ERROR', 'Table not found');
    }
    if (error.message.includes('duplicate key')) {
      return createError('VALIDATION_ERROR', 'Resource already exists');
    }
    if (error.message.includes('foreign key')) {
      return createError('VALIDATION_ERROR', 'Referenced resource not found');
    }

    return createError('INTERNAL_ERROR', error.message);
  }

  return createError('INTERNAL_ERROR', 'An unknown error occurred');
}

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'statusCode' in error
  );
}

export function logError(error: AppError, context?: Record<string, unknown>) {
  const logEntry = {
    level: error.statusCode >= 500 ? 'error' : 'warn',
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    requestId: error.requestId,
    ...context,
  };

  if (error.statusCode >= 500) {
    console.error(JSON.stringify(logEntry));
  } else {
    console.warn(JSON.stringify(logEntry));
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validation helpers
export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter(f => !data[f] && data[f] !== 0 && data[f] !== false);
  if (missing.length > 0) {
    throw createError('VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError('VALIDATION_ERROR', 'Invalid email format');
  }
}

export function validateUUID(id: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw createError('VALIDATION_ERROR', 'Invalid ID format');
  }
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validateComplaintData(data: Record<string, unknown>): void {
  validateRequired(data, ['title', 'description', 'location', 'department_id', 'category_id', 'priority']);
  
  if (data.title && (data.title as string).length < 3) {
    throw createError('VALIDATION_ERROR', 'Title must be at least 3 characters');
  }
  if (data.description && (data.description as string).length < 10) {
    throw createError('VALIDATION_ERROR', 'Description must be at least 10 characters');
  }
  if (data.priority && !['low', 'medium', 'high', 'critical'].includes(data.priority as string)) {
    throw createError('VALIDATION_ERROR', 'Invalid priority level');
  }
}
