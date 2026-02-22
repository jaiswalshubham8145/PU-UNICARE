/**
 * Testing Utilities & Helpers
 * 
 * Comprehensive testing infrastructure including:
 * - Custom render functions with providers
 * - Mock data generators
 * - API mocking utilities
 * - Accessibility testing helpers
 * - Performance testing utilities
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================
// Types
// ============================================

interface WrapperProps {
    children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialRoute?: string;
    queryClient?: QueryClient;
}

// ============================================
// Provider Wrapper
// ============================================

function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

function AllProviders({ children }: WrapperProps): ReactElement {
    const queryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
}

// ============================================
// Custom Render
// ============================================

/**
 * Custom render function with all providers
 */
function customRender(
    ui: ReactElement,
    options?: CustomRenderOptions
): ReturnType<typeof render> & { user: ReturnType<typeof userEvent.setup> } {
    const user = userEvent.setup();

    if (options?.initialRoute) {
        window.history.pushState({}, 'Test page', options.initialRoute);
    }

    return {
        user,
        ...render(ui, { wrapper: AllProviders, ...options }),
    };
}

// ============================================
// Mock Data Generators
// ============================================

/**
 * Generate a mock user
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
    const id = crypto.randomUUID();
    return {
        id,
        email: `user-${id.slice(0, 8)}@test.com`,
        full_name: `Test User ${id.slice(0, 4)}`,
        phone: '+919876543210',
        role: 'faculty',
        department_id: crypto.randomUUID(),
        employee_id: `EMP${id.slice(0, 6).toUpperCase()}`,
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

interface MockUser {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    department_id: string;
    employee_id: string;
    created_at: string;
}

/**
 * Generate a mock complaint
 */
