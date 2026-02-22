

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailPayload {
  type: 'new_complaint' | 'status_update' | 'assignment' | 'completion' | 'sla_breach' | 'progress_update' | 'work_started' | 'work_on_hold' | 'work_resumed' | 'verification_requested' | 'verification_rejected' | 'verification_approved'
  to: string[]
  subject: string
  data: Record<string, any>
}

const baseStyles = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const headerStyles = (color: string) => `
  background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
  color: white;
  padding: 24px;
  text-align: center;
`

const contentStyles = `
  padding: 24px;
  color: #1a1a2e;
`

const footerStyles = `
  background: #f8f9fa;
  padding: 16px 24px;
  text-align: center;
  color: #6c757d;
  font-size: 12px;
  border-top: 1px solid #e9ecef;
`

const buttonStyles = (color: string) => `
  display: inline-block;
  background: ${color};
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 16px;
`

const infoBox = `
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`

const templates: Record<string, (data: any) => string> = {
  new_complaint: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#f59e0b')}">
        <h2 style="margin: 0; font-size: 24px;">📋 New Complaint Registered</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>A new complaint has been registered in the system:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Category:</strong> ${data.categoryName || 'Maintenance'}</p>
          <p style="margin: 4px 0;"><strong>Priority:</strong> <span style="color: ${data.priority === 'critical' ? '#ef4444' : data.priority === 'high' ? '#f97316' : '#eab308'}; font-weight: 600;">${data.priority?.toUpperCase()}</span></p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
          <p style="margin: 4px 0;"><strong>Department:</strong> ${data.departmentName || 'N/A'}</p>
        </div>
        <p><strong>Description:</strong></p>
        <p style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">${data.description || 'No description provided'}</p>
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#f59e0b')}">Track Complaint →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  status_update: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#3b82f6')}">
        <h2 style="margin: 0; font-size: 24px;">🔄 Complaint Status Updated</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Your complaint <strong>${data.complaintNumber}</strong> has been updated:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${data.status?.replace('_', ' ').toUpperCase()}</span></p>
          <p style="margin: 4px 0;"><strong>Updated By:</strong> ${data.updatedByName || 'System'}</p>
          ${data.note ? `<p style="margin: 4px 0;"><strong>Note:</strong> ${data.note}</p>` : ''}
        </div>
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#3b82f6')}">View Details →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  assignment: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#8b5cf6')}">
        <h2 style="margin: 0; font-size: 24px;">🔧 New Task Assigned</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello ${data.assigneeName || 'Team'},</p>
        <p>A new maintenance task has been assigned to you:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Priority:</strong> <span style="color: ${data.priority === 'critical' ? '#ef4444' : '#f97316'}; font-weight: 600;">${data.priority?.toUpperCase()}</span></p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
          ${data.expectedResolution ? `<p style="margin: 4px 0;"><strong>Expected Resolution:</strong> ${data.expectedResolution}</p>` : ''}
        </div>
        ${data.note ? `<p><strong>Instructions:</strong> ${data.note}</p>` : ''}
        <a href="https://unicare.pu.edu/dashboard/maintenance" style="${buttonStyles('#8b5cf6')}">View Dashboard →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  completion: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#10b981')}">
        <h2 style="margin: 0; font-size: 24px;">✅ Complaint Marked Complete</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Great news! Your complaint <strong>${data.complaintNumber}</strong> has been marked as completed.</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">COMPLETED</span></p>
        </div>
        <p>Please verify the completion and provide your feedback.</p>
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#10b981')}">Verify & Rate →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  sla_breach: (data) => `
    <div style="${baseStyles}; border: 3px solid #ef4444;">
      <div style="${headerStyles('#ef4444')}">
        <h2 style="margin: 0; font-size: 24px;">⚠️ SLA BREACH ALERT</h2>
      </div>
      <div style="${contentStyles}">
        <p style="color: #ef4444; font-weight: 600;">URGENT: The following complaint has breached its SLA:</p>
        <div style="${infoBox}; border: 2px solid #ef4444; background: #fef2f2;">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Priority:</strong> <span style="color: #ef4444; font-weight: 700;">${data.priority?.toUpperCase()}</span></p>
          <p style="margin: 4px 0;"><strong>Expected Resolution:</strong> ${data.expectedResolution}</p>
          <p style="margin: 4px 0;"><strong>Current Status:</strong> ${data.status?.replace('_', ' ')}</p>
        </div>
        <p><strong>⚡ Immediate Action Required:</strong> Please prioritize this complaint immediately.</p>
        <a href="https://unicare.pu.edu/dashboard/admin" style="${buttonStyles('#ef4444')}">Take Action Now →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated URGENT email from PU Unicare System</p>
      </div>
    </div>
  `,

  progress_update: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#06b6d4')}">
        <h2 style="margin: 0; font-size: 24px;">📊 Progress Update</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>There's a progress update on complaint <strong>${data.complaintNumber}</strong>:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          ${data.progress ? `<p style="margin: 4px 0;"><strong>Progress:</strong> <span style="background: #06b6d4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${data.progress}%</span></p>` : ''}
        </div>
        ${data.note ? `<p><strong>Update Notes:</strong></p><p style="background: #f0fdfa; padding: 12px; border-radius: 6px; border-left: 4px solid #06b6d4;">${data.note}</p>` : ''}
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#06b6d4')}">View Progress →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  work_started: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#22c55e')}">
        <h2 style="margin: 0; font-size: 24px;">🚀 Work Has Started</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Good news! Work has started on your complaint:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">IN PROGRESS</span></p>
        </div>
        <p>Our maintenance team is now actively working on resolving this issue.</p>
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#22c55e')}">Track Progress →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  work_on_hold: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#eab308')}">
        <h2 style="margin: 0; font-size: 24px;">⏸️ Work Put On Hold</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Work on your complaint has been temporarily put on hold:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background: #eab308; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">ON HOLD</span></p>
        </div>
        ${data.note ? `<p><strong>Reason:</strong> ${data.note}</p>` : '<p>The maintenance team will resume work as soon as possible.</p>'}
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#eab308')}">View Details →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  work_resumed: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#22c55e')}">
        <h2 style="margin: 0; font-size: 24px;">▶️ Work Resumed</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Work has resumed on your complaint:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">IN PROGRESS</span></p>
        </div>
        <p>Our maintenance team is back to working on your issue.</p>
        <a href="https://unicare.pu.edu/track" style="${buttonStyles('#22c55e')}">Track Progress →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  verification_requested: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#8b5cf6')}">
        <h2 style="margin: 0; font-size: 24px;">📝 Verification Required</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>The maintenance team has marked your complaint as complete. Please verify the work:</p>
        <div style="${infoBox}">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>Please visit the portal to:</p>
        <ul>
          <li>View the completion proof photos</li>
          <li>Verify the work quality</li>
          <li>Provide your rating and feedback</li>
        </ul>
        <a href="https://unicare.pu.edu/dashboard" style="${buttonStyles('#8b5cf6')}">Verify Now →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  verification_rejected: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#ef4444')}">
        <h2 style="margin: 0; font-size: 24px;">❌ Completion Rejected</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>Your completion submission for the following complaint has been rejected:</p>
        <div style="${infoBox}; border: 2px solid #ef4444;">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${data.location}</p>
        </div>
        ${data.feedback ? `<p><strong>Reason for Rejection:</strong></p><p style="background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444;">${data.feedback}</p>` : ''}
        <p><strong>Action Required:</strong> Please address the issues and resubmit the completion.</p>
        <a href="https://unicare.pu.edu/dashboard/maintenance" style="${buttonStyles('#ef4444')}">View Task →</a>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `,

  verification_approved: (data) => `
    <div style="${baseStyles}">
      <div style="${headerStyles('#10b981')}">
        <h2 style="margin: 0; font-size: 24px;">🎉 Complaint Closed Successfully</h2>
      </div>
      <div style="${contentStyles}">
        <p>Hello,</p>
        <p>The complaint has been verified and closed successfully!</p>
        <div style="${infoBox}; background: #f0fdf4;">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${data.complaintNumber}</p>
          <p style="margin: 4px 0;"><strong>Title:</strong> ${data.title}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">CLOSED</span></p>
          ${data.rating ? `<p style="margin: 4px 0;"><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</p>` : ''}
        </div>
        ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
        <p>Thank you for using PU Unicare!</p>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">This is an automated email from PU Unicare Complaint Management System</p>
      </div>
    </div>
  `
}


Deno.serve(async (req: Request) => {
  try {
    const payload: EmailPayload = await req.json()

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email would be sent:', payload)
      return new Response(JSON.stringify({ message: 'Email simulated (no API key)' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const htmlBody = templates[payload.type]?.(payload.data) || `<div style="${baseStyles}"><div style="${contentStyles}"><p>Email notification from PU Unicare</p></div></div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'PU Unicare <noreply@unicare.pu.edu>',
        to: payload.to,
        subject: payload.subject,
        html: htmlBody
      })
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

