/**
 * University Email Validation
 * 
 * Restricts access to @paruluniversity.ac.in email addresses only.
 */

export const ALLOWED_EMAIL_DOMAIN = 'paruluniversity.ac.in';

/**
 * Check if an email belongs to Parul University
 */
export function isUniversityEmail(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    return normalizedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

/**
 * Get a user-friendly error message for non-university emails
 */
export function getUniversityEmailError(): string {
    return `Only @${ALLOWED_EMAIL_DOMAIN} email addresses are allowed`;
}

/**
 * Zod custom validation for university email
 */
export function validateUniversityEmail(email: string): boolean | string {
    if (!isUniversityEmail(email)) {
        return getUniversityEmailError();
    }
    return true;
}
