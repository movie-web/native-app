import { Link, Stack } from "expo-router";
import { Text, View } from "tamagui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View flex={1} alignItems="center" justifyContent="center" padding={5}>
        <Text fontWeight="bold">This screen doesn&apos;t exist.</Text>

        <Link
          href="/"
          style={{
            marginTop: 16,
            paddingVertical: 16,
          }}
        >
          <Text color="skyblue">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
