import { IsEnum, IsNotEmpty } from 'class-validator';
import { Language } from 'src/common/enums/language.enum';

export class UpdateLanguageDto {
  @IsNotEmpty({ message: 'errors.validation.language_required' })
  @IsEnum(Language, { message: 'errors.validation.invalid_language' })
  newLanguage: Language;
}
