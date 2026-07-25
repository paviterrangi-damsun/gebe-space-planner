import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

interface PlanItemSummary {
  name: string
  quantity: number
}

interface SendPlanLeadBody {
  name: string
  email: string
  phone: string
  message: string
  planName: string
  roomCount: number
  floorSizeText: string
  totalItemCount: number
  items: PlanItemSummary[]
  pdfBase64: string
  pdfFileName: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  let body: SendPlanLeadBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, phone, message, planName, roomCount, floorSizeText, totalItemCount, items, pdfBase64, pdfFileName } = body

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Name and a valid email are required' }, { status: 400 })
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
  const leadNotificationEmail = process.env.LEAD_NOTIFICATION_EMAIL

  if (!gmailUser || !gmailAppPassword || !leadNotificationEmail) {
    console.error('Missing email env vars: GMAIL_USER, GMAIL_APP_PASSWORD, LEAD_NOTIFICATION_EMAIL must all be set')
    return NextResponse.json({ error: 'Email is not configured on the server' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  })

  const itemsList = Array.isArray(items) && items.length > 0
    ? items.map((item) => `  - ${item.name} x${item.quantity}`).join('\n')
    : '  (no items placed)'

  const textBody = `New floor plan download request

Name: ${name}
Email: ${email}
Phone: ${isNonEmptyString(phone) ? phone : '(not provided)'}
Message: ${isNonEmptyString(message) ? message : '(none)'}

Selected plan: ${planName || 'Floorplan'}
Rooms: ${roomCount ?? '-'}
Overall size: ${floorSizeText || '-'}
Total items placed: ${totalItemCount ?? '-'}
Items:
${itemsList}
`

  const attachments = isNonEmptyString(pdfBase64)
    ? [
        {
          filename: isNonEmptyString(pdfFileName) ? pdfFileName : 'floorplan.pdf',
          content: pdfBase64,
          encoding: 'base64' as const
        }
      ]
    : []

  try {
    await transporter.sendMail({
      from: `"Blueprint3D" <${gmailUser}>`,
      to: leadNotificationEmail,
      replyTo: email,
      subject: `New plan download request from ${name}`,
      text: textBody,
      attachments
    })
  } catch (error) {
    console.error('Failed to send plan lead email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
