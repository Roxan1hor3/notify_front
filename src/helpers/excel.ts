export const getExcelFile = (data: any) => {
  const blob = new Blob([data], {
    type: "text/csv"
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("download", "download")

  a.click()
}
