from app.services.pdf_parser import extract_text_from_pdf
from pathlib import Path
import tempfile


def test_extract_text_from_pdf():
    pdf_file = Path(tempfile.gettempdir()) / "test_resume.pdf"
    pdf_file.write_bytes(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Hello PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000100 00000 n \n0000000207 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n317\n%%EOF")

    try:
        text = extract_text_from_pdf(str(pdf_file))
        assert "Hello PDF" in text
    finally:
        pdf_file.unlink(missing_ok=True)
