import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

type TParseFormDataJsonOptions = {
  field: string;
};
@Injectable()
export class ParseFormDataJsonPipe implements PipeTransform {
  constructor(private readonly options?: TParseFormDataJsonOptions) {}

  transform(value: any) {
    const { field } = this.options;
    console.log(value[field]);
    const jsonField = value[field].replace(
      /(\w+:)|(\w+ :)/g,
      function (matchedStr: string) {
        return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
      },
    );
    return JSON.parse(jsonField);
  }
}
