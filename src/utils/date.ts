export const getFormatedDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Kyiv"
  }).format(new Date(date))
}