export function createMockComplaint(overrides: Partial<MockComplaint> = {}): MockComplaint {
    const id = crypto.randomUUID();
    const number = Math.floor(Math.random() * 10000);

    return {
        id,
        complaint_number: `CMP-2026-${number.toString().padStart(4, '0')}`,
        title: 'Test Complaint',
        description: 'This is a test complaint description that is detailed enough.',
        location: 'Building A, Room 101',
        status: 'pending',
        priority: 'medium',
        building_id: crypto.randomUUID(),
        department_id: crypto.randomUUID(),
        category_id: crypto.randomUUID(),
        submitted_by: crypto.randomUUID(),
        assigned_to: null,
        approved_by: null,
        image_urls: [],
        expected_resolution: null,
        resolved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

interface MockComplaint {
    id: string;
    complaint_number: string;
    title: string;
    description: string;
    location: string;
    status: string;
    priority: string;
    building_id: string;
    department_id: string;
    category_id: string;
    submitted_by: string;
    assigned_to: string | null;
    approved_by: string | null;
    image_urls: string[];
    expected_resolution: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Generate mock department
 */
export function createMockDepartment(overrides: Partial<MockDepartment> = {}): MockDepartment {
    const id = crypto.randomUUID();
    return {
        id,
        name: 'Computer Science',
        code: 'CSE',
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

interface MockDepartment {
    id: string;
    name: string;
    code: string;
    created_at: string;
}

/**
 * Generate mock building
 */
export function createMockBuilding(overrides: Partial<MockBuilding> = {}): MockBuilding {
    const id = crypto.randomUUID();
    return {
        id,
        name: 'Main Building',
        category: 'Academic',
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

interface MockBuilding {
    id: string;
    name: string;
    category: string;
    created_at: string;
}

/**
 * Generate mock notification
 */
export function createMockNotification(overrides: Partial<MockNotification> = {}): MockNotification {
    const id = crypto.randomUUID();
    return {
        id,
        user_id: crypto.randomUUID(),
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification message.',
        link: null,
        related_complaint_id: null,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

interface MockNotification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    related_complaint_id: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

/**
 * Generate bulk mock data
 */
export function createMockComplaints(count: number): MockComplaint[] {
    return Array.from({ length: count }, (_, index) =>
        createMockComplaint({
            title: `Test Complaint ${index + 1}`,
            complaint_number: `CMP-2026-${(index + 1).toString().padStart(4, '0')}`,
        })
    );
}

// ============================================
// API Mocking
// ============================================

type MockHandler = (url: string, options?: RequestInit) => Promise<Response>;

const mockHandlers: Map<string, MockHandler> = new Map();

/**
 * Register a mock handler for a URL pattern
 */
export function mockAPI(urlPattern: string, handler: MockHandler): () => void {
    mockHandlers.set(urlPattern, handler);
    return () => mockHandlers.delete(urlPattern);
}

/**
 * Create a successful JSON response
 */
export function mockResponse<T>(data: T, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Create an error response
 */
export function mockErrorResponse(message: string, status: number = 500): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Delay utility for simulating network latency
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Accessibility Testing
// ============================================

/**
 * Check for basic accessibility issues
 */
export async function checkA11y(container: HTMLElement): Promise<A11yReport> {
    const issues: A11yIssue[] = [];

    // Check for missing alt text
    const images = container.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        issues.push({
            type: 'error',
            rule: 'image-alt',
            message: 'Image missing alt attribute',
            element: img.outerHTML.slice(0, 100),
        });
    });

    // Check for empty buttons
    const emptyButtons = container.querySelectorAll('button:empty:not([aria-label])');
    emptyButtons.forEach(btn => {
        issues.push({
            type: 'error',
            rule: 'button-name',
            message: 'Button has no accessible name',
            element: btn.outerHTML,
        });
    });

    // Check for missing form labels
    const inputsWithoutLabels = container.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([aria-label]):not([aria-labelledby])'
    );
    inputsWithoutLabels.forEach(input => {
        const id = input.getAttribute('id');
        if (!id || !container.querySelector(`label[for="${id}"]`)) {
            issues.push({
                type: 'error',
                rule: 'input-label',
                message: 'Form input missing label',
                element: input.outerHTML,
            });
        }
    });

    // Check for positive tabindex
    const positiveTabindex = container.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
    positiveTabindex.forEach(el => {
        const tabindex = el.getAttribute('tabindex');
        if (tabindex && parseInt(tabindex) > 0) {
            issues.push({
                type: 'warning',
                rule: 'tabindex',
                message: 'Positive tabindex can disrupt expected focus order',
                element: el.outerHTML.slice(0, 100),
            });
        }
    });

    // Check heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
            issues.push({
                type: 'warning',
                rule: 'heading-order',
                message: `Heading level skipped from h${lastLevel} to h${level}`,
                element: heading.outerHTML.slice(0, 100),
            });
        }
        lastLevel = level;
    });

    return {
        passes: issues.filter(i => i.type === 'error').length === 0,
        issues,
        summary: {
            errors: issues.filter(i => i.type === 'error').length,
            warnings: issues.filter(i => i.type === 'warning').length,
        },
    };
}

interface A11yIssue {
    type: 'error' | 'warning';
    rule: string;
    message: string;
    element: string;
}

interface A11yReport {
    passes: boolean;
    issues: A11yIssue[];
    summary: {
        errors: number;
        warnings: number;
    };
}

// ============================================
// Component Testing Helpers
// ============================================

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingToComplete(): Promise<void> {
    await waitFor(() => {
        const progressbar = screen.queryByRole('progressbar');
        if (progressbar) {
            throw new Error('Loading indicator still present');
        }
    });
}

/**
 * Check if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.offsetParent !== null
    );
}

/**
 * Get form values
 */
export function getFormValues(form: HTMLFormElement): Record<string, string> {
    const formData = new FormData(form);
    const values: Record<string, string> = {};
    formData.forEach((value, key) => {
        values[key] = value.toString();
    });
    return values;
}

/**
 * Fill form with values
 */
export async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    values: Record<string, string>
): Promise<void> {
    for (const [name, value] of Object.entries(values)) {
        const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') }) ||
            screen.getByLabelText(new RegExp(name, 'i'));
        await user.clear(input);
        await user.type(input, value);
    }
}

// ============================================
// Snapshot Testing Helpers
// ============================================

/**
 * Clean generated IDs from HTML for consistent snapshots
 */
export function cleanSnapshotHTML(html: string): string {
    return html
        // Remove random IDs
        .replace(/id="[^"]*-[a-z0-9]{6,}"/g, 'id="[GENERATED_ID]"')
        // Remove timestamps
        .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '[TIMESTAMP]')
        // Remove UUIDs
        .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '[UUID]');
}

// ============================================
// Export
// ============================================

export {
    customRender as render,
    screen,
    waitFor,
    within,
    userEvent,
    createTestQueryClient,
    AllProviders,
};

export default {
    render: customRender,
    screen,
    waitFor,
    within,
    userEvent,
    createMockUser,
    createMockComplaint,
    createMockDepartment,
    createMockBuilding,
    createMockNotification,
    createMockComplaints,
    mockAPI,
    mockResponse,
    mockErrorResponse,
    delay,
    checkA11y,
    waitForLoadingToComplete,
    isVisible,
    getFormValues,
    fillForm,
    cleanSnapshotHTML,
};
