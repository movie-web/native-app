export const mapMillisecondsToTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  const components: string[] = [];

  if (hours > 0) {
    components.push(hours.toString().padStart(2, "0"));
  }

  components.push(minutes.toString().padStart(2, "0"));
  components.push(seconds.toString().padStart(2, "0"));

  const formattedTime = components.join(":");

  return formattedTime;
};
