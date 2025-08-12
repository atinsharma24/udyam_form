"""
Tests for the Udyam form scraper
"""

import os
import json
import pytest
from udyam_scraper import UdyamScraper

@pytest.fixture
def scraper():
    return UdyamScraper()

@pytest.fixture
def schema_file():
    current_dir = os.path.dirname(__file__)
    return os.path.join(current_dir, "..", "output", "form_schema.json")

def test_scraper_initialization(scraper):
    """Test that the scraper initializes correctly."""
    assert scraper is not None
    assert scraper.driver is not None

def test_schema_structure(scraper):
    """Test that the scraped schema has the expected structure."""
    schema = scraper.scrape_form_fields()
    
    assert "step1" in schema
    assert "step2" in schema
    assert "validation" in schema
    
    # Test step 1 fields
    assert len(schema["step1"]) >= 2  # Aadhaar and OTP fields
    assert any(field["id"] == "aadhaar" for field in schema["step1"])
    assert any(field["id"] == "otp" for field in schema["step1"])
    
    # Test step 2 fields
    assert len(schema["step2"]) >= 1  # PAN field
    assert any(field["id"] == "pan" for field in schema["step2"])
    
    # Test validation rules
    validation = schema["validation"]
    assert "aadhaar" in validation
    assert "otp" in validation
    assert "pan" in validation

def test_field_validation_patterns(scraper):
    """Test that validation patterns are correct."""
    schema = scraper.scrape_form_fields()
    validation = schema["validation"]
    
    # Test Aadhaar validation
    assert validation["aadhaar"]["format"] == r'^\d{12}$'
    
    # Test OTP validation
    assert validation["otp"]["format"] == r'^\d{6}$'
    
    # Test PAN validation
    assert validation["pan"]["format"] == r'[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}'

def test_schema_file_creation(schema_file):
    """Test that the schema file is created and valid JSON."""
    scraper = UdyamScraper()
    schema = scraper.scrape_form_fields()
    
    with open(schema_file, 'w') as f:
        json.dump(schema, f, indent=2)
    
    assert os.path.exists(schema_file)
    
    with open(schema_file, 'r') as f:
        loaded_schema = json.load(f)
    
    assert loaded_schema == schema
