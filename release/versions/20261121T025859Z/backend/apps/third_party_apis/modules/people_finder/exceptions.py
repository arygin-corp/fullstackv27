class PeopleDirectoryError(RuntimeError):
    """An upstream directory configuration or request failed."""


class ExternalApiConfigurationError(PeopleDirectoryError):
    """A directory setting is missing or invalid."""


class ExternalApiRequestError(PeopleDirectoryError):
    """An upstream directory request failed or returned invalid data."""


class InvalidPeopleCursor(ValueError):
    """The caller supplied an invalid or unapproved pagination cursor."""
