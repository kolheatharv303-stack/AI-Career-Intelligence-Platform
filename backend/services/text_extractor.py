"""Safe, asynchronous text extraction for uploaded PDF and plain-text files."""

import io
import logging
from typing import Union
from fastapi import UploadFile, HTTPException, status

logger = logging.getLogger("career_intel.extractor")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


async def extract_text_from_upload(file: UploadFile) -> str:
    """Extract and sanitize text from an uploaded PDF or TXT file."""
    content_type = file.content_type or ""
    filename = file.filename or ""

    # Read binary bytes with size safety
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )

    # Process Plain Text
    if (
        content_type.startswith("text/")
        or filename.endswith(".txt")
        or filename.endswith(".md")
    ):
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return file_bytes.decode("latin-1")
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to decode text file: {str(e)}"
                )

    # Process PDF
    if (
        content_type == "application/pdf"
        or filename.endswith(".pdf")
    ):
        return _extract_from_pdf_bytes(file_bytes)

    # Unknown or unsupported file type
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail=f"Unsupported file type '{content_type}'. Please upload a PDF or TXT resume."
    )


def _extract_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using pypdf with fallback."""
    extracted_text_chunks = []

    try:
        # Try pypdf first
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text_chunks.append(page_text.strip())
    except ImportError:
        logger.warning("pypdf not installed. Falling back to pdfplumber or raw stream decoding.")
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    txt = page.extract_text()
                    if txt:
                        extracted_text_chunks.append(txt.strip())
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to extract text from PDF document."
            )
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read PDF contents: {str(e)}"
        )

    full_text = "\n\n".join(extracted_text_chunks).strip()
    if not full_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded PDF appears to be empty or contains only scanned images without OCR text."
        )

    return full_text
