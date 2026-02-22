export const ALLOWED_ROLES_FOR_COMPLAINTS = [
    'faculty',
    'cr',
    'admin',
    'principal',
    'hod',
    'maintenance_staff'
] as const;

export const APP_USER_ROLES = [
    'admin',
    'principal',
    'hod',
    'faculty',
    'cr',
    'maintenance_staff'
] as const;

export const TABLES = {
    COMPLAINTS: 'complaints',
    COMPLAINT_UPDATES: 'complaint_updates',
    DEPARTMENTS: 'departments',
    MAINTENANCE_CATEGORIES: 'maintenance_categories',
    BUILDINGS: 'buildings',
    PROFILES: 'profiles',
    USER_ROLES: 'user_roles',
} as const;

export const BUCKETS = {
    COMPLAINT_IMAGES: 'complaint-images',
} as const;

