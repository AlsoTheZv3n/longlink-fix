from typing import Annotated
from pydantic import EmailStr, AfterValidator

Email = Annotated[EmailStr, AfterValidator(str.lower)]
