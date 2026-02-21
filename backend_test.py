#!/usr/bin/env python3
"""
Backend Testing Script for Baby Vaccination Tracker
Tests all API endpoints with comprehensive scenarios including edge cases.
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sys

# Configuration
BACKEND_URL = "https://baby-care-compass.preview.emergentagent.com/api"  # Using the production URL from frontend/.env

class BabyVaccinationTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.baby_id = None
        self.vaccination_id = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }

    def log(self, message: str, level: str = "INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def assert_response(self, response: requests.Response, expected_status: int = 200, test_name: str = ""):
        """Assert response status and handle errors"""
        try:
            if response.status_code == expected_status:
                self.test_results['passed'] += 1
                self.log(f"✅ {test_name} - Status {response.status_code} (Expected {expected_status})")
                return True
            else:
                self.test_results['failed'] += 1
                error_msg = f"❌ {test_name} - Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" | Response: {error_detail}"
                except:
                    error_msg += f" | Response: {response.text}"
                
                self.log(error_msg, "ERROR")
                self.test_results['errors'].append(error_msg)
                return False
        except Exception as e:
            self.test_results['failed'] += 1
            error_msg = f"❌ {test_name} - Exception: {str(e)}"
            self.log(error_msg, "ERROR")
            self.test_results['errors'].append(error_msg)
            return False

    def test_api_health(self):
        """Test API health check"""
        self.log("Testing API Health Check...")
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            if self.assert_response(response, 200, "API Health Check"):
                data = response.json()
                self.log(f"API Response: {data}")
                return True
        except Exception as e:
            self.log(f"❌ API Health Check failed: {str(e)}", "ERROR")
            return False

    def test_create_baby_profile(self):
        """Test POST /api/baby - Create baby profile"""
        self.log("Testing Create Baby Profile...")
        
        baby_data = {
            "name": "Test Baby",
            "dob": "2024-01-15T00:00:00Z",
            "gender": "Male",
            "blood_group": "O+",
            "photo": None
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/baby", json=baby_data)
            if self.assert_response(response, 200, "Create Baby Profile"):
                data = response.json()
                self.log(f"Created baby profile: {data}")
                
                # Validate response structure
                required_fields = ['id', 'name', 'dob', 'gender', 'blood_group', 'created_at']
                for field in required_fields:
                    if field not in data:
                        self.log(f"❌ Missing field '{field}' in baby profile response", "ERROR")
                        self.test_results['failed'] += 1
                        return False
                
                self.baby_id = data['id']
                self.log(f"Baby ID stored: {self.baby_id}")
                
                # Verify data matches input
                assert data['name'] == baby_data['name'], "Name mismatch"
                assert data['gender'] == baby_data['gender'], "Gender mismatch"
                assert data['blood_group'] == baby_data['blood_group'], "Blood group mismatch"
                
                return True
        except Exception as e:
            self.log(f"❌ Create Baby Profile failed: {str(e)}", "ERROR")
            return False

    def test_get_baby_profile(self):
        """Test GET /api/baby - Get baby profile"""
        self.log("Testing Get Baby Profile...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/baby")
            if self.assert_response(response, 200, "Get Baby Profile"):
                data = response.json()
                self.log(f"Retrieved baby profile: {data}")
                
                if data is None:
                    self.log("❌ Baby profile not found", "ERROR")
                    return False
                    
                # Validate the baby data
                if 'id' in data and data['id'] == self.baby_id:
                    self.log("✅ Baby profile matches created profile")
                    return True
                else:
                    self.log("❌ Baby profile ID mismatch", "ERROR")
                    return False
        except Exception as e:
            self.log(f"❌ Get Baby Profile failed: {str(e)}", "ERROR")
            return False

    def test_get_all_vaccinations(self):
        """Test GET /api/vaccinations/{baby_id} - Get all vaccinations"""
        self.log("Testing Get All Vaccinations...")
        
        if not self.baby_id:
            self.log("❌ No baby_id available for vaccination test", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/vaccinations/{self.baby_id}")
            if self.assert_response(response, 200, "Get All Vaccinations"):
                data = response.json()
                self.log(f"Retrieved {len(data)} vaccinations")
                
                # Verify India vaccination schedule - should have around 31 vaccinations
                if len(data) < 30:
                    self.log(f"❌ Expected ~31 vaccinations, got {len(data)}", "ERROR")
                    return False
                
                # Check structure of first vaccination
                if data:
                    first_vac = data[0]
                    required_fields = ['id', 'baby_id', 'name', 'description', 'due_date', 'age_weeks', 'completed']
                    for field in required_fields:
                        if field not in first_vac:
                            self.log(f"❌ Missing field '{field}' in vaccination response", "ERROR")
                            return False
                    
                    # Store first vaccination ID for later tests
                    self.vaccination_id = first_vac['id']
                    self.log(f"Stored vaccination ID: {self.vaccination_id}")
                    
                    # Verify baby_id matches
                    if first_vac['baby_id'] != self.baby_id:
                        self.log(f"❌ Vaccination baby_id mismatch", "ERROR")
                        return False
                
                # Check that vaccinations are sorted by due_date
                dates = [vac['due_date'] for vac in data]
                sorted_dates = sorted(dates)
                if dates != sorted_dates:
                    self.log("❌ Vaccinations not sorted by due_date", "ERROR")
                    return False
                    
                self.log(f"✅ All vaccinations validated. Sample: {data[0]['name']} - {data[0]['description']}")
                return True
        except Exception as e:
            self.log(f"❌ Get All Vaccinations failed: {str(e)}", "ERROR")
            return False

    def test_get_upcoming_vaccinations(self):
        """Test GET /api/vaccinations/{baby_id}/upcoming - Get upcoming vaccinations"""
        self.log("Testing Get Upcoming Vaccinations...")
        
        if not self.baby_id:
            self.log("❌ No baby_id available for upcoming vaccination test", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/vaccinations/{self.baby_id}/upcoming")
            if self.assert_response(response, 200, "Get Upcoming Vaccinations"):
                data = response.json()
                self.log(f"Retrieved {len(data)} upcoming vaccinations")
                
                # All vaccinations should be non-completed initially
                for vac in data:
                    if vac['completed']:
                        self.log(f"❌ Found completed vaccination in upcoming list: {vac['name']}", "ERROR")
                        return False
                
                self.log("✅ All upcoming vaccinations are non-completed")
                return True
        except Exception as e:
            self.log(f"❌ Get Upcoming Vaccinations failed: {str(e)}", "ERROR")
            return False

    def test_mark_vaccination_complete(self):
        """Test PATCH /api/vaccinations/{vaccination_id} - Mark vaccination as complete"""
        self.log("Testing Mark Vaccination Complete...")
        
        if not self.vaccination_id:
            self.log("❌ No vaccination_id available for completion test", "ERROR")
            return False
            
        update_data = {
            "completed": True,
            "completed_date": datetime.now().isoformat(),
            "notes": "Test completion note"
        }
        
        try:
            response = self.session.patch(f"{BACKEND_URL}/vaccinations/{self.vaccination_id}", json=update_data)
            if self.assert_response(response, 200, "Mark Vaccination Complete"):
                data = response.json()
                self.log(f"Updated vaccination: {data}")
                
                # Verify the vaccination is marked as completed
                if not data['completed']:
                    self.log("❌ Vaccination not marked as completed", "ERROR")
                    return False
                
                if data['notes'] != update_data['notes']:
                    self.log("❌ Notes not updated properly", "ERROR")
                    return False
                
                self.log("✅ Vaccination marked as completed successfully")
                return True
        except Exception as e:
            self.log(f"❌ Mark Vaccination Complete failed: {str(e)}", "ERROR")
            return False

    def test_get_completed_vaccinations(self):
        """Test GET /api/vaccinations/{baby_id}/completed - Get completed vaccinations"""
        self.log("Testing Get Completed Vaccinations...")
        
        if not self.baby_id:
            self.log("❌ No baby_id available for completed vaccination test", "ERROR")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/vaccinations/{self.baby_id}/completed")
            if self.assert_response(response, 200, "Get Completed Vaccinations"):
                data = response.json()
                self.log(f"Retrieved {len(data)} completed vaccinations")
                
                # Should have at least 1 completed vaccination from previous test
                if len(data) == 0:
                    self.log("❌ No completed vaccinations found", "ERROR")
                    return False
                
                # All vaccinations should be completed
                for vac in data:
                    if not vac['completed']:
                        self.log(f"❌ Found non-completed vaccination in completed list: {vac['name']}", "ERROR")
                        return False
                
                # Check if our test vaccination is in the list
                test_vac_found = any(vac['id'] == self.vaccination_id for vac in data)
                if not test_vac_found:
                    self.log("❌ Previously completed vaccination not found in completed list", "ERROR")
                    return False
                
                self.log("✅ All completed vaccinations validated")
                return True
        except Exception as e:
            self.log(f"❌ Get Completed Vaccinations failed: {str(e)}", "ERROR")
            return False

    def test_update_baby_profile(self):
        """Test PUT /api/baby/{baby_id} - Update baby profile"""
        self.log("Testing Update Baby Profile...")
        
        if not self.baby_id:
            self.log("❌ No baby_id available for update test", "ERROR")
            return False
            
        update_data = {
            "name": "Updated Baby Name",
            "dob": "2024-01-15T00:00:00Z",
            "gender": "Male",
            "blood_group": "O+",
            "photo": None
        }
        
        try:
            response = self.session.put(f"{BACKEND_URL}/baby/{self.baby_id}", json=update_data)
            if self.assert_response(response, 200, "Update Baby Profile"):
                data = response.json()
                self.log(f"Updated baby profile: {data}")
                
                # Verify the update
                if data['name'] != update_data['name']:
                    self.log("❌ Baby name not updated properly", "ERROR")
                    return False
                
                self.log("✅ Baby profile updated successfully")
                return True
        except Exception as e:
            self.log(f"❌ Update Baby Profile failed: {str(e)}", "ERROR")
            return False

    def test_edge_cases(self):
        """Test edge cases and error handling"""
        self.log("Testing Edge Cases...")
        
        # Test creating a second baby (should fail)
        self.log("Testing duplicate baby creation...")
        baby_data = {
            "name": "Second Baby",
            "dob": "2024-02-01T00:00:00Z",
            "gender": "Female",
            "blood_group": "A+"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/baby", json=baby_data)
            if self.assert_response(response, 400, "Duplicate Baby Creation (Should Fail)"):
                self.log("✅ Correctly rejected duplicate baby creation")
            else:
                self.log("❌ Should have rejected duplicate baby creation", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Duplicate baby test failed: {str(e)}", "ERROR")
            return False
        
        # Test updating non-existent vaccination
        self.log("Testing non-existent vaccination update...")
        fake_vaccination_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
        update_data = {"completed": True}
        
        try:
            response = self.session.patch(f"{BACKEND_URL}/vaccinations/{fake_vaccination_id}", json=update_data)
            if self.assert_response(response, 404, "Non-existent Vaccination Update (Should Fail)"):
                self.log("✅ Correctly rejected non-existent vaccination update")
            else:
                self.log("❌ Should have rejected non-existent vaccination update", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Non-existent vaccination test failed: {str(e)}", "ERROR")
            return False
        
        # Test getting vaccinations for non-existent baby
        self.log("Testing vaccinations for non-existent baby...")
        fake_baby_id = "507f1f77bcf86cd799439012"  # Valid ObjectId format
        
        try:
            response = self.session.get(f"{BACKEND_URL}/vaccinations/{fake_baby_id}")
            if self.assert_response(response, 200, "Vaccinations for Non-existent Baby"):
                data = response.json()
                if len(data) == 0:
                    self.log("✅ Correctly returned empty list for non-existent baby")
                else:
                    self.log("❌ Should have returned empty list for non-existent baby", "ERROR")
                    return False
        except Exception as e:
            self.log(f"❌ Non-existent baby vaccination test failed: {str(e)}", "ERROR")
            return False
        
        return True

    def run_all_tests(self):
        """Run all tests in the specified order"""
        self.log("=" * 60)
        self.log("BABY VACCINATION TRACKER - BACKEND API TESTING")
        self.log("=" * 60)
        
        tests = [
            ("API Health Check", self.test_api_health),
            ("Create Baby Profile", self.test_create_baby_profile),
            ("Get Baby Profile", self.test_get_baby_profile),
            ("Get All Vaccinations", self.test_get_all_vaccinations),
            ("Get Upcoming Vaccinations", self.test_get_upcoming_vaccinations),
            ("Mark Vaccination Complete", self.test_mark_vaccination_complete),
            ("Get Completed Vaccinations", self.test_get_completed_vaccinations),
            ("Update Baby Profile", self.test_update_baby_profile),
            ("Edge Cases", self.test_edge_cases),
        ]
        
        for test_name, test_func in tests:
            self.log("-" * 40)
            try:
                success = test_func()
                if not success:
                    self.log(f"❌ {test_name} FAILED", "ERROR")
                else:
                    self.log(f"✅ {test_name} PASSED")
            except Exception as e:
                self.log(f"❌ {test_name} CRASHED: {str(e)}", "ERROR")
                self.test_results['failed'] += 1
                self.test_results['errors'].append(f"{test_name} crashed: {str(e)}")
            
            time.sleep(0.5)  # Brief pause between tests
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        self.log("=" * 60)
        self.log("TEST SUMMARY")
        self.log("=" * 60)
        self.log(f"✅ PASSED: {self.test_results['passed']}")
        self.log(f"❌ FAILED: {self.test_results['failed']}")
        self.log(f"📊 TOTAL:  {self.test_results['passed'] + self.test_results['failed']}")
        
        if self.test_results['errors']:
            self.log("\n❌ ERRORS ENCOUNTERED:")
            for error in self.test_results['errors']:
                self.log(f"  - {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100 if (self.test_results['passed'] + self.test_results['failed']) > 0 else 0
        self.log(f"\n📈 SUCCESS RATE: {success_rate:.1f}%")
        
        if self.test_results['failed'] == 0:
            self.log("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            self.log("⚠️  Some tests failed. Check errors above for details.")

if __name__ == "__main__":
    tester = BabyVaccinationTester()
    tester.run_all_tests()