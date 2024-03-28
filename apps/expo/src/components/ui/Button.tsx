import { Button, styled } from "tamagui";

export const MWButton = styled(Button, {
  variants: {
    type: {
      primary: {
        backgroundColor: "$buttonPrimaryBackground",
        color: "$buttonPrimaryText",
        fontWeight: "bold",
      },
      secondary: {
        backgroundColor: "$buttonSecondaryBackground",
        color: "$buttonSecondaryText",
        fontWeight: "bold",
      },
      purple: {
        backgroundColor: "$buttonPurpleBackground",
        color: "white",
        fontWeight: "bold",
      },
      cancel: {
        backgroundColor: "$buttonCancelBackground",
        color: "white",
        fontWeight: "bold",
      },
    },
  } as const,
});
