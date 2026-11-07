from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

PURPLE = colors.HexColor("#5B44F2")
INDIGO = colors.HexColor("#303F9F")
LIGHT = colors.HexColor("#F4F6FB")
MUTED = colors.HexColor("#667085")


def _text(value):
    return "" if value is None else str(value)


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.3 * inch, "DAR Request Source Analytics")
    canvas.drawRightString(10.45 * inch, 0.3 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_analytics_pdf(report):
    """Return PDF bytes from the normalized analytics export context.

    Expected keys: generated_at, start_date, end_date, combined_metrics,
    dar_metrics, product_metrics, monthly_sources, requests.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=0.45*inch, leftMargin=0.45*inch, topMargin=0.45*inch, bottomMargin=0.55*inch)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], textColor=PURPLE, fontSize=22, leading=26, spaceAfter=4))
    styles.add(ParagraphStyle(name="SmallMuted", parent=styles["Normal"], textColor=MUTED, fontSize=8, leading=10))
    styles.add(ParagraphStyle(name="Cell", parent=styles["Normal"], fontSize=8, leading=10))
    styles.add(ParagraphStyle(name="CellRight", parent=styles["Cell"], alignment=TA_RIGHT))
    story = [Paragraph("DAR Request Source Analytics", styles["ReportTitle"]), Paragraph(f"Reporting period: {_text(report.get('start_date')) or 'All dates'} to {_text(report.get('end_date')) or 'All dates'} | Generated: {_text(report.get('generated_at'))}", styles["SmallMuted"]), Spacer(1, 14)]

    combined = report.get("combined_metrics", {})
    dar = report.get("dar_metrics", {})
    product = report.get("product_metrics", {})
    summary = [["Combined requests", "DAR requests", "Product requests", "Completed"], [_text(combined.get("total", 0)), _text(dar.get("total", 0)), _text(product.get("total", 0)), _text(combined.get("completed", 0))]]
    tbl = Table(summary, colWidths=[2.55*inch]*4)
    tbl.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),colors.white),("BACKGROUND",(0,1),(-1,1),LIGHT),("ALIGN",(0,0),(-1,-1),"CENTER"),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),10),("BOX",(0,0),(-1,-1),0.5,colors.HexColor('#D0D5DD')),("INNERGRID",(0,0),(-1,-1),0.3,colors.HexColor('#D0D5DD')),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    story += [tbl, Spacer(1, 16), Paragraph("Source status summary", styles["Heading2"])]
    status_rows = [["Source", "Status", "Total"]]
    for source, metrics in (("DAR form", dar), ("Product / Orders", product)):
        for item in metrics.get("status_counts", []): status_rows.append([source, _text(item.get("label")), _text(item.get("total"))])
    if len(status_rows) == 1: status_rows.append(["-", "No status data", "0"])
    status_table = Table(status_rows, colWidths=[2.2*inch, 5.4*inch, 1.2*inch], repeatRows=1)
    status_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),INDIGO),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.3,colors.HexColor('#D0D5DD')),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,LIGHT]),("ALIGN",(-1,1),(-1,-1),"RIGHT"),("FONTSIZE",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [status_table, Spacer(1, 16), Paragraph("Monthly source activity", styles["Heading2"])]
    monthly_rows = [["Month", "DAR forms", "Product requests", "Combined"]] + [[_text(x.get("label")), _text(x.get("dar_total",0)), _text(x.get("product_total",0)), _text(x.get("total",0))] for x in report.get("monthly_sources", [])]
    if len(monthly_rows)==1: monthly_rows.append(["No monthly data","0","0","0"])
    monthly_table=Table(monthly_rows,colWidths=[3.4*inch,2.0*inch,2.0*inch,2.0*inch],repeatRows=1)
    monthly_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),INDIGO),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.3,colors.HexColor('#D0D5DD')),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,LIGHT]),("ALIGN",(1,1),(-1,-1),"RIGHT"),("FONTSIZE",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [monthly_table, PageBreak(), Paragraph("Request detail", styles["Heading2"])]
    request_rows=[["Source","Request ID","Title","Status","Requester","Created"]]
    for item in report.get("requests", []): request_rows.append([Paragraph(_text(item.get('source')),styles['Cell']),Paragraph(_text(item.get('request_id')),styles['Cell']),Paragraph(_text(item.get('title')),styles['Cell']),Paragraph(_text(item.get('status')),styles['Cell']),Paragraph(_text(item.get('requester')),styles['Cell']),Paragraph(_text(item.get('created_at')),styles['Cell'])])
    if len(request_rows)==1: request_rows.append(["-","-","No request records in the selected range","-","-","-"])
    details=Table(request_rows,colWidths=[0.85*inch,1.15*inch,3.9*inch,1.15*inch,1.65*inch,1.45*inch],repeatRows=1)
    details.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.3,colors.HexColor('#D0D5DD')),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,LIGHT]),("VALIGN",(0,0),(-1,-1),"TOP"),("FONTSIZE",(0,0),(-1,-1),7.5),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
    story.append(details)
    doc.build(story,onFirstPage=_footer,onLaterPages=_footer)
    return buffer.getvalue()
