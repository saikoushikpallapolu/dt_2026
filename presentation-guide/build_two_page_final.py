from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH

root = Path(__file__).parent
source = (root / 'two-page-final.md').read_text(encoding='utf-8')
doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.27), Inches(11.69)
section.top_margin, section.bottom_margin = Inches(.66), Inches(.65)
section.left_margin, section.right_margin = Inches(.72), Inches(.72)
section.footer_distance = Inches(.28)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3', 'List Bullet', 'List Number']:
    style = doc.styles[name]
    style.font.name = 'Calibri'
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.widow_control = True
for style in doc.styles:
    for border in list(style.element.iter(qn('w:pBdr'))):
        border.getparent().remove(border)
normal = doc.styles['Normal']
normal.font.size = Pt(10.5)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.06
for name, size in [('Title', 25), ('Heading 1', 19), ('Heading 2', 12)]:
    style = doc.styles[name]
    style.font.size = Pt(size)
    style.font.bold = True
    style.paragraph_format.space_before = Pt(9 if name == 'Heading 2' else 0)
    style.paragraph_format.space_after = Pt(7)
    style.paragraph_format.keep_with_next = True
for name in ['List Bullet', 'List Number']:
    doc.styles[name].paragraph_format.space_after = Pt(4)
    doc.styles[name].paragraph_format.line_spacing = 1.03
doc.core_properties.title = 'Find My Professor Presentation Guide'
doc.core_properties.subject = 'Project workflow technology demonstration and judge preparation'
doc.core_properties.author = 'Find My Professor Project Team'

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('Find My Professor  |  ')
r.font.size=Pt(8)
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)

def inline(p, text):
    for i, chunk in enumerate(re.split(r'\*\*(.*?)\*\*', text)):
        r=p.add_run(chunk)
        r.bold=bool(i%2)

def table(rows):
    n=len(rows[0])
    t=doc.add_table(rows=0, cols=n)
    t.alignment=WD_TABLE_ALIGNMENT.CENTER
    t.autofit=False
    widths=([2.1,4.73] if n==2 else [1.15,2.45,3.23] if n==3 else [1.8]+[5.03/(n-1)]*(n-1))
    if rows[0][0]=='Record':widths=[1.75,2.15,2.93]
    for c,w in zip(t.columns,widths):c.width=Inches(w)
    borders=OxmlElement('w:tblBorders')
    for side in ['top','left','bottom','right','insideH','insideV']:
        e=OxmlElement('w:'+side);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
    t._tbl.tblPr.append(borders)
    for idx,row in enumerate(rows):
        cells=t.add_row().cells
        for j,(c,text) in enumerate(zip(cells,row)):
            c.width=Inches(widths[j]);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcPr=c._tc.get_or_add_tcPr()
            shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'233A52' if idx==0 else ('F2F5F8' if idx%2==0 else 'FFFFFF'));tcPr.append(shade)
            margins=OxmlElement('w:tcMar')
            for side in ['top','left','bottom','right']:
                v=OxmlElement('w:'+side);v.set(qn('w:w'),'80');v.set(qn('w:type'),'dxa');margins.append(v)
            tcPr.append(margins)
            p=c.paragraphs[0];p.paragraph_format.space_after=Pt(0);p.paragraph_format.line_spacing=1.02
            inline(p,text)
            for r in p.runs:
                r.font.size=Pt(9.25)
                if idx==0:r.bold=True;r.font.color.rgb=RGBColor(255,255,255)
        trPr=t.rows[-1]._tr.get_or_add_trPr()
        cant=OxmlElement('w:cantSplit');trPr.append(cant)
        if idx==0:
            repeat=OxmlElement('w:tblHeader');trPr.append(repeat)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

pages=source.split('---PAGE---')
for page_idx,page in enumerate(pages):
    if page_idx:doc.add_page_break()
    lines=page.strip().splitlines();i=0;code=False
    while i<len(lines):
        line=lines[i].strip()
        if not line:i+=1;continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                rows.append([x.strip() for x in lines[i].strip().strip('|').split('|')]);i+=1
            table(rows);continue
        if line.startswith('```'):code=not code;i+=1;continue
        if code:
            p=doc.add_paragraph();r=p.add_run(line);r.font.name='Consolas';r.font.size=Pt(9)
            p.paragraph_format.space_after=Pt(2)
        elif line.startswith('# '):
            p=doc.add_paragraph(line[2:], 'Title' if page_idx==0 else 'Heading 1')
        elif line.startswith('## '):doc.add_paragraph(line[3:], 'Heading 2')
        elif line.startswith('- '):inline(doc.add_paragraph(style='List Bullet'),line[2:])
        elif re.match(r'^\d+\. ',line):
            p=doc.add_paragraph()
            p.paragraph_format.left_indent=Inches(.24)
            p.paragraph_format.first_line_indent=Inches(-.24)
            p.paragraph_format.space_after=Pt(4)
            inline(p,re.sub(r'^(\d+)\. ',r'\1.\t',line))
        else:inline(doc.add_paragraph(),line)
        i+=1
path=root/'Find_My_Professor_TWO_PAGES_FINAL.docx'
doc.save(path)
print(path)
print('Planned pages:',len(pages),'Words:',len(source.split()))
