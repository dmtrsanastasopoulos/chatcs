#!/usr/bin/env python3
"""
Fetches all Google Shopping offers for the Tecnolumen Wagenfeld WG 24
from the async/oapv endpoint and extracts prices + seller names.

Run: python3 extract_offers.py
"""

import re
import sys

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

CATALOG_ID = "1299683159093447658"

# This URL works without session tokens and returns all offer data
URL = (
    "https://www.google.de/async/oapv"
    "?gl=de&hl=de&yv=3&pvorigin=0&q=*"
    "&async_context=MORE_STORES&ibp=oshop&cs=0"
    f"&async=pvt:,query:*,catalogid:{CATALOG_ID},sori:0,mno:50,pvf:,_fmt:jspb"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "de-DE,de;q=0.9",
    "Referer": "https://www.google.de/",
}


def extract_offers(data: bytes) -> list[dict]:
    """Extract seller names and prices from jspb binary data using regex."""
    # Decode as latin-1 to preserve all bytes while allowing string search
    text = data.decode("latin-1")

    offers = []

    # Extract price patterns: e.g. "549,00" followed by currency, or EUR amounts
    # In jspb, strings appear as UTF-8 but decoded as latin-1 they're still readable
    price_pattern = re.compile(r"(\d{1,4}[.,]\d{2})\s*(?:\xe2\x82\xac|EUR|€)?", re.IGNORECASE)

    # Extract German retailer names (common patterns)
    # Look for strings between null bytes that look like domain names or shop names
    seller_pattern = re.compile(
        r"(?:https?://)?(?:www\.)?([a-zA-Z0-9\-]{3,30}\.(?:de|com|eu|at|ch))"
    )

    sellers = set(m.group(1) for m in seller_pattern.finditer(text))
    prices_raw = price_pattern.findall(text)

    # Filter prices to reasonable range (€300-€1500 for this lamp)
    prices = []
    for p in prices_raw:
        try:
            val = float(p.replace(",", "."))
            if 300 <= val <= 1500:
                prices.append(p + " €")
        except ValueError:
            pass
    prices = sorted(set(prices), key=lambda x: float(x.replace(" €", "").replace(",", ".")))

    return {"sellers": sorted(sellers), "prices": prices}


def main():
    print("Fetching offer data from Google Shopping async endpoint...")
    print(f"URL: {URL[:100]}...")
    print()

    try:
        resp = requests.get(URL, headers=HEADERS, timeout=20)
        print(f"HTTP Status: {resp.status_code}")
        print(f"Response size: {len(resp.content):,} bytes")
        print()

        if resp.status_code != 200:
            print(f"Error: got status {resp.status_code}")
            return

        data = extract_offers(resp.content)

        print(f"=== PRICES FOUND ({len(data['prices'])}) ===")
        for p in data["prices"]:
            print(f"  {p}")

        print()
        print(f"=== SELLERS/DOMAINS FOUND ({len(data['sellers'])}) ===")
        for s in data["sellers"]:
            print(f"  {s}")

        print()
        if len(data["prices"]) >= 5:
            print("✅ Successfully retrieved offer data from the async endpoint.")
            print(f"   Direct URL (no browser needed):")
            print(f"   {URL}")
        else:
            print("⚠️  Few prices found — the binary format may need a different parser.")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
