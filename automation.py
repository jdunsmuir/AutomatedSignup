from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time

# Specify the path to chromedriver
chrome_driver_path = '/path/to/chromedriver'

# Configure Chrome options to start with DevTools open
chrome_options = Options()
chrome_options.add_argument("--auto-open-devtools-for-tabs")

# Create a WebDriver instance
service = Service(chrome_driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open a web page (e.g., Google)
driver.get('https://www.google.com')

# Allow some time for the page to load and DevTools to open
time.sleep(3)

# Define the JavaScript code you want to run
js_code = """
console.log('Hello from Selenium!');
"""

# Execute JavaScript code in the browser's context
driver.execute_script(js_code)

# Allow some time to observe the results in DevTools
time.sleep(10)

# Close the browser
driver.quit()
