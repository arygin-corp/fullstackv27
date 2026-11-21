from whitenoise.storage import CompressedManifestStaticFilesStorage as WhiteNoiseStorage


class CompressedManifestStaticFilesStorage(WhiteNoiseStorage):
    """Keep a vendor URL unchanged when the referenced file was not shipped.

    Bootstrap source maps and optional carousel images are cited by the
    minified files but are not in this repository. Manifest collection
    otherwise stops the QA deploy on the first missing reference.
    """

    def hashed_name(self, name, content=None, filename=None):
        try:
            return super().hashed_name(name, content, filename)
        except ValueError as error:
            message = error.args[0] if error.args else ""
            if "could not be found" in message:
                return name
            raise
