import { Select, styled, withStaticProperties } from "tamagui";

const MWSelectFrame = styled(Select, {
  variants: {
    type: {
      default: {
        backgroundColor: "$inputBackground",
        color: "$inputText",
        borderColor: "$inputBorder",
      },
    },
  },
  defaultVariants: {
    type: "default",
  },
});

const MWSelectTrigger = styled(Select.Trigger, {
  variants: {
    type: {
      default: {
        backgroundColor: "$inputBackground",
        color: "$inputText",
        placeholderTextColor: "$inputPlaceholderText",
        borderColor: "$inputBorder",
      },
    },
  },
  defaultVariants: {
    type: "default",
  },
});

const MWSelect = withStaticProperties(MWSelectFrame, {
  Trigger: MWSelectTrigger,
});

export { MWSelect };
