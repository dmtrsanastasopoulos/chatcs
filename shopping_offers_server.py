#!/usr/bin/env python3
"""
Local server that fetches all Google Shopping offers for the
Tecnolumen Wagenfeld WG 24 and displays them at http://localhost:8080

Run: python3 shopping_offers_server.py
Then open: http://localhost:8080
"""

import re
import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

CATALOG_ID = "1299683159093447658"
PRODUCT_NAME = "Tecnolumen Wagenfeld WG 24"
PORT = 8080

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9",
}


def fetch_all_offers():
    """
    Two-step process:
    1. Load the initial shopping panel page (gets session tokens + first 5 offers)
    2. Load the async endpoint with those tokens to get all remaining offers
    Returns list of dicts with keys: shop, price, url, delivery
    """
    session = requests.Session()
    initial_url = (
        f"https://www.google.de/search?ibp=oshop&q=*"
        f"&prds=catalogid:{CATALOG_ID},sori:0,mno:15&hl=de&gl=de"
    )

    print("Step 1: Loading initial page...")
    resp = session.get(initial_url, headers=HEADERS, timeout=20)
    html = resp.text
    print(f"  Status: {resp.status_code}, Size: {len(html):,} bytes")

    # Extract session tokens embedded in the page JS
    ei = re.search(r'"ei"\s*:\s*"([^"]+)"', html)
    xsrf = re.search(r'"FdrFJe"\s*:\s*"([^"]+)"', html)  # Google XSRF token key
    oapvfc = re.search(r'"oapvfc"\s*:\s*"([^"]+)"', html)

    ei_val = ei.group(1) if ei else ""
    xsrf_val = xsrf.group(1) if xsrf else ""
    oapvfc_val = oapvfc.group(1) if oapvfc else ""

    print(f"  ei: {'found' if ei_val else 'not found'}")
    print(f"  xsrf: {'found' if xsrf_val else 'not found'}")
    print(f"  oapvfc: {'found' if oapvfc_val else 'not found'}")

    offers = []

    # Extract offers from initial HTML
    # Google embeds offer data in JSON-like structures in the page
    # Look for price + merchant patterns
    shop_price_pattern = re.compile(
        r'"(?:merchant|seller)(?:Name)?"\s*:\s*"([^"]+)"[^}]*?"price"\s*:\s*"?([0-9,\.]+)"?',
        re.DOTALL
    )
    for m in shop_price_pattern.finditer(html):
        offers.append({"shop": m.group(1), "price": m.group(2) + " €", "url": ""})

    # Also try alternate patterns
    alt_pattern = re.compile(r'\["([^"]+\.de)",[^]]*?"([0-9]+,[0-9]{2})"')
    for m in alt_pattern.finditer(html):
        offers.append({"shop": m.group(1), "price": m.group(2) + " €", "url": ""})

    print(f"  Offers from initial page: {len(offers)}")

    # Step 2: Load more offers via async endpoint (if we have session tokens)
    if ei_val or oapvfc_val:
        print("\nStep 2: Loading additional offers via async endpoint...")
        import urllib.parse

        async_params = ",".join([
            "pvt:",
            "query:*",
            f"catalogid:{CATALOG_ID}",
            f"oapvfc:{oapvfc_val}" if oapvfc_val else "",
            f"xsrf:{urllib.parse.quote(xsrf_val)}" if xsrf_val else "",
            "sori:5",
            "mno:50",
            "pvf:",
            "isVariantOrFilterChange:true",
            "_fmt:jspb",
        ])
        async_params = ",".join(p for p in async_params.split(",") if p)

        async_url = (
            f"https://www.google.de/async/oapv"
            f"?ei={ei_val}&gl=de&hl=de&yv=3&pvorigin=0&q=*"
            f"&async_context=MORE_STORES&ibp=oshop&cs=0"
            f"&async={async_params}"
        )

        async_headers = {
            **HEADERS,
            "Accept": "*/*",
            "Referer": initial_url,
            "X-Same-Domain": "1",
        }
        async_resp = session.get(async_url, headers=async_headers, timeout=20)
        print(f"  Async status: {async_resp.status_code}, Size: {len(async_resp.content):,} bytes")

        # Extract strings from binary jspb response
        raw = async_resp.content.decode("latin-1", errors="replace")
        # Look for German shop domains
        domains = set(re.findall(r'[\w\-]+\.(?:de|com|eu|at|ch)', raw))
        # Look for price strings
        prices = re.findall(r'\d{3,4}[.,]\d{2}', raw)

        for price in prices:
            try:
                val = float(price.replace(",", "."))
                if 300 <= val <= 1500:
                    offers.append({"shop": "–", "price": f"{price} €", "url": ""})
            except ValueError:
                pass

    # Deduplicate
    seen = set()
    unique_offers = []
    for o in offers:
        key = (o["shop"], o["price"])
        if key not in seen:
            seen.add(key)
            unique_offers.append(o)

    return unique_offers


def render_html(offers):
    rows = ""
    for i, o in enumerate(offers, 1):
        rows += f"""
        <tr>
          <td>{i}</td>
          <td><strong>{o['shop']}</strong></td>
          <td>{o['price']}</td>
        </tr>"""

    count = len(offers)
    status_color = "#2d7d46" if count >= 10 else "#b05a00"
    status = f"✅ {count} offers found" if count >= 10 else f"⚠️ {count} offers found"

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>{PRODUCT_NAME} – Alle Angebote</title>
  <style>
    body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }}
    h1 {{ color: #1a73e8; }}
    .status {{ color: {status_color}; font-size: 1.1em; margin: 10px 0 20px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ text-align: left; padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }}
    th {{ background: #f1f3f4; font-weight: 600; }}
    tr:hover {{ background: #f8f9fa; }}
    .refresh {{ margin-top: 20px; color: #666; font-size: 0.9em; }}
    a.btn {{ display: inline-block; margin-top: 15px; padding: 8px 16px;
             background: #1a73e8; color: white; text-decoration: none;
             border-radius: 4px; font-size: 0.9em; }}
  </style>
</head>
<body>
  <h1>{PRODUCT_NAME}</h1>
  <div class="status">{status}</div>
  <table>
    <thead><tr><th>#</th><th>Shop</th><th>Preis</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <p class="refresh">
    <a href="/" class="btn">↻ Neu laden</a>
    &nbsp; Data from Google Shopping
  </p>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        print(f"\nRequest: {self.path}")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        try:
            offers = fetch_all_offers()
            html = render_html(offers)
        except Exception as e:
            html = f"<h2>Error: {e}</h2>"
        self.wfile.write(html.encode("utf-8"))

    def log_message(self, format, *args):
        pass  # suppress default access log


if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), Handler)
    print(f"Server running at http://localhost:{PORT}")
    print(f"Open that URL in your browser to see all offers for '{PRODUCT_NAME}'")
    print("Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
