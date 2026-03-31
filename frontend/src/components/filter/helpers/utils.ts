import { FieldOption } from '@components/filter/helpers/types.ts'

export function isFieldOption(opt: unknown): opt is FieldOption {
    return opt && typeof opt === 'object'
        ? Object.prototype.hasOwnProperty.call(opt, 'value')
        : false
}
