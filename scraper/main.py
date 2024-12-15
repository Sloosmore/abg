import requests
import base64
import pandas as pd
import re
from supabase import create_client
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_github_readme():
    url = "https://api.github.com/repos/SimplifyJobs/Summer2025-Internships/contents/README.md"
    response = requests.get(url)
    
    if response.status_code == 200:
        content = response.json()['content']
        decoded_content = base64.b64decode(content).decode('utf-8')
        return decoded_content
    else:
        return f"Error: {response.status_code}"

def extract_url_from_html(html_string):
    # Extract URL from href attribute
    url_match = re.search(r'href="([^"]+)"', html_string)
    if url_match:
        return url_match.group(1)
    return html_string

def extract_table_data(markdown_content):
    # Find the table in the markdown content
    table_pattern = r'\| Company \| Role \| Location \| Application\/Link \| Date Posted \|\n\|[^\n]+\n((?:\|[^\n]+\n)*)'
    match = re.search(table_pattern, markdown_content)
    
    if match:
        table_content = match.group(0)
        
        # Convert markdown table to list of lists
        rows = table_content.split('\n')
        # Remove empty rows and the separator row (|----|)
        rows = [row for row in rows if row.strip() and not row.strip().startswith('|-')]
        
        # Parse each row
        data = []
        for row in rows[1:]:  # Skip header row
            # Split by | and remove empty strings
            cols = [col.strip() for col in row.split('|') if col.strip()]
            
            # Skip rows that don't have enough columns or contain only dashes
            if len(cols) < 4 or all(c.replace('-', '').strip() == '' for c in cols):
                continue
                
            # Clean up the company name (remove ** if present)
            company = cols[0].replace('*', '')
            
            # Extract URL from HTML link
            application_link = extract_url_from_html(cols[3])
            
            # Create row data with safe indexing
            data.append({
                'Company': company,
                'Role': cols[1] if len(cols) > 1 else '',
                'Location': cols[2] if len(cols) > 2 else '',
                'Application_Link': application_link,
                'Date_Posted': cols[4] if len(cols) > 4 else ''
            })
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Filter for today's date
        today = datetime.now().strftime('%b %d')
        df = df[df['Date_Posted'] == today]
        
        return df
    
    return None

def insert_jobs_to_supabase(df):
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    supabase = create_client(supabase_url, supabase_key)
    
    # First, let's insert/update companies
    for index, row in df.iterrows():
        # Extract company name from markdown link if present
        company_name = re.search(r'\[([^\]]+)\]', row['Company'])
        company_name = company_name.group(1) if company_name else row['Company']
        
        # Extract company website from markdown link if present
        company_url = re.search(r'\((https?://[^\)]+)\)', row['Company'])
        company_url = company_url.group(1) if company_url else None
        
        # Insert or update company
        company_data = {
            "name": company_name,
            "website_url": company_url,
            "updated_at": datetime.now().isoformat()
        }
        
        # Upsert company (insert if not exists, update if exists)
        company_result = supabase.table('companies').upsert(company_data).execute()
        
        # Get the company id
        company_id = company_result.data[0]['id']
        
        # Handle date parsing with error checking
        date_posted = None
        if row['Date_Posted']:
            try:
                date_posted = datetime.strptime(row['Date_Posted'], '%b %d').replace(year=2023).date().isoformat()
            except ValueError:
                print(f"Warning: Could not parse date '{row['Date_Posted']}' for job {row['Role']}")
        
        # Check if job already exists
        existing_job = supabase.table('jobs')\
            .select('*')\
            .eq('company_id', company_id)\
            .eq('title', row['Role'])\
            .eq('application_url', row['Application_Link'])\
            .execute()
        
        if existing_job.data:
            print(f"Job {row['Role']} for company {company_name} already exists, skipping...")
            continue
        
        # Prepare job data
        job_data = {
            "company_id": company_id,
            "title": row['Role'],
            "location": row['Location'],
            "application_url": row['Application_Link'],
            "date_posted": date_posted,
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert job
        try:
            supabase.table('jobs').insert(job_data).execute()
            print(f"Successfully inserted job {row['Role']} for company {company_name}")
        except Exception as e:
            print(f"Error inserting job {row['Role']} for company {company_name}: {str(e)}")

def main():
    # Get the data
    readme_content = get_github_readme()
    df = extract_table_data(readme_content)

    if df is not None:
        if not df.empty:
            insert_jobs_to_supabase(df)
            print(f"Successfully processed {len(df)} jobs from today")
        else:
            print("No new jobs found today")
    else:
        print("Error: Could not extract table data from README")

if __name__ == "__main__":
    main()