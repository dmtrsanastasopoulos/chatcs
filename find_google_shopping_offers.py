#!/usr/bin/env python3
"""
Run this script locally (on your own machine) to find the Google Shopping URL
that returns 10+ offers without needing the "load more" button.

Usage:
    python3 find_google_shopping_offers.py

Requirements:
    pip install requests beautifulsoup4
"""

import time
import re
import sys

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup

BASE_CATALOG_ID = "1299683159093447658"
MNO_VALUES = [15, 25, 50, 100]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}


def build_url(mno: int) -> str:
    return (
        f"https://www.google.de/search"
        f"?ibp=oshop&q=*"
        f"&prds=catalogid:{BASE_CATALOG_ID},sori:10,mno:{mno}"
        f"&hl=de&gl=de"
    )


def count_offers(html: str) -> dict:
    """Count offers using multiple detection methods."""
    results = {}

    # Method 1: price patterns (€ prices)
    prices = re.findall(r"\d+[.,]\d+\s*€|€\s*\d+[.,]\d+", html)
    results["prices"] = len(set(prices))  # deduplicate

    # Method 2: look for "load more" / "Weitere Angebote" button
    results["has_load_more"] = (
        "Weitere Angebote" in html
        or "weitere Angebote" in html
        or "Load more" in html.lower()
        or "oshopmore" in html.lower()
    )

    # Method 3: BeautifulSoup offer containers
    soup = BeautifulSoup(html, "html.parser")
    # Google Shopping offer rows often have class sh-osd__offer-row or similar
    offer_rows = soup.find_all(attrs={"class": re.compile(r"offer|sh-osd|merchant", re.I)})
    results["offer_elements"] = len(offer_rows)

    # Method 4: count merchant/seller name patterns
    merchants = re.findall(r'"merchant"[^}]{0,200}?"name"\s*:\s*"([^"]+)"', html)
    results["merchants"] = len(set(merchants))

    return results


def test_url(mno: int, session: requests.Session) -> None:
    url = build_url(mno)
    print(f"\n{'='*60}")
    print(f"Testing mno:{mno}")
    print(f"URL: {url}")

    try:
        resp = session.get(url, headers=HEADERS, timeout=20)
        print(f"HTTP Status: {resp.status_code}")

        if resp.status_code != 200:
            print(f"  ❌ Failed with status {resp.status_code}")
            return

        html = resp.text
        print(f"  HTML size: {len(html):,} bytes")

        counts = count_offers(html)
        print(f"  Prices found: {counts['prices']}")
        print(f"  Offer elements: {counts['offer_elements']}")
        print(f"  Merchants found: {counts['merchants']}")
        print(f"  Has 'load more' button: {counts['has_load_more']}")

        offer_count = max(counts["prices"], counts["merchants"], counts["offer_elements"])
        if offer_count >= 10 and not counts["has_load_more"]:
            print(f"\n  ✅ SUCCESS! Found {offer_count}+ offers with NO load-more button.")
            print(f"  ✅ Working URL: {url}")
        elif offer_count >= 10:
            print(f"\n  ⚠️  Found {offer_count}+ offers BUT load-more button is still present.")
            print(f"     Try a higher mno value.")
        else:
            print(f"\n  ❌ Only {offer_count} offers found. Try higher mno.")

    except requests.RequestException as e:
        print(f"  ❌ Request error: {e}")

    time.sleep(2)  # be polite, avoid rate limiting


def main():
    print("Google Shopping Offer URL Finder")
    print("=" * 60)
    print(f"Catalog ID: {BASE_CATALOG_ID}")
    print(f"Testing mno values: {MNO_VALUES}")

    session = requests.Session()

    for mno in MNO_VALUES:
        test_url(mno, session)

    print("\n" + "=" * 60)
    print("Done. Copy the ✅ URL above into your browser to verify.")


if __name__ == "__main__":
    main()
