import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "tamagui";

type Props = {
  focused?: boolean;
} & React.ComponentProps<typeof FontAwesome>;

export default function TabBarIcon({ focused, ...rest }: Props) {
  const theme = useTheme();
  const color = focused ? theme.tabBarIconFocused.val : theme.tabBarIcon.val;
  return <FontAwesome color={color} size={24} {...rest} />;
}
