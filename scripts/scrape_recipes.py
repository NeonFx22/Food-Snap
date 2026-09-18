"""
Data scraping utilities for building the FoodSnap dataset.

Given a list of recipe page URLs, this script extracts the recipe name,
calories, cooking time, ingredients and directions from each page using
BeautifulSoup, and writes the results to static/main/recipes.json so
that dish photos can be matched back to structured recipe data.

NOTE: the exact HTML selectors below (`h1.recipe-title`, `.recipe-ingredients li`,
etc.) are placeholders — every recipe site markets up its pages differently, so
before scraping a real site, inspect its HTML and adjust the CSS selectors in
each `extract_*` function to match.
"""

import json
import os
import time

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "FoodSnap-FYP-Scraper/1.0 (educational project)"}


def fetch_soup(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def extract_name(soup: BeautifulSoup) -> str:
    tag = soup.select_one("h1.recipe-title") or soup.find("h1")
    return tag.get_text(strip=True).lower() if tag else ""


def extract_calories(soup: BeautifulSoup) -> str:
    tag = soup.select_one(".recipe-calories") or soup.find(string=lambda t: t and "kcal" in t.lower())
    return tag.get_text(strip=True) if hasattr(tag, "get_text") else (tag or "unknown")


def extract_cooking_time(soup: BeautifulSoup) -> str:
    tag = soup.select_one(".recipe-time, .cook-time")
    return tag.get_text(strip=True) if tag else "unknown"


def extract_ingredients(soup: BeautifulSoup) -> str:
    items = soup.select(".recipe-ingredients li, ul.ingredients li")
    return ", ".join(item.get_text(strip=True) for item in items) if items else ""


def extract_directions(soup: BeautifulSoup) -> str:
    items = soup.select(".recipe-directions li, ol.directions li, .recipe-instructions p")
    return " ".join(item.get_text(strip=True) for item in items) if items else ""


def scrape_recipe(url: str) -> dict:
    soup = fetch_soup(url)
    return {
        "name": extract_name(soup),
        "calories": extract_calories(soup),
        "cooking_time": extract_cooking_time(soup),
        "ingredients": extract_ingredients(soup),
        "directions": extract_directions(soup),
        "source_url": url,
    }


def scrape_all(urls: list[str], delay_seconds: float = 1.0) -> list[dict]:
    """Scrape each URL in turn, being polite with a delay between requests."""
    recipes = []
    for url in urls:
        try:
            recipes.append(scrape_recipe(url))
        except requests.RequestException as exc:
            print(f"Skipping {url}: {exc}")
        time.sleep(delay_seconds)
    return recipes


if __name__ == "__main__":
    # Replace with the real list of recipe page URLs for your dataset.
    recipe_urls = [
        # "https://example-recipe-site.com/jollof-rice",
        # "https://example-recipe-site.com/egusi-soup",
    ]

    scraped = scrape_all(recipe_urls)

    with open("static/main/recipes.json", "w") as f:
        json.dump(scraped, f, indent=2)

    print(f"Scraped {len(scraped)} recipes -> static/main/recipes.json")
