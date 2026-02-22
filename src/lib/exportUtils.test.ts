import { describe, it, expect } from 'vitest'
import { exportToPDF } from '@/lib/exportUtils'

describe('exportUtils', () => {
    it('exportToPDF should not crash with empty data', () => {
        expect(() => exportToPDF([], 'test', 'Test Report')).not.toThrow()
    })

    it('exportToPDF should handle valid data', () => {
        const mockData = [
            {
                complaint_number: 'TEST-001',
                title: 'Test Complaint',
                priority: 'high',
                status: 'pending',
                created_at: new Date().toISOString()
            }
        ]

        expect(() => exportToPDF(mockData, 'test', 'Test Report')).not.toThrow()
    })
})
