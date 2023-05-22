import { Font as FontKitFont, open as fontKitOpen } from 'fontkit'
import { FontProperties, FontStateWritten } from '../types'

export const fontOpen = async (
  state: Omit<FontStateWritten, 'type'>,
  _: Omit<Required<FontProperties>, 'fontFamily'>
): Promise<FontKitFont> => {
  const isVariableFont = state.font.tech?.includes('variations') === true

  // const source = path.resolve(/* state.configurationDirectory */process.cwd(), state.font.source)

  const font = await fontKitOpen(state.files[0] /* source */)

  if (isVariableFont) {
    // TODO: figure out the variable font thing
    // console.log(properties)
    // console.log(font)

    return font
  }

  return font
}
