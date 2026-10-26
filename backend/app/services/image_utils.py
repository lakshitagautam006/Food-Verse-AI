import io
import base64
from typing import Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit to protect low-RAM systems
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_DIMENSION = 1024  # Resize maximum width/height to conserve memory and API bandwidth

async def validate_and_process_image(file: UploadFile) -> Tuple[str, str]:
    """
    Validates uploaded image file size, MIME type, and visual integrity.
    Resizes image to max 1024x1024 if needed to run cleanly on lightweight machines.
    Returns: (base64_encoded_data, mime_type)
    """
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")

    # 1. Content-Type check
    content_type = file.content_type or ""
    if content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{content_type}'. Allowed formats are JPEG, PNG, and WEBP."
        )

    # 2. File size check
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

    if len(contents) > MAX_FILE_SIZE_BYTES:
        size_mb = len(contents) / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"Image size ({size_mb:.1f} MB) exceeds maximum allowed limit of 5 MB."
        )

    # 3. PIL verification and downscaling
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()  # Verify image integrity
        
        # Re-open after verify() because verify() can corrupt stream position
        image = Image.open(io.BytesIO(contents))
        
        # Convert RGBA to RGB for JPEG compatibility if saving as JPEG
        format_to_save = "JPEG"
        target_mime = "image/jpeg"
        if image.format in ("PNG", "WEBP") and image.mode in ("RGBA", "LA", "P"):
            format_to_save = image.format
            target_mime = f"image/{image.format.lower()}"
        elif image.mode != "RGB":
            image = image.convert("RGB")

        # Resize if dimensions exceed MAX_DIMENSION
        if max(image.size) > MAX_DIMENSION:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

        output_buffer = io.BytesIO()
        image.save(output_buffer, format=format_to_save, quality=85)
        processed_bytes = output_buffer.getvalue()

        # 4. Convert to base64
        b64_data = base64.b64encode(processed_bytes).decode("utf-8")
        return b64_data, target_mime

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )
