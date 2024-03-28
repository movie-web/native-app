import type { Input } from "tamagui";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useTheme, View } from "tamagui";

import { MWInput } from "./Input";

export function SearchBar({
  onSearchChange,
}: {
  onSearchChange: (text: string) => void;
}) {
  const theme = useTheme();
  const pageIsFocused = useIsFocused();
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<Input>(null);

  useEffect(() => {
    if (pageIsFocused) {
      inputRef.current?.focus();
    }
  }, [pageIsFocused]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsFocused(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsFocused(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleChange = (text: string) => {
    setKeyword(text);
    onSearchChange(text);
  };

  return (
    <View
      marginBottom={12}
      flexDirection="row"
      alignItems="center"
      borderRadius={999}
      borderWidth={1}
      backgroundColor={isFocused ? theme.searchFocused : theme.searchBackground}
    >
      <View width={48} alignItems="center" justifyContent="center">
        <FontAwesome5 name="search" size={18} color={theme.searchIcon.val} />
      </View>
      <MWInput
        type="search"
        value={keyword}
        onChangeText={handleChange}
        ref={inputRef}
        placeholder="What are you looking for?"
        width="80%"
        borderColor={isFocused ? theme.colorTransparent : theme.inputBorder}
        backgroundColor={
          isFocused ? theme.searchFocused : theme.searchBackground
        }
      />
    </View>
  );
}
