import re

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


RESUME_HEADINGS = {
    "SUMMARY",
    "PROFESSIONAL SUMMARY",
    "PROFILE",
    "PROFESSIONAL PROFILE",
    "OBJECTIVE",
    "CAREER OBJECTIVE",
    "TECHNICAL SKILLS",
    "SKILLS",
    "CORE SKILLS",
    "CORE COMPETENCIES",
    "PROFESSIONAL EXPERIENCE",
    "WORK EXPERIENCE",
    "EXPERIENCE",
    "PROJECTS",
    "EDUCATION",
    "CERTIFICATIONS",
    "CERTIFICATES",
    "LANGUAGES",
    "AWARDS",
    "ACHIEVEMENTS",
    "PUBLICATIONS",
    "VOLUNTEER EXPERIENCE",
    "VOLUNTEERING",
    "ADDITIONAL INFORMATION",
}

NAVY = RGBColor(31, 55, 75)
TEAL = RGBColor(0, 117, 122)
BODY = RGBColor(48, 57, 65)
MUTED = RGBColor(95, 108, 117)


def _add_bottom_border(paragraph):
    properties = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    border = OxmlElement("w:bottom")
    border.set(qn("w:val"), "single")
    border.set(qn("w:sz"), "8")
    border.set(qn("w:space"), "4")
    border.set(qn("w:color"), "00757A")
    borders.append(border)
    properties.append(borders)


def _add_markdown_runs(paragraph, text, font_size, color):
    for index, part in enumerate(re.split(r"\*\*(.*?)\*\*", text)):
        run = paragraph.add_run(part)
        run.bold = index % 2 == 1
        run.font.name = "Aptos"
        run.font.size = Pt(font_size)
        run.font.color.rgb = color


def _add_resume_docx(document, text):
    section = document.sections[0]
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)
    section.left_margin = Inches(0.7)
    section.right_margin = Inches(0.7)

    normal = document.styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(9.5)
    normal.font.color.rgb = BODY
    normal.paragraph_format.space_after = Pt(3)
    normal.paragraph_format.line_spacing = 1.05

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    first_section_index = next(
        (
            index
            for index, line in enumerate(lines)
            if line.rstrip(":").upper() in RESUME_HEADINGS
        ),
        len(lines),
    )

    if lines:
        name = document.add_paragraph()
        name.alignment = WD_ALIGN_PARAGRAPH.CENTER
        name.paragraph_format.space_after = Pt(2)
        name.paragraph_format.keep_with_next = True
        run = name.add_run(lines[0])
        run.bold = True
        run.font.name = "Aptos Display"
        run.font.size = Pt(23)
        run.font.color.rgb = NAVY

    for line in lines[1:first_section_index]:
        contact = document.add_paragraph()
        contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact.paragraph_format.space_after = Pt(2)
        contact.paragraph_format.keep_with_next = True
        _add_markdown_runs(contact, line, 9, MUTED)

    current_section = ""
    entry_sections = {
        "PROFESSIONAL EXPERIENCE",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "PROJECTS",
        "EDUCATION",
    }

    for line in lines[first_section_index:]:
        normalized = line.rstrip(":").upper()
        if normalized in RESUME_HEADINGS:
            current_section = normalized
            heading = document.add_paragraph()
            heading.paragraph_format.space_before = Pt(8)
            heading.paragraph_format.space_after = Pt(4)
            heading.paragraph_format.keep_with_next = True
            run = heading.add_run(normalized)
            run.bold = True
            run.font.name = "Aptos"
            run.font.size = Pt(10)
            run.font.color.rgb = TEAL
            _add_bottom_border(heading)
            continue

        bullet = re.match(r"^\s*(?:[•●▪◦*-])\s+(.+)$", line)
        if bullet:
            paragraph = document.add_paragraph(style="List Bullet")
            paragraph.paragraph_format.left_indent = Inches(0.2)
            paragraph.paragraph_format.first_line_indent = Inches(-0.12)
            paragraph.paragraph_format.space_after = Pt(2)
            _add_markdown_runs(paragraph, bullet.group(1), 9.5, BODY)
        elif current_section in entry_sections and " | " in line:
            paragraph = document.add_paragraph()
            paragraph.paragraph_format.space_before = Pt(2)
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.keep_with_next = True
            run = paragraph.add_run(line)
            run.bold = True
            run.font.name = "Aptos"
            run.font.size = Pt(9.5)
            run.font.color.rgb = NAVY
        else:
            paragraph = document.add_paragraph()
            paragraph.paragraph_format.space_after = Pt(3)
            _add_markdown_runs(paragraph, line, 9.5, BODY)


def generate_docx(
    text: str,
    output_path: str,
    compact: bool = True,
    resume: bool = False,
):

    document = Document()

    if resume:
        _add_resume_docx(document, text)
        document.save(output_path)
        return output_path

    section = document.sections[0]

    if compact:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    for line in text.splitlines():

        line = line.strip()

        # Preserve empty lines for spacing
        if not line:
            document.add_paragraph()
            continue

        if line.isupper():

            p = document.add_paragraph()

            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(line)
            run.bold = True
            run.font.size = Pt(12)

        else:

            p = document.add_paragraph()

            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15

            # Handle markdown bold syntax **text**
            parts = re.split(r'\*\*(.*?)\*\*', line)
            
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Odd indices are the bold parts
                    run = p.add_run(part)
                    run.bold = True
                    run.font.size = Pt(11)
                else:
                    run = p.add_run(part)
                    run.font.size = Pt(11)

    document.save(output_path)

    return output_path