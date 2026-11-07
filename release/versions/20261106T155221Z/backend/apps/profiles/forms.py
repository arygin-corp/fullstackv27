# profiles/forms.py
from django import forms
from .models import Profile
from PIL import Image # Import Pillow for image processing (already likely installed for ImageField)

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['user', 'team', 'image', 'job_title', 'job_subtitle', 'department', 'address_line1', 'address_line2', 'city', 'state', 'zipcode', 'country', 'phone', 'is_active']

    def clean_profile_picture(self):
        profile_picture = self.cleaned_data.get('profile_picture')

        if profile_picture:
            # 1. File Size Validation (e.g., 2MB limit)
            MAX_UPLOAD_SIZE = 2 * 1024 * 1024 # 2MB in bytes
            if profile_picture.size > MAX_UPLOAD_SIZE:
                raise forms.ValidationError(
                    f"The maximum file size allowed is {MAX_UPLOAD_SIZE / (1024*1024):.0f}MB. "
                    f"You uploaded a file of {profile_picture.size / (1024*1024):.2f}MB."
                )

            # 2. File Type/Extension Validation
            # You can check content type or file extension.
            # Content type is more reliable but can be spoofed.
            # For simplicity and common use, we'll check common image types and use Pillow to verify.
            allowed_types = ['image/jpeg', 'image/png', 'image/gif']
            if profile_picture.content_type not in allowed_types:
                raise forms.ValidationError("Only JPEG, PNG, and GIF images are allowed.")

            # Optional: Further verification using Pillow to ensure it's a valid image
            try:
                # Use Pillow to try opening the image. This will raise an error for invalid image files.
                # We don't save it, just verify it can be opened.
                Image.open(profile_picture)
                profile_picture.seek(0) # Reset stream position after reading with Pillow
            except Exception:
                raise forms.ValidationError("The uploaded file is not a valid image.")

        return profile_picture