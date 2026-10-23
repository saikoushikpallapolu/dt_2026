import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_full_pptx():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]
    assets_dir = os.path.abspath("scripts/slides_assets")

    # Colors
    C_BG_DARK = RGBColor(24, 9, 46)        # Deep Purple #18092e
    C_PURPLE = RGBColor(76, 29, 149)       # #4c1d95
    C_PURPLE_LIGHT = RGBColor(237, 233, 254) # #ede9fe
    C_WHITE = RGBColor(255, 255, 255)
    C_TEXT_DARK = RGBColor(15, 23, 42)     # #0f172a
    C_TEXT_MUTED = RGBColor(100, 116, 139) # #64748b
    C_AMBER = RGBColor(217, 119, 6)        # #d97706
    C_GOLD = RGBColor(251, 191, 36)        # #fbbf24
    C_GREEN = RGBColor(16, 185, 129)       # #10b981
    C_CARD_BORDER = RGBColor(226, 232, 240)

    def add_header(slide, category, title, subtitle):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = category.upper()
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = C_PURPLE

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(26)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_DARK
        p1.space_before = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=None):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1.5)
        else:
            shape.line.fill.background()
        return shape

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_BG_DARK
    bg1.line.fill.background()

    tb = s1.shapes.add_textbox(Inches(1), Inches(0.8), Inches(11.3), Inches(5.8))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "VNR VJIET · CENTRE FOR PRESENCING & DESIGN THINKING (CPDT)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_GOLD

    p = tf.add_paragraph()
    p.text = "Find My Professor"
    p.font.size = Pt(50)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(16)

    p = tf.add_paragraph()
    p.text = "Dynamic QR Office Placards & Real-Time Consultation Scheduling Ecosystem"
    p.font.size = Pt(20)
    p.font.color.rgb = RGBColor(226, 232, 240)
    p.space_before = Pt(8)

    add_card(s1, Inches(1), Inches(4.5), Inches(7.0), Inches(2.0), RGBColor(40, 20, 70), RGBColor(90, 50, 130))
    tb_c1 = s1.shapes.add_textbox(Inches(1.2), Inches(4.7), Inches(6.6), Inches(1.6))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    p = tf_c1.paragraphs[0]
    p.text = "STUDENT ENGINEERING TEAM (CSE & AI)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p = tf_c1.add_paragraph()
    p.text = "• Sai Koushik Pallapolu\n• Team Member 2\n• Team Member 3\n• Team Member 4"
    p.font.size = Pt(13)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)

    add_card(s1, Inches(8.3), Inches(4.5), Inches(4.0), Inches(2.0), RGBColor(40, 20, 70), RGBColor(90, 50, 130))
    tb_c2 = s1.shapes.add_textbox(Inches(8.5), Inches(4.7), Inches(3.6), Inches(1.6))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p = tf_c2.paragraphs[0]
    p.text = "UNDER THE GUIDANCE OF"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p = tf_c2.add_paragraph()
    p.text = "Mrs. Prasanna Pabba"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)
    p = tf_c2.add_paragraph()
    p.text = "Assistant Professor, Dept. of CSE\nVNR VJIET · Hyderabad"
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(203, 213, 225)

    # -------------------------------------------------------------
    # SLIDE 2: The Team
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "00 · Team Introduction", "The Team", "Centre for Presencing and Design Thinking (CPDT) · VNR VJIET")
    img_path = os.path.join(assets_dir, "team_cpdt.png")
    if os.path.exists(img_path):
        s2.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), width=Inches(6.0), height=Inches(4.8))

    add_card(s2, Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8), C_WHITE, C_CARD_BORDER)
    tb = s2.shapes.add_textbox(Inches(7.3), Inches(2.0), Inches(5.0), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "STUDENT INNOVATION SQUAD"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_PURPLE

    members = [
        ("Sai Koushik Pallapolu", "Lead Full-Stack Architecture · Real-time SSE Engine & Responsive UI"),
        ("Team Member 2", "User Research Lead · Corridor Empathy Interviews & Student Journey Mapping"),
        ("Team Member 3", "Backend & Database Architect · PostgreSQL Schema, Prisma ORM & Conflict Engine"),
        ("Team Member 4", "UI/UX & Deployment Lead · Placard Generator, Mobile PWA & Cloud CI/CD")
    ]
    for name, role in members:
        p = tf.add_paragraph()
        p.text = f"• {name}"
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)
        p2 = tf.add_paragraph()
        p2.text = f"   {role}"
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 3: Agenda
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Overview", "Agenda & Presentation Flow", "Structured through the complete 5-stage Design Thinking journey")
    agenda_items = [
        ("01", "Problem Statement", "Campus corridor transit friction & zero cabin visibility."),
        ("02", "Research Approach", "Empathy interviews, corridor observations & user mapping."),
        ("03", "Defining Insights", "Categorized user needs: Primary, Secondary, Latent."),
        ("04", "POV Statement", "Actionable Point of View for faculty & students."),
        ("05", "Ideation Method", "Brainstorming & SCAMPER innovation methodology."),
        ("06", "The Solution", "Live QR placards, 1-tap workspace & notify alerts."),
        ("07", "Our Innovation", "Desirability, technical feasibility, and viability."),
        ("08", "Design for Environment", "Sustainable campus infrastructure aligned with UN SDGs."),
        ("09", "Mentor Interactions", "Actionable guidance from Mrs. Prasanna Pabba."),
        ("10", "Team Experiences", "Course Outcomes (CO-1 to CO-4) & learnings."),
        ("11", "Conclusion & Scope", "Scalable roadmap for campus-wide deployment.")
    ]
    col_w = Inches(3.7)
    row_h = Inches(1.1)
    for idx, (num, title, desc) in enumerate(agenda_items):
        col = idx % 3
        row = idx // 3
        x = Inches(0.8) + col * Inches(3.9)
        y = Inches(1.8) + row * Inches(1.25)
        add_card(s3, x, y, col_w, row_h, C_WHITE, C_CARD_BORDER)
        tb = s3.shapes.add_textbox(x + Inches(0.15), y + Inches(0.1), col_w - Inches(0.3), row_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{num} · {title}"
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = C_PURPLE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    # -------------------------------------------------------------
    # SLIDE 4: Problem Statement
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "01 · Empathize & Discover", "Problem Statement: The Campus Transit Dilemma", "Physical availability blindness in multi-acre university institutions")
    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), C_WHITE, C_CARD_BORDER)
    tb = s4.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "THE SCALE OF THE PROBLEM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_PURPLE
    p = tf.add_paragraph()
    p.text = "Across VNR VJIET (Academic Blocks 1, 2, 3 and B-Block), faculty balance lectures, laboratory evaluations, department meetings, and research.\n\nStudents seeking quick doubt clarification or signatures routinely climb 2 to 4 flights of stairs only to find locked cabins or empty desks.\n\nBecause physical presence at desks is completely invisible until arrival, over 40% of student cabin visits end in wasted transit."
    p.font.size = Pt(14)
    p.font.color.rgb = C_TEXT_DARK
    p.space_before = Pt(8)

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), RGBColor(254, 243, 199), RGBColor(245, 158, 11))
    tb = s4.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "THE DUAL BURDEN ON FACULTY & STUDENTS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "• Disruptive Knocking: Faculty working on research or exam grading are constantly interrupted by students checking if they are free.\n\n• Hallway Crowding: Students linger outside cabins in corridor bottlenecks trying to peer through glass doors.\n\n• Inflexible Timetables: Paper timetables pasted on doors become outdated after Day 1 due to inevitable impromptu campus meetings."
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(120, 53, 15)
    p.space_before = Pt(8)

    # -------------------------------------------------------------
    # SLIDE 5: Key Problems & HMW
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "01 · Define Phase", "Problem Statement: Key Problems & How Might We", "Formulating the human-centered engineering challenge")
    problems = [
        ("Zero Desk Visibility", "Physical presence at office desk is unknown until a student climbs floors and knocks."),
        ("Wasted Time & Energy", "Students waste 15-25 minutes between classes; frustration and crowded hallways."),
        ("Scheduling Friction", "Ad-hoc knocking disrupts faculty grading; booking appointments via email is slow."),
        ("No Passive Feedback", "When a professor steps away for 10 minutes, students have no way to get alerted upon return.")
    ]
    card_w = Inches(2.8)
    for i, (title, desc) in enumerate(problems):
        x = Inches(0.8) + i * Inches(2.95)
        add_card(s5, x, Inches(1.8), card_w, Inches(2.2), C_WHITE, C_CARD_BORDER)
        tb = s5.shapes.add_textbox(x + Inches(0.15), Inches(2.0), card_w - Inches(0.3), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = C_PURPLE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(6)

    add_card(s5, Inches(0.8), Inches(4.3), Inches(11.7), Inches(2.3), C_PURPLE)
    tb = s5.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(11.1), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "DESIGN CHALLENGE — HOW MIGHT WE..."
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = C_GOLD
    p2 = tf.add_paragraph()
    p2.text = '"How might we provide students with instant, real-time awareness of faculty availability and streamline consultation bookings right at the office door, without burdening busy professors with complex administrative overhead?"'
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(8)

    # -------------------------------------------------------------
    # SLIDE 6: Empathy Map
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "02 · Empathize Phase", "Research Approach & Empathy Map", "Field interviews across CSE & IT corridors (Cabins 127, 201, 031)")
    quads = [
        ("🗣️ SAYS", ["Student: 'I climbed to 2nd floor B-Block three times today, but sir was in evaluation.'", "Professor: 'I step away for 10 minutes to submit a report, and return to find students left.'"], RGBColor(59, 130, 246)),
        ("🧠 THINKS", ["'Is ma'am actually absent today or just in a quick 5-minute meeting?'", "'If I knock now, am I disturbing an important project review?'", "'I wish there was a live status screen right beside their nameplate.'"], C_PURPLE),
        ("🚶 DOES", ["Walks back and forth repeatedly between campus buildings during class breaks.", "Hovers awkwardly outside faculty room glass doors trying to peer inside.", "Sends repetitive WhatsApp messages asking 'Sir are you in cabin?'"], C_AMBER),
        ("❤️ FEELS", ["Frustrated: Wasting valuable free study periods searching for teachers.", "Hesitant: Anxious about knocking on the wrong cabin door during busy hours.", "Overwhelmed: Faculty feeling interrupted when focusing on paper evaluation."], RGBColor(236, 72, 153))
    ]
    for i, (title, points, color) in enumerate(quads):
        col = i % 2
        row = i // 2
        x = Inches(0.8) + col * Inches(5.95)
        y = Inches(1.8) + row * Inches(2.5)
        add_card(s6, x, y, Inches(5.75), Inches(2.3), C_WHITE, color)
        tb = s6.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(5.35), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = color
        for pt in points:
            p2 = tf.add_paragraph()
            p2.text = f"• {pt}"
            p2.font.size = Pt(11)
            p2.font.color.rgb = C_TEXT_DARK
            p2.space_before = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 7: Defining Insights (Table)
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "03 · Define Phase", "Defining Insights: User Needs Matrix", "Transforming user empathy into prioritized engineering requirements")
    
    rows, cols = 6, 3
    t_shape = s7.shapes.add_table(rows, cols, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8))
    table = t_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(4.7)
    table.columns[2].width = Inches(4.8)

    headers = ["NEED TYPE", "IDENTIFIED CAMPUS NEED", "FIND MY PROFESSOR RESPONSE"]
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(241, 245, 249)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK

    data = [
        ("PRIMARY", "Instant Live Desk Availability: Verify if professor is in cabin before walking across blocks.", "Dynamic QR Door Placard & Web Portal: Camera scan reveals live color-coded status."),
        ("PRIMARY", "Expected Return Estimates: Knowing when stepped-away faculty will return.", "Countdown Return Target: Faculty sets +15m, +30m with optional note ('In Lab 3')."),
        ("SECONDARY", "Organized Consultations: Booking 15-30 min doubt slots without double-booking.", "1-Click Consultation Request: Automated calendar conflict check preventing overlap."),
        ("SECONDARY", "Glanceable Office Hours: Routine availability without paper printouts that fade.", "Digital Weekly Office Hours: Formatted schedule with next upcoming availability."),
        ("LATENT", "Passive Real-Time Awareness: Relieving students from constantly refreshing screens.", "Notify When Available: Instant push notification / toast alert sent on faculty return.")
    ]
    for r, row in enumerate(data, start=1):
        for c, text in enumerate(row):
            cell = table.cell(r, c)
            cell.text = text
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            if c == 0:
                p.font.bold = True
                p.font.color.rgb = C_PURPLE

    # -------------------------------------------------------------
    # SLIDE 8: Point of View (POV)
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "04 · Define Phase", "Point of View (POV) Statement", "Framing the core design challenge through User, Need, and Insight")
    
    pov_boxes = [
        ("USER PROFILE", "The Academic Community", "Undergraduate students seeking guidance and faculty members balancing lectures, research, and consultations across large campus blocks.", C_PURPLE),
        ("SPECIFIC NEED", "Zero-Friction Truth", "Immediate visibility into real-time physical desk availability and a direct, respectful way to schedule micro-consultations right at the cabin door.", C_AMBER),
        ("DEEP INSIGHT", "Physical-Digital Gap", "Physical door signs are completely disconnected from live schedules, while existing ERP apps are too slow and cumbersome for quick 2-minute status updates.", C_GREEN)
    ]
    for i, (tag, title, desc, colr) in enumerate(pov_boxes):
        x = Inches(0.8) + i * Inches(3.95)
        add_card(s8, x, Inches(1.8), Inches(3.8), Inches(2.2), C_WHITE, colr)
        tb = s8.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(3.4), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = tag
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = colr
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.bold = True
        p2.font.size = Pt(14)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(4)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = C_TEXT_MUTED
        p3.space_before = Pt(4)

    add_card(s8, Inches(0.8), Inches(4.3), Inches(11.7), Inches(2.3), C_PURPLE)
    tb = s8.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(11.1), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "ACTIONABLE POV STATEMENT"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p2 = tf.add_paragraph()
    p2.text = '"College students seeking academic guidance need a glanceable, instant way to verify faculty availability and request consultations at the door because physical absence is currently invisible until arrived, causing wasted transit time and disruptive interruptions for busy professors."'
    p2.font.size = Pt(17)
    p2.font.bold = True
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(8)

    # -------------------------------------------------------------
    # SLIDE 9: Ideation & SCAMPER
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "05 · Ideate Phase", "Ideation Method: Brainstorming & SCAMPER", "Systematically exploring alternatives and landing on the optimal solution")
    
    # Brainstorming card
    add_card(s9, Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.8), C_WHITE, C_CARD_BORDER)
    tb = s9.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.3), Inches(1.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "BRAINSTORMING EVALUATION"
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = C_PURPLE
    p2 = tf.add_paragraph()
    p2.text = "❌ Biometric door sensors: Expensive hardware & privacy concerns.  |  ❌ Timetable auto-tracking: Impromptu meetings make it inaccurate.\n❌ NFC tags on doors: Incompatible with many phones.  |  ✅ Persistent QR Door Placards + Real-Time Web: Universal, zero-cost, sub-second sync."
    p2.font.size = Pt(12)
    p2.font.color.rgb = C_TEXT_DARK
    p2.space_before = Pt(4)

    # SCAMPER Items
    scampers = [
        ("S", "Substitute", "Static door timetables replaced by dynamic QR placards."),
        ("C", "Combine", "Physical door scanning combined with instant push alerts."),
        ("A", "Adapt", "Airport departure board paradigm adapted for campus cabins."),
        ("M", "Modify", "Scheduling modified into quick conflict-checked 30-min slots."),
        ("P", "Put to Use", "Placards double as emergency notices and office hour guides."),
        ("E", "Eliminate", "Eliminated wasted multi-floor campus trips and disruptive knocking."),
        ("R", "Rearrange", "Inverted booking: students scan & request; faculty accepts in 1 tap.")
    ]
    sw = Inches(1.58)
    for i, (let, word, desc) in enumerate(scampers):
        x = Inches(0.8) + i * Inches(1.68)
        add_card(s9, x, Inches(3.9), sw, Inches(2.7), C_WHITE, C_CARD_BORDER)
        tb = s9.shapes.add_textbox(x + Inches(0.1), Inches(4.0), sw - Inches(0.2), Inches(2.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = let
        p.font.bold = True
        p.font.size = Pt(22)
        p.font.color.rgb = C_PURPLE
        p2 = tf.add_paragraph()
        p2.text = word
        p2.font.bold = True
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(2)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = C_TEXT_MUTED
        p3.space_before = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 10: The Solution
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "06 · Solution Overview", "The Solution: Find My Professor", "A unified, real-time campus availability & scheduling ecosystem")
    
    add_card(s10, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8), C_PURPLE)
    tb = s10.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORE ARCHITECTURE"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p = tf.add_paragraph()
    p.text = "Find My Professor bridges the physical-digital divide across university academic blocks.\n\n• Zero App Installation: Works natively in Safari/Chrome via standard smartphone camera.\n\n• Sub-Second Real-Time Sync: Changes made by professors push to all student phones instantly via Server-Sent Events (SSE).\n\n• Autonomy & Privacy: Faculty self-report availability in 1 tap without intrusive location surveillance."
    p.font.size = Pt(14)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(8)

    features = [
        ("1. Permanent QR Placards", "High-resolution QR placards outside cabin doors. Never need reprinting when schedules change."),
        ("2. 1-Tap Faculty Workspace", "Professors toggle status (Available, In Class, In Meeting, Away) with return time in 3 seconds."),
        ("3. 'Notify When Available' Alerts", "Students favorite teachers and receive instant live notifications the moment they return to office."),
        ("4. Conflict-Checked Micro-Consultations", "Students book 30-minute consultation slots; professors accept or decline with 1 click.")
    ]
    for i, (title, desc) in enumerate(features):
        y = Inches(1.8) + i * Inches(1.22)
        add_card(s10, Inches(6.7), y, Inches(5.8), Inches(1.1), C_WHITE, C_CARD_BORDER)
        tb = s10.shapes.add_textbox(Inches(6.9), y + Inches(0.12), Inches(5.4), Inches(0.86))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(12.5)
        p.font.color.rgb = C_TEXT_DARK
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    # -------------------------------------------------------------
    # SLIDE 11: Prototype & Workflow
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "06 · Prototype Phase", "Prototype & End-to-End Workflow", "Live interactive product demonstration and user touchpoints")
    
    # Workflow Steps
    steps = [
        ("01", "Scan Door Placard / Directory", "Student scans cabin door sticker (Room 127) or browses the campus directory."),
        ("02", "View Real-Time Availability", "Placard displays live color badges, return countdown, and weekly office hours."),
        ("03", "Tap 'Notify When Available'", "If teacher is away, student enables the bell toggle to subscribe to live arrival alerts."),
        ("04", "Request Consultation Slot", "Student selects time window and reason; system verifies no overlapping meetings exist."),
        ("05", "Instant SSE Synchronization", "Professor workspace receives instant alert; changes propagate in sub-second latency.")
    ]
    for i, (num, title, desc) in enumerate(steps):
        y = Inches(1.8) + i * Inches(0.98)
        add_card(s11, Inches(0.8), y, Inches(6.0), Inches(0.88), C_WHITE, C_CARD_BORDER)
        tb = s11.shapes.add_textbox(Inches(0.95), y + Inches(0.1), Inches(5.7), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{num} · {title}"
        p.font.bold = True
        p.font.size = Pt(11.5)
        p.font.color.rgb = C_PURPLE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_MUTED
        p2.space_before = Pt(2)

    # Product screenshots
    img1 = os.path.join(assets_dir, "product_mobile_placard.png")
    img2 = os.path.join(assets_dir, "product_workspace.png")
    if os.path.exists(img1):
        s11.shapes.add_picture(img1, Inches(7.1), Inches(1.8), width=Inches(2.2), height=Inches(4.8))
    if os.path.exists(img2):
        s11.shapes.add_picture(img2, Inches(9.5), Inches(1.8), width=Inches(3.0), height=Inches(4.8))

    # -------------------------------------------------------------
    # SLIDE 12: Technical Feasibility
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "07 · Technical Implementation", "Technical Feasibility & System Architecture", "Engineered for lightweight high-throughput campus execution")
    
    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), C_WHITE, C_CARD_BORDER)
    tb = s12.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORE TECHNOLOGY STACK"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_PURPLE
    p = tf.add_paragraph()
    p.text = "• Frontend SPA: React 19, TypeScript, Tailwind CSS v4, Lucide Icons\n\n• Backend API: Node.js, Express, TypeScript, Server-Sent Events (SSE)\n\n• Database & ORM: PostgreSQL with Prisma ORM, automated migrations\n\n• QR Engine: HTML5-QRCode scanner, dynamic canvas placard rendering\n\n• Cloud Hosting: Render Managed Web Service & Managed PostgreSQL with HTTPS"
    p.font.size = Pt(13)
    p.font.color.rgb = C_TEXT_DARK
    p.space_before = Pt(8)

    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.3), C_PURPLE)
    tb = s12.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "REACTIVE REAL-TIME ARCHITECTURE"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p = tf.add_paragraph()
    p.text = "Stateless SSE stream (/api/v1/events) maintains open connection with mobile clients. When status updates occur, an event fires, prompting active clients to refetch data with zero battery-draining polling."
    p.font.size = Pt(12.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    add_card(s12, Inches(6.8), Inches(4.3), Inches(5.7), Inches(2.3), RGBColor(254, 243, 199), RGBColor(245, 158, 11))
    tb = s12.shapes.add_textbox(Inches(7.1), Inches(4.5), Inches(5.1), Inches(1.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "MOBILE RESILIENCE & MITIGATIONS"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_AMBER
    p = tf.add_paragraph()
    p.text = "• Screen Sleep Reconnect: visibilitychange listener immediately reconnects and refetches the moment a student wakes their phone.\n• Staleness Guard: Configurable TTL flags self-reported status as 'Stale' if unconfirmed, preventing outdated information."
    p.font.size = Pt(12.5)
    p.font.color.rgb = RGBColor(120, 53, 15)
    p.space_before = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 13: Innovation (Desirability, Feasibility, Viability)
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "07 · Innovation Analysis", "Innovation: Desirability, Feasibility & Viability", "Assessing practical sustainability and campus-wide institutional viability")
    
    inno_cards = [
        ("DESIRABILITY", "Human Adoption", "Students already carry smartphones and instinctively scan QR codes daily. For faculty, a 1-tap mobile toggle respects their autonomy and takes less than 3 seconds.", RGBColor(59, 130, 246)),
        ("FEASIBILITY", "Engineering Viability", "Built entirely on modern, robust web standards (React 19, TypeScript, PostgreSQL, SSE). Zero hardware dependencies: uses durable laminated QR placards.", C_PURPLE),
        ("VIABILITY", "Institutional Value", "Can scale across all 15+ engineering departments of VNR VJIET at near-zero incremental cost. Can be hosted on internal college servers or lightweight cloud tiers.", C_GREEN)
    ]
    for i, (tag, title, desc, colr) in enumerate(inno_cards):
        x = Inches(0.8) + i * Inches(3.95)
        add_card(s13, x, Inches(1.8), Inches(3.8), Inches(2.4), C_WHITE, colr)
        tb = s13.shapes.add_textbox(x + Inches(0.2), Inches(2.0), Inches(3.4), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = tag
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = colr
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.bold = True
        p2.font.size = Pt(14)
        p2.font.color.rgb = C_TEXT_DARK
        p2.space_before = Pt(4)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = C_TEXT_MUTED
        p3.space_before = Pt(4)

    add_card(s13, Inches(0.8), Inches(4.5), Inches(11.7), Inches(2.1), C_PURPLE)
    tb = s13.shapes.add_textbox(Inches(1.1), Inches(4.7), Inches(11.1), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "INNOVATION STATEMENT"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p2 = tf.add_paragraph()
    p2.text = '"Where Is My Professor transforms passive campus doors into interactive, real-time communication portals, bridging the physical-digital divide in higher education through zero-cost QR infrastructure and instantaneous live event streams."'
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 14: Design for Environment & SDGs
    # -------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "08 · Sustainability", "Design for Environment and SDGs", "Contributing to institutional sustainability and UN Sustainable Development Goals")
    
    sdgs = [
        ("04", "QUALITY EDUCATION", "Maximizes high-value academic interaction. Removes transit friction and missed consultations, enabling focused final-year project guidance, lab mentorship, and academic growth.", RGBColor(197, 25, 45)),
        ("09", "INDUSTRY & INNOVATION", "Modernizes legacy university infrastructure into a smart, digital campus ecosystem using lightweight web technologies and cloud databases rather than expensive proprietary hardware.", RGBColor(243, 110, 37)),
        ("11", "SUSTAINABLE CITIES", "Reduces wasted inter-building foot transit and elevator electricity consumption across multi-story blocks. Completely eliminates recurring paper reprinting for notices and door schedules.", RGBColor(249, 157, 38))
    ]
    for i, (num, title, desc, colr) in enumerate(sdgs):
        x = Inches(0.8) + i * Inches(3.95)
        add_card(s14, x, Inches(1.8), Inches(3.8), Inches(4.8), colr)
        tb = s14.shapes.add_textbox(x + Inches(0.3), Inches(2.1), Inches(3.2), Inches(4.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"SDG {num}"
        p.font.bold = True
        p.font.size = Pt(28)
        p.font.color.rgb = C_WHITE
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.bold = True
        p2.font.size = Pt(15)
        p2.font.color.rgb = C_WHITE
        p2.space_before = Pt(4)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = RGBColor(254, 243, 199)
        p3.space_before = Pt(12)

    # -------------------------------------------------------------
    # SLIDE 15: Mentor Interactions
    # -------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, "09 · Feedback & Iteration", "Mentor Interactions & Refinements", "Guidance and evolutionary feedback from Mrs. Prasanna Pabba (Assistant Professor, CSE)")
    
    rows, cols = 4, 4
    t_shape = s15.shapes.add_table(rows, cols, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8))
    table = t_shape.table
    table.columns[0].width = Inches(1.6)
    table.columns[1].width = Inches(2.8)
    table.columns[2].width = Inches(3.6)
    table.columns[3].width = Inches(3.7)

    headers = ["STAGE", "FOCUS AREA", "MENTOR'S GUIDANCE", "ACTION TAKEN BY TEAM"]
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(241, 245, 249)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = C_TEXT_DARK

    mentor_data = [
        ("Iteration 1", "Problem Scope & Adoption", "'Avoid intrusive surveillance. Faculty will reject mandatory automated tracking.'", "Pivoted strictly to an autonomous 1-tap self-reported workspace with automatic TTL expiration."),
        ("Iteration 2", "Physical Door Placard", "'Students scanning the door still need general weekly schedules when teachers are away.'", "Integrated weekly recurring office-hour slots directly into placard with automated day highlighting."),
        ("Iteration 3", "Passive Real-Time Alerts", "'Students waiting outside shouldn't have to keep refreshing their phones.'", "Engineered 'Notify When Available' subscriber bell and real-time floating notification toasts.")
    ]
    for r, row in enumerate(mentor_data, start=1):
        for c, text in enumerate(row):
            cell = table.cell(r, c)
            cell.text = text
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(10)
            if c == 0:
                p.font.bold = True
                p.font.color.rgb = C_PURPLE

    # -------------------------------------------------------------
    # SLIDE 16: Team Experiences and Learnings
    # -------------------------------------------------------------
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, "10 · Reflection & Outcomes", "Team Experiences and Learnings", "Course Outcomes (COs) and collaborative Design Thinking growth")
    
    add_card(s16, Inches(0.8), Inches(1.8), Inches(6.5), Inches(4.8), C_WHITE, C_CARD_BORDER)
    tb = s16.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(6.1), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "COURSE OUTCOMES ACHIEVED"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_PURPLE

    cos = [
        ("CO-1 · Engineering Problem Definition", "Applied 5-stage Design Thinking to solve campus physical availability blindness."),
        ("CO-2 · Human-Centered Sustainability", "Connected human empathy with UN SDGs (SDG 4, 9, 11), saving transit energy and paper."),
        ("CO-3 · Rapid Interactive Prototyping", "Designed, coded, and iterated a production full-stack web app with mobile camera QR scanning."),
        ("CO-4 · Real-World Engineering Deployment", "Deployed to cloud with managed PostgreSQL, automated migrations, and seed pipelines.")
    ]
    for tag, desc in cos:
        p = tf.add_paragraph()
        p.text = f"• {tag}"
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = C_TEXT_DARK
        p.space_before = Pt(8)
        p2 = tf.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_TEXT_MUTED

    add_card(s16, Inches(7.6), Inches(1.8), Inches(4.9), Inches(4.8), C_PURPLE)
    tb = s16.shapes.add_textbox(Inches(7.9), Inches(2.1), Inches(4.3), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORE TEAM REFLECTION"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p = tf.add_paragraph()
    p.text = '"The greatest lesson from the CPDT Design Thinking curriculum was that engineering solutions succeed not because of algorithm complexity, but because of how deeply they respect human habits.\n\nBy eliminating the barrier of installing apps and keeping faculty updates to 1 tap, we turned a perennial campus frustration into a joyful, effortless interaction."'
    p.font.size = Pt(14)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(10)

    # -------------------------------------------------------------
    # SLIDE 17: Conclusion & Future Scope
    # -------------------------------------------------------------
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, "11 · Outlook", "Conclusion & Future Scope", "Scalable roadmap for institution-wide deployment across VNR VJIET")
    
    add_card(s17, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8), C_PURPLE)
    tb = s17.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.1), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "PROJECT CONCLUSION"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_GOLD
    p = tf.add_paragraph()
    p.text = "Find My Professor demonstrates how lightweight, modern web software can transform everyday physical architecture into dynamic, connected systems.\n\nThe system is fully functional, verified with automated end-to-end tests, supports 23 faculty accounts across 5 engineering branches, and is ready for departmental corridor rollout.\n\n'We don't replace personal faculty-student mentorship; we remove the friction that stands in its way.'"
    p.font.size = Pt(14)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(10)

    add_card(s17, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8), C_WHITE, C_CARD_BORDER)
    tb = s17.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "FUTURE EXPANSION ROADMAP"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = C_PURPLE
    p = tf.add_paragraph()
    p.text = "• Indoor Campus Navigation: Interactive maps guiding students from main gate to Room 127/201.\n\n• Low-Power E-Ink Cabin Displays: Battery-powered electronic door placards that sync status over Bluetooth/Wi-Fi automatically.\n\n• WhatsApp / Telegram Notification Bot: Direct push alerts to students' messaging apps when favorited faculty returns.\n\n• Official ERP (Automation4U) Integration: Auto-populating verified class schedules and exam duties."
    p.font.size = Pt(13)
    p.font.color.rgb = C_TEXT_DARK
    p.space_before = Pt(10)

    # -------------------------------------------------------------
    # SLIDE 18: Thank You
    # -------------------------------------------------------------
    s18 = prs.slides.add_slide(blank_layout)
    bg18 = s18.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg18.fill.solid()
    bg18.fill.fore_color.rgb = C_BG_DARK
    bg18.line.fill.background()

    tb = s18.shapes.add_textbox(Inches(1.5), Inches(1.5), Inches(10.3), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "VNR VJIET · CPDT 2026"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.alignment = PP_ALIGN.CENTER

    p = tf.add_paragraph()
    p.text = "Thank You!"
    p.font.size = Pt(64)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(16)
    p.alignment = PP_ALIGN.CENTER

    p = tf.add_paragraph()
    p.text = "Open for Questions, Live Demonstration & Feedback"
    p.font.size = Pt(20)
    p.font.color.rgb = RGBColor(226, 232, 240)
    p.space_before = Pt(10)
    p.alignment = PP_ALIGN.CENTER

    add_card(s18, Inches(3.6), Inches(4.8), Inches(6.1), Inches(1.6), RGBColor(40, 20, 70), RGBColor(90, 50, 130))
    tb_m = s18.shapes.add_textbox(Inches(3.8), Inches(4.9), Inches(5.7), Inches(1.4))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True
    p = tf_m.paragraphs[0]
    p.text = "PROJECT MENTOR"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.alignment = PP_ALIGN.CENTER
    p = tf_m.add_paragraph()
    p.text = "Mrs. Prasanna Pabba"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.alignment = PP_ALIGN.CENTER
    p = tf_m.add_paragraph()
    p.text = "Assistant Professor, Dept. of CSE · VNR VJIET"
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(203, 213, 225)
    p.alignment = PP_ALIGN.CENTER

    # Save to root and artifacts
    output_pptx = os.path.abspath("Find_My_Professor_Design_Thinking_VNRVJIET.pptx")
    prs.save(output_pptx)
    print("Full 18-slide PPTX generated successfully at:", output_pptx)

    artifact_pptx = "C:/Users/saiko/.gemini/antigravity-ide/brain/3a84fc56-7bbb-4089-af83-6586facec08c/Find_My_Professor_Design_Thinking_VNRVJIET.pptx"
    prs.save(artifact_pptx)
    print("Copied PPTX to artifacts at:", artifact_pptx)

if __name__ == "__main__":
    build_full_pptx()
