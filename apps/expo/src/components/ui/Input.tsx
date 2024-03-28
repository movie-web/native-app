import { Input, styled } from "tamagui";

export const MWInput = styled(Input, {
  variants: {
    type: {
      default: {
        backgroundColor: "$inputBackground",
        color: "$inputText",
        placeholderTextColor: "$placeHolderText",
        borderColor: "$inputBorder",
        outlineStyle: "none",
      },
      search: {
        backgroundColor: "$searchBackground",
        borderColor: "$colorTransparent",
        placeholderTextColor: "$searchPlaceholder",
        outlineStyle: "none",
        focusStyle: {
          borderColor: "$colorTransparent",
          backgroundColor: "$searchFocused",
        },
      },
    },
  },
});
