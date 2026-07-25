/**
 * Generates downloadable PDF reports for floorplans: top-down snapshot,
 * plan summary (rooms, size), and a breakdown of items used with quantities.
 */
import { jsPDF } from 'jspdf'

export interface PlanItemSummary {
  name: string
  quantity: number
}

export interface PlanExportData {
  projectName: string
  thumbnailDataUrl: string
  roomCount: number
  floorSizeText: string
  totalItemCount: number
  items: PlanItemSummary[]
}

/** Renders one plan's report onto the current page of an open jsPDF document. */
function renderPlanPage(doc: jsPDF, data: PlanExportData): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  let y = margin

  doc.setFontSize(18)
  doc.text(data.projectName || 'Floorplan', margin, y)
  y += 20

  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(new Date().toLocaleDateString(), margin, y)
  doc.setTextColor(0)
  y += 24

  // Top-down plan image
  if (data.thumbnailDataUrl) {
    const imgWidth = pageWidth - margin * 2
    const imgHeight = imgWidth * (2 / 3) // matches the 1800x1200 thumbnail aspect ratio
    doc.addImage(data.thumbnailDataUrl, 'WEBP', margin, y, imgWidth, imgHeight)
    y += imgHeight + 24
  }

  // Plan summary
  doc.setFontSize(13)
  doc.text('Plan Summary', margin, y)
  y += 18

  doc.setFontSize(10)
  const summaryLines = [
    `Rooms: ${data.roomCount}`,
    `Overall size: ${data.floorSizeText}`,
    `Total items placed: ${data.totalItemCount}`
  ]
  summaryLines.forEach((line) => {
    doc.text(line, margin, y)
    y += 16
  })
  y += 12

  // Item breakdown table
  doc.setFontSize(13)
  doc.text('Items Used', margin, y)
  y += 18

  doc.setFontSize(10)
  if (data.items.length === 0) {
    doc.text('No items placed.', margin, y)
    y += 16
  } else {
    const colItemX = margin
    const colQtyX = pageWidth - margin - 60

    doc.setFont('helvetica', 'bold')
    doc.text('Item', colItemX, y)
    doc.text('Qty', colQtyX, y)
    doc.setFont('helvetica', 'normal')
    y += 6
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 14

    data.items.forEach((item) => {
      if (y > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(item.name, colItemX, y)
      doc.text(String(item.quantity), colQtyX, y)
      y += 16
    })
  }
}

export function exportPlanToPdf(data: PlanExportData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  renderPlanPage(doc, data)

  const fileName = `${(data.projectName || 'floorplan').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`
  doc.save(fileName)
}

/** Builds a single PDF containing a cover summary plus one detail page per plan. */
export function exportAllPlansToPdf(plans: PlanExportData[], fileName = 'All_Floorplans.pdf'): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  let y = margin

  // Cover page
  doc.setFontSize(20)
  doc.text('All Floorplans', margin, y)
  y += 24

  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(new Date().toLocaleDateString(), margin, y)
  doc.setTextColor(0)
  y += 24

  doc.setFontSize(12)
  doc.text(`Total plans: ${plans.length}`, margin, y)
  y += 24

  const grandTotals = new Map<string, number>()
  plans.forEach((plan) => {
    plan.items.forEach((item) => {
      grandTotals.set(item.name, (grandTotals.get(item.name) || 0) + item.quantity)
    })
  })

  doc.setFontSize(13)
  doc.text('Combined Items Across All Plans', margin, y)
  y += 18

  doc.setFontSize(10)
  if (grandTotals.size === 0) {
    doc.text('No items placed in any plan.', margin, y)
    y += 16
  } else {
    const colItemX = margin
    const colQtyX = pageWidth - margin - 60

    doc.setFont('helvetica', 'bold')
    doc.text('Item', colItemX, y)
    doc.text('Qty', colQtyX, y)
    doc.setFont('helvetica', 'normal')
    y += 6
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 14

    Array.from(grandTotals.entries()).forEach(([name, quantity]) => {
      if (y > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(name, colItemX, y)
      doc.text(String(quantity), colQtyX, y)
      y += 16
    })
  }

  // One detail page per plan
  plans.forEach((plan) => {
    doc.addPage()
    renderPlanPage(doc, plan)
  })

  doc.save(fileName)
}
