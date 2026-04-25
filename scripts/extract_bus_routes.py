"""
Reads avtobus_cedveli.xlsx and writes a structured JSON
to database/baku-bus-routes.json (and copies to frontend/data/).
Run: python scripts/extract_bus_routes.py
"""
from __future__ import annotations
import json
import re
import shutil
from pathlib import Path

import openpyxl

SRC_XLSX = Path(r"c:\Users\vivex\Desktop\avtobus_cedveli.xlsx")
ROOT = Path(__file__).resolve().parents[1]
DB_OUT = ROOT / "database" / "baku-bus-routes.json"
FE_OUT = ROOT / "frontend" / "data" / "baku-bus-routes.json"


def norm_time(value) -> str:
    """Normalise to HH:MM 24-hour string."""
    if value is None:
        return ""
    if hasattr(value, "strftime"):
        return value.strftime("%H:%M")
    s = str(value).strip()
    m = re.match(r"^(\d{1,2})[:.](\d{2})", s)
    if m:
        return f"{int(m.group(1)):02d}:{m.group(2)}"
    return s


def split_stops(raw: str) -> list[str]:
    if not raw:
        return []
    parts = [p.strip() for p in raw.split(",")]
    return [p for p in parts if p]


def main() -> None:
    wb = openpyxl.load_workbook(SRC_XLSX, data_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    header = rows[0]
    body = rows[1:]

    routes = []
    for row in body:
        if not row or row[0] is None:
            continue
        code = str(row[0]).strip()
        origin = (str(row[1]).strip() if row[1] else "")
        destination = (str(row[2]).strip() if row[2] else "")
        first = norm_time(row[3])
        last = norm_time(row[4])
        stops_raw = (str(row[5]).strip() if row[5] else "")
        stops = split_stops(stops_raw)

        routes.append({
            "code": code,
            "origin": origin,
            "destination": destination,
            "firstDeparture": first,
            "lastDeparture": last,
            "stopCount": len(stops),
            "stops": stops,
            "stopsRaw": stops_raw,
        })

    payload = {
        "source": SRC_XLSX.name,
        "sheet": ws.title,
        "city": "Bakı",
        "transportType": "bus",
        "currency": "AZN",
        "fareDefault": 0.5,
        "totalRoutes": len(routes),
        "fields": {
            "code": "Marşrut nömrəsi",
            "origin": "A məntəqə (başlanğıc)",
            "destination": "B məntəqə (son)",
            "firstDeparture": "İlk çıxış (HH:MM)",
            "lastDeparture": "Son çıxış (HH:MM)",
            "stops": "Bütün dayanacaqlar (sıra ilə)",
            "stopCount": "Dayanacaqların sayı",
            "stopsRaw": "Excel-dəki orijinal vergüllü mətn",
        },
        "header": list(header),
        "routes": routes,
    }

    DB_OUT.parent.mkdir(parents=True, exist_ok=True)
    FE_OUT.parent.mkdir(parents=True, exist_ok=True)

    DB_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.copyfile(DB_OUT, FE_OUT)

    print(f"Wrote {len(routes)} routes")
    print(f"  -> {DB_OUT}")
    print(f"  -> {FE_OUT}")


if __name__ == "__main__":
    main()
