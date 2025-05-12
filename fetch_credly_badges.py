from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.wait import WebDriverWait
from bs4 import BeautifulSoup
import json
import time
import os
import re
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

USERNAME = os.getenv("CREDLY_USERNAME", "sunil-sarolkar")
URL = f"https://www.credly.com/users/{USERNAME}"
OUTPUT_FILE = "_data/credly_badges.json"

# Setup headless Chrome
options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=options)

print(f"Loading {URL} ...")
driver.get(URL)

# Wait for badges to load (adjust if needed)
time.sleep(10)

# print(driver.page_source)
# Attempt to click "See all badges" button if it exists
try:
    see_all_button = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'See all')]"))
    )

    print("Clicking 'See all badges' button...")
    driver.execute_script("arguments[0].scrollIntoView(true);", see_all_button)
    driver.execute_script("arguments[0].click();", see_all_button)
    print("Clicked 'See all' successfully!")
    time.sleep(3)  # Give time for badges to load
except Exception as e:
    print(e)
    print("No 'See all badges' button found. Continuing...")
# Parse the rendered page source
soup = BeautifulSoup(driver.page_source, "html.parser")

badges = []

for card in soup.select("div.settings__skills-profile__edit-skills-profile__badge-card__main-card"):
    # Extract image + badge name
    img_tag = card.select_one("img.settings__skills-profile__edit-skills-profile__badge-card__badge-image")
    name_tag = card.select_one("div.settings__skills-profile__edit-skills-profile__badge-card__organization-name-two-lines")
    issuer_tag = card.select_one("div.settings__skills-profile__edit-skills-profile__badge-card__issuer-name-two-lines")
    issued_tag = card.select_one("div.settings__skills-profile__edit-skills-profile__badge-card__issued")

    if img_tag and name_tag and issuer_tag:
        badge_url = img_tag["src"]
        badge_name = name_tag.text.strip()
        badge_issuer = issuer_tag.text.strip()
        issued_text = issued_tag.text.strip() if issued_tag else ""
        
        # Extract just the date (after 'Issued ')
        issued_date = issued_text.replace("Issued ", "").strip() if issued_text.startswith("Issued") else ""

        # Extract UUID from image URL
        badge_uuid_match = re.search(r"/images/([0-9a-fA-F-]+)/", badge_url)
        badge_uuid = badge_uuid_match.group(1) if badge_uuid_match else None

        badges.append({
            "name": badge_name,
            "issuer": badge_issuer,
            "image": badge_url,
            "uuid": badge_uuid,
            "issued": issued_date,
            "image340":'https://images.credly.com/size/340x340/images/'+badge_uuid+'/image.png'
        })

print(f"✅ Extracted {len(badges)} badges with issue dates.")

driver.quit()

# Ensure _data folder exists
os.makedirs("_data", exist_ok=True)

# Save to JSON
with open(OUTPUT_FILE, "w") as f:
    json.dump(badges, f, indent=2)

print(f"✅ Extracted {len(badges)} badges to {OUTPUT_FILE}")
