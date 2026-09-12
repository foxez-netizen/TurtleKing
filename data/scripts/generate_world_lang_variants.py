#!/usr/bin/env python3
"""
Generate language-specific static entry points for world.html:
  /ko/world.html, /en/world.html, /ja/world.html, /it/world.html

world.html itself stays as the "auto-detect" (x-default) version that
picks a language from the visitor's browser locale. These variants force
a fixed language via `window.FORCE_LANG` (read by i18n.js's
detectAppI18n()) so each is a distinct, independently crawlable URL with
its own <title>/<meta description> and hreflang links back to every
sibling variant plus x-default - the fix for "JS toggle means Google only
indexes one language" per the SEO checklist this was built from.

Re-run any time root world.html's structure changes (new sections, new
script tags, etc.) to keep the variants in sync - this script derives
each variant from the current world.html rather than hand-maintaining
4 near-duplicate files.
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE_URL = "https://lottopick.org"

LANGS = {
    "ko": {
        "title": "세계 로또 번호 생성기 | 파워볼·유로밀리언스·로또6 당첨확률 – LottoPick",
        "description": "한국, 미국, 유럽, 영국, 일본, 호주, 이탈리아 등 세계 각국 로또 규칙에 맞춰 번호를 무작위로 뽑아주는 생성기. 국가별 당첨 확률과 번호별 과거 당첨 통계를 함께 확인하세요.",
    },
    "en": {
        "title": "World Lottery Number Generator | Powerball, EuroMillions, Loto 6 Odds – LottoPick",
        "description": "Generate random numbers for Powerball, Mega Millions, EuroMillions, UK Lotto, Loto 6, Australia Powerball, SuperEnalotto and Korea Lotto 6/45. Check jackpot odds and historical number frequency stats.",
    },
    "ja": {
        "title": "世界の宝くじ番号ジェネレーター | パワーボール・ユーロミリオンズ・ロト6の当選確率 – LottoPick",
        "description": "パワーボール、メガミリオンズ、ユーロミリオンズ、UKロト、ロト6、オーストラリアパワーボール、スーパーエナロット、韓国ロト6/45の番号をランダムに生成。当選確率と過去の番号別出現頻度も確認できます。",
    },
    "it": {
        "title": "Generatore di Numeri della Lotteria Mondiale | Probabilità Powerball, EuroMillions, Loto 6 – LottoPick",
        "description": "Genera numeri casuali per Powerball, Mega Millions, EuroMillions, UK Lotto, Loto 6, Powerball Australia, SuperEnalotto e Lotto coreano 6/45. Consulta le probabilità di vincita e le statistiche di frequenza dei numeri.",
    },
}


def main():
    src = open(f"{ROOT}/world.html", encoding="utf-8").read()

    for lang, meta in LANGS.items():
        out = src

        out = out.replace('<html lang="ko">', f'<html lang="{lang}">', 1)

        out = re.sub(r"<title>.*?</title>", f"<title>{meta['title']}</title>", out, count=1, flags=re.S)
        out = re.sub(
            r'<meta name="description" content=".*?">',
            f'<meta name="description" content="{meta["description"]}">',
            out,
            count=1,
            flags=re.S,
        )
        out = re.sub(
            r'<link rel="canonical" href="[^"]*">',
            f'<link rel="canonical" href="{SITE_URL}/{lang}/world.html">',
            out,
            count=1,
        )
        out = out.replace(
            '"url": "https://lottopick.org/world.html",',
            f'"url": "{SITE_URL}/{lang}/world.html",\n  "inLanguage": "{lang}",',
        )

        out = out.replace(
            '<script src="/i18n.js"></script>',
            f'<script>window.FORCE_LANG = "{lang}";</script>\n<script src="/i18n.js"></script>',
        )

        os.makedirs(f"{ROOT}/{lang}", exist_ok=True)
        with open(f"{ROOT}/{lang}/world.html", "w", encoding="utf-8") as f:
            f.write(out)
        print(f"wrote /{lang}/world.html")


if __name__ == "__main__":
    main()
