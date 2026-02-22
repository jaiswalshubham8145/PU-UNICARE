/**
 * Centralized Error Handling & Logging System
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorLog {
    message: string
    severity: ErrorSeverity
    context?: Record<string, unknown>
    timestamp: Date
    userId?: string
    stackTrace?: string
}

class ErrorMonitor {
    private static instance: ErrorMonitor
    private errors: ErrorLog[] = []
    private maxLogs = 100

    private constructor() {
        // Initialize error monitoring
        if (typeof window !== 'undefined') {
            window.addEventListener('error', this.handleGlobalError.bind(this))
            window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
        }
    }

    static getInstance(): ErrorMonitor {
        if (!ErrorMonitor.instance) {
            ErrorMonitor.instance = new ErrorMonitor()
        }
        return ErrorMonitor.instance
    }

    private handleGlobalError(event: ErrorEvent) {
        this.logError({
            message: event.message,
            severity: 'high',
            context: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            },
            timestamp: new Date(),
            stackTrace: event.error?.stack
        })
    }

    private handleUnhandledRejection(event: PromiseRejectionEvent) {
        this.logError({
            message: `Unhandled Promise Rejection: ${event.reason}`,
            severity: 'high',
            timestamp: new Date(),
            stackTrace: event.reason?.stack
        })
    }

    logError(error: ErrorLog) {
        console.error(`[${error.severity.toUpperCase()}] ${error.message}`, error.context)

        this.errors.push(error)

        // Keep only recent errors
        if (this.errors.length > this.maxLogs) {
            this.errors.shift()
        }

        // Send critical errors to backend
        if (error.severity === 'critical') {
            this.reportToBackend(error)
        }
    }

    private async reportToBackend(error: ErrorLog) {
        try {
            // In production, send to error tracking service (Sentry, LogRocket, etc.)
            await fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            })
        } catch (e) {
            console.error('Failed to report error to backend:', e)
        }
    }

    getRecentErrors(): ErrorLog[] {
        return [...this.errors]
    }

    clearErrors() {
        this.errors = []
    }
}

export const errorMonitor = ErrorMonitor.getInstance()

/**
 * Utility function to wrap async operations with error handling
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    severity: ErrorSeverity = 'medium'
): Promise<T | null> {
    try {
        return await operation()
    } catch (error) {
        errorMonitor.logError({
            message: `Error in ${context}: ${error instanceof Error ? error.message : String(error)}`,
            severity,
            timestamp: new Date(),
            stackTrace: error instanceof Error ? error.stack : undefined,
            context: { operation: context }
        })
        return null
    }
}

/**
 * React Error Boundary Component
 */
import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
        errorMonitor.logError({
            message: error.message,
            severity: 'critical',
            timestamp: new Date(),
            stackTrace: error.stack,
            context: {
                componentStack: errorInfo.componentStack
            }
        })
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-muted-foreground mb-4">
                            We're sorry for the inconvenience. The error has been logged and our team will look into it.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
