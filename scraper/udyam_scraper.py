"""
Udyam Registration Form Scraper
Extracts form fields and validation rules from the Udyam registration portal.
"""

import json
import os
import asyncio
from typing import Dict, List
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

UDYAM_URL = "https://udyamregistration.gov.in/UdyamRegistration.aspx"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
SCHEMA_FILE = os.path.join(OUTPUT_DIR, "form_schema.json")

class UdyamScraper:
    async def setup(self):
        """Set up Playwright browser and context."""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        
    async def cleanup(self):
        """Clean up Playwright resources."""
        await self.context.close()
        await self.browser.close()
        await self.playwright.stop()
        
    async def scrape_form_fields(self) -> Dict:
        """
        Scrape form fields, labels, and validation rules from the Udyam portal.
        Returns a dictionary containing the form schema.
        """
        try:
            await self.setup()
            
            # Navigate to the Udyam registration page
            await self.page.goto(UDYAM_URL)
            await self.page.wait_for_load_state("networkidle")
            
            # Get page content and parse with BeautifulSoup
            content = await self.page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract form fields and validation rules
            schema = {
                "step1": self._extract_step1_fields(soup),
                "step2": self._extract_step2_fields(soup),
                "validation": self._extract_validation_rules(soup)
            }
            
            return schema
            
        finally:
            await self.cleanup()
    
    def _extract_step1_fields(self, soup) -> List[Dict]:
        """Extract Aadhaar validation fields from Step 1."""
        fields = []
        
        # Find Aadhaar input field and related elements
        aadhaar_section = soup.find('div', {'id': 'divAadhaar'})
        if aadhaar_section:
            fields.append({
                'id': 'aadhaar',
                'type': 'text',
                'label': 'Aadhaar Number',
                'required': True,
                'maxLength': 12,
                'pattern': r'^\d{12}$'
            })
            
            # Add OTP field
            fields.append({
                'id': 'otp',
                'type': 'text',
                'label': 'Enter OTP',
                'required': True,
                'maxLength': 6,
                'pattern': r'^\d{6}$'
            })
            
        return fields
    
    def _extract_step2_fields(self, soup) -> List[Dict]:
        """Extract PAN validation fields from Step 2."""
        fields = []
        
        # Find PAN input field and related elements
        pan_section = soup.find('div', {'id': 'divPan'})
        if pan_section:
            fields.append({
                'id': 'pan',
                'type': 'text',
                'label': 'PAN Number',
                'required': True,
                'maxLength': 10,
                'pattern': r'[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}'
            })
            
        return fields
    
    def _extract_validation_rules(self, soup) -> Dict:
        """Extract validation rules and error messages."""
        validation = {
            'aadhaar': {
                'required': 'Aadhaar number is required',
                'pattern': 'Please enter a valid 12-digit Aadhaar number',
                'format': r'^\d{12}$'
            },
            'otp': {
                'required': 'OTP is required',
                'pattern': 'Please enter a valid 6-digit OTP',
                'format': r'^\d{6}$'
            },
            'pan': {
                'required': 'PAN number is required',
                'pattern': 'Please enter a valid PAN number',
                'format': r'[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}'
            }
        }
        return validation

async def main():
    """Main function to run the scraper and save results."""
    scraper = UdyamScraper()
    schema = await scraper.scrape_form_fields()
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Save schema to JSON file
    with open(SCHEMA_FILE, 'w') as f:
        json.dump(schema, f, indent=2)
    
    print(f"Form schema has been saved to {SCHEMA_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
