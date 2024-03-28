import { useMemo, useState } from "react";

type InitialState = boolean | (() => boolean);

export const useBoolean = (initialState: InitialState = false) => {
  const [value, setValue] = useState(initialState);
  const callbacks = useMemo(
    () => ({
      on: () => setValue(true),
      off: () => setValue(false),
      toggle: () => setValue((prev) => !prev),
    }),
    [],
  );
  return {
    isTrue: value,
    ...callbacks,
  };
};
