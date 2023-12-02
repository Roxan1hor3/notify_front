export const getCSVFile = (data: any) => {
  const blob = new Blob([data], {
    type: "text/csv;charset=utf-8;"
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("download", "download")

  a.click()
}
