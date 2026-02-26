const BASE_URL =
  'https://g09254cbbf8e7af-graysprod.adb.eu-frankfurt-1.oraclecloudapps.com/ords/WKSP_GRAYSAPP/WAREHOUSEMANAGEMENT/GETTRIPDETAILS'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}-${month}-${d.getFullYear()}`
}

export async function fetchTrips({ dateFrom, dateTo, instance }) {
  const params = new URLSearchParams({
    P_DATE_FROM: formatDate(dateFrom),
    P_DATE_TO: formatDate(dateTo),
    P_INSTANCE_NAME: instance,
  })

  const res = await fetch(`${BASE_URL}?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`Server returned ${res.status}`)

  const json = await res.json()
  let items = json
  if (json?.items) items = json.items
  if (!Array.isArray(items)) items = []
  return items
}
