export function getTimeLabel(date: Date | string = new Date()) {
  return new Intl.DateTimeFormat("ru", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}
