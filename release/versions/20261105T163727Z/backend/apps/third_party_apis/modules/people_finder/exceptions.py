class PeopleDirectoryError(RuntimeError):
    """An upstream directory configuration or request failed."""


class InvalidPeopleCursor(ValueError):
    """The caller supplied an invalid or unapproved pagination cursor."""
