#!/usr/bin/env python3
"""
Refresh data + regenerate pages for the 7 non-Korean games in one shot.

Unlike update_kr645.py, these games' fetch_<key>.py scripts don't do their
own "is there anything new" check - they just re-fetch and rebuild the full
dataset each time (cheap enough given the source sizes). This script simply
runs all 7, then regenerates every draws/numbers page. The GitHub Actions
workflow decides whether anything actually changed via `git status`, not
via this script's output.
"""
import subprocess
import sys
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GAMES = ["powerball", "megamillions", "euromillions", "uklotto", "loto6", "auspowerball", "superenalotto"]


def main():
    for key in GAMES:
        print(f"--- fetching {key} ---")
        subprocess.run([sys.executable, f"{ROOT}/data/scripts/fetch_{key}.py"], check=True)

    print("--- regenerating world pages ---")
    subprocess.run([sys.executable, f"{ROOT}/data/scripts/generate_world_pages.py"], check=True)


if __name__ == "__main__":
    main()
