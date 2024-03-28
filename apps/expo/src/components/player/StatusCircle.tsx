import React from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";
import { AntDesign } from "@expo/vector-icons";
import { View } from "tamagui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const StatusCircle = ({
  type,
  percentage = 0,
}: {
  type: string;
  percentage: number;
}) => {
  const radius = 25;
  const strokeWidth = 5;
  const circleCircumference = 2 * Math.PI * radius;

  const strokeDashoffset = useSharedValue(circleCircumference);

  React.useEffect(() => {
    strokeDashoffset.value = withTiming(
      circleCircumference - (circleCircumference * percentage) / 100,
      {
        duration: 500,
        easing: Easing.linear,
      },
    );
  }, [circleCircumference, percentage, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const renderIcon = () => {
    switch (type) {
      case "success":
        return <AntDesign name="checkcircle" size={50} color="green" />;
      case "error":
        return <AntDesign name="closecircle" size={50} color="red" />;
      default:
        return null;
    }
  };

  return (
    <View justifyContent="center" alignItems="center" position="relative">
      <Svg height="60" width="60" viewBox="0 0 60 60">
        {type === "loading" && (
          <AnimatedCircle
            cx="30"
            cy="30"
            r={radius}
            stroke="blue"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circleCircumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {renderIcon()}
    </View>
  );
};
