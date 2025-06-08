import os
import sys
from pathlib import Path
import PyPDF2
import subprocess
import json

def parse_pdf(pdf_path):
    """Extract text from PDF using PyPDF2."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            print(f"Parsing PDF: {pdf_path}")
            print(f"Number of pages: {len(pdf_reader.pages)}")
            
            for page_num, page in enumerate(pdf_reader.pages):
                print(f"Processing page {page_num + 1}...")
                text += page.extract_text() + "\n"
            
            return text.strip()
    except FileNotFoundError:
        print(f"Error: PDF file '{pdf_path}' not found.")
        return ""
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def call_gemma3(prompt):
    """Call Gemma3 AI model with a given prompt."""
    try:
        process = subprocess.Popen(
            ['ollama', 'run', 'gemma3'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        process.stdin.write(prompt.encode())
        stdout, stderr = process.communicate()
        
        if stderr:
            print(f"Warning: {stderr.decode()}")
        
        return stdout.decode().strip()
    except Exception as e:
        print(f"Error calling Gemma3: {e}")
        return ""

def extract_keywords_ai(text, context="professional"):
    """Extract keywords using AI (Gemma3) for better context understanding."""
    prompt = f"""
Please analyze the following {context} text and extract the most important keywords and skills. 
Focus on:
- Technical skills and technologies
- Professional competencies
- Industry-specific terms
- Job-relevant qualifications
- Tools and software
- Certifications and methodologies

Return only a comma-separated list of keywords, no explanations:

Text to analyze:
{text[:3000]}  # Limit text length for AI processing
"""
    
    response = call_gemma3(prompt)
    if response:
        # Parse comma-separated keywords
        keywords = [kw.strip().lower() for kw in response.split(',') if kw.strip()]
        return [kw for kw in keywords if len(kw) > 2 and kw.replace(' ', '').isalpha()]
    return []

def get_job_advert_text():
    """Get job advert text from user input via console."""
    print("\n" + "="*60)
    print("JOB ADVERT INPUT")
    print("="*60)
    print("Please paste the job advert text below.")
    print("When finished, press Enter twice (empty line) to continue:")
    print("(Or type 'quit' to cancel)")
    print("-" * 60)
    
    lines = []
    empty_line_count = 0
    
    while True:
        try:
            line = input()
            if line.strip().lower() == 'quit':
                print("Input cancelled.")
                return ""
            elif line.strip() == "":
                empty_line_count += 1
                if empty_line_count >= 2:
                    break
                lines.append(line)  # Keep empty lines within text
            else:
                empty_line_count = 0
                lines.append(line)
        except KeyboardInterrupt:
            print("\nInput cancelled.")
            return ""
    
    job_text = "\n".join(lines).strip()
    print(f"\n✓ Job advert captured: {len(job_text)} characters")
    return job_text

def ai_keyword_analysis(cv_keywords, job_keywords, cv_text, job_text):
    """Use AI to provide intelligent analysis of keyword matching."""
    prompt = f"""
Analyze this CV and job advert for keyword optimization. Provide a JSON response with the following structure:

{{
    "match_analysis": "Brief analysis of how well the CV matches the job requirements",
    "missing_critical": ["list", "of", "most", "important", "missing", "keywords"],
    "recommendations": ["specific", "actionable", "recommendations"],
    "synonym_matches": ["keywords", "that", "are", "similar", "but", "different", "words"],
    "priority_additions": ["top", "3", "keywords", "to", "add", "immediately"]
}}

CV Keywords: {', '.join(cv_keywords[:50])}
Job Keywords: {', '.join(job_keywords[:50])}

Job Requirements Summary:
{job_text[:1000]}

CV Summary:
{cv_text[:1000]}
"""
    
    response = call_gemma3(prompt)
    
    # Try to parse JSON response, fallback to basic analysis if parsing fails
    try:
        import json
        analysis = json.loads(response)
        return analysis
    except:
        # Fallback to basic analysis
        return {
            "match_analysis": "AI analysis temporarily unavailable, using basic comparison",
            "missing_critical": list(set(job_keywords) - set(cv_keywords))[:5],
            "recommendations": ["Add missing keywords to your CV", "Focus on relevant experience"],
            "synonym_matches": [],
            "priority_additions": list(set(job_keywords) - set(cv_keywords))[:3]
        }

def compare_cv_with_job(cv_pdf_path):
    """Compare CV PDF with job advert text using AI analysis."""
    print("\n" + "="*60)
    print("🎯 AI-POWERED CV & JOB ADVERT ANALYSIS")
    print("="*60)
    
    # Extract text from CV PDF
    print("\n📄 Processing CV PDF...")
    cv_text = parse_pdf(cv_pdf_path)
    if not cv_text:
        print("❌ Failed to extract text from CV PDF.")
        return
    
    # Get job advert text from console
    job_text = get_job_advert_text()
    if not job_text:
        print("❌ No job advert text provided.")
        return
    
    print("\n🤖 Analyzing CV with Gemma3 AI...")
    cv_keywords = extract_keywords_ai(cv_text, "CV")
    
    print("🤖 Analyzing job advert with Gemma3 AI...")
    job_keywords = extract_keywords_ai(job_text, "job advert")
    
    print("🧠 Performing intelligent keyword analysis...")
    ai_analysis = ai_keyword_analysis(cv_keywords, job_keywords, cv_text, job_text)
    
    # Calculate basic statistics
    cv_keywords_set = set(cv_keywords)
    job_keywords_set = set(job_keywords)
    matching_keywords = cv_keywords_set.intersection(job_keywords_set)
    missing_keywords = job_keywords_set - cv_keywords_set
    
    # Display results
    print("\n" + "="*60)
    print("🤖 AI KEYWORD ANALYSIS RESULTS")
    print("="*60)
    
    print(f"\n📈 STATISTICS:")
    print(f"   • AI-extracted CV keywords: {len(cv_keywords)}")
    print(f"   • AI-extracted job keywords: {len(job_keywords)}")
    print(f"   • Direct keyword matches: {len(matching_keywords)}")
    print(f"   • Missing keywords: {len(missing_keywords)}")
    
    # Calculate match percentage
    if job_keywords_set:
        match_percentage = (len(matching_keywords) / len(job_keywords_set)) * 100
        print(f"\n🎯 AI KEYWORD MATCH SCORE: {match_percentage:.1f}%")
        
        if match_percentage < 30:
            print("   💡 LOW - Significant keyword gaps identified")
        elif match_percentage < 50:
            print("   ⚠️  MODERATE - Good foundation, needs enhancement")
        elif match_percentage < 70:
            print("   👍 GOOD - Strong keyword alignment")
        else:
            print("   🎉 EXCELLENT - Outstanding keyword coverage!")
    
    # AI Analysis Results
    print(f"\n🧠 AI ANALYSIS:")
    print(f"   {ai_analysis.get('match_analysis', 'Analysis in progress...')}")
    
    if matching_keywords:
        print(f"\n✅ MATCHING KEYWORDS ({len(matching_keywords)}):")
        matching_sorted = sorted(matching_keywords)
        # Display in columns for better readability
        for i in range(0, len(matching_sorted), 4):
            row_keywords = matching_sorted[i:i+4]
            print("   " + " | ".join(f"{kw:<15}" for kw in row_keywords))
    
    # AI-identified critical missing keywords
    critical_missing = ai_analysis.get('missing_critical', [])
    if critical_missing:
        print(f"\n🔥 AI-IDENTIFIED CRITICAL MISSING KEYWORDS:")
        for i, keyword in enumerate(critical_missing[:10], 1):
            print(f"   {i:2d}. {keyword}")
    
    # AI-detected synonym matches
    synonym_matches = ai_analysis.get('synonym_matches', [])
    if synonym_matches:
        print(f"\n🔄 AI-DETECTED SIMILAR CONCEPTS:")
        for keyword in synonym_matches[:5]:
            print(f"   • {keyword}")
    
    # AI Recommendations
    recommendations = ai_analysis.get('recommendations', [])
    if recommendations:
        print(f"\n💼 AI-POWERED RECOMMENDATIONS:")
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"   {i}. {rec}")
    
    # Priority additions
    priority_adds = ai_analysis.get('priority_additions', [])
    if priority_adds:
        print(f"\n🎯 IMMEDIATE PRIORITY ADDITIONS:")
        print(f"   Add these keywords ASAP: {', '.join(priority_adds)}")
    
    print(f"\n🚀 NEXT STEPS:")
    print("   1. Add the priority keywords to your CV")
    print("   2. Incorporate missing keywords naturally into job descriptions")
    print("   3. Update your skills section with relevant technologies")
    print("   4. Use keyword variations to avoid over-repetition")
    print("   5. Re-run this analysis after updates to track improvement")
    
    print("\n" + "="*60)
    print("✨ AI Analysis Complete! Your CV is now optimized for ATS!")
    print("="*60)

def summarize_text(text):
    """AI summarization using Ollama/Gemma3."""
    prompt = f"Summarize the following text concisely and clearly:\n\n{text}"
    return call_gemma3(prompt)

def get_pdf_path():
    """Get PDF file path from user input with validation."""
    while True:
        pdf_path = input("\n📄 Enter the path to your PDF file: ").strip()
        
        if not pdf_path:
            print("❌ Please provide a PDF file path.")
            continue
            
        # Handle relative paths and expand user directory
        pdf_path = os.path.expanduser(pdf_path)
        
        if not os.path.exists(pdf_path):
            print(f"❌ PDF file '{pdf_path}' not found. Please check the path and try again.")
            continue
            
        if not pdf_path.lower().endswith('.pdf'):
            print("❌ Please provide a valid PDF file (must end with .pdf).")
            continue
            
        return pdf_path

def get_user_choice():
    """Get user's choice for which feature to use."""
    print("\n🚀 PDF2AI - AI-Powered PDF Analysis and CV Optimization Tool")
    print("=" * 60)
    print("Choose a feature:")
    print("  1. 📄 Summarise PDF - Get an AI-powered summary of your PDF")
    print("  2. 🎯 Compare CV with Job - Compare your CV against a job advert")
    print("  3. ❌ Exit")
    print("=" * 60)
    
    while True:
        try:
            choice = input("\nEnter your choice (1, 2, or 3): ").strip()
            
            if choice == "1":
                return "summarise"
            elif choice == "2":
                return "compare"
            elif choice == "3":
                return "exit"
            else:
                print("❌ Invalid choice. Please enter 1, 2, or 3.")
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            return "exit"

def main():
    # Interactive mode - ask user what they want to do
    choice = get_user_choice()
    
    if choice == "exit":
        print("\n👋 Goodbye!")
        return
    
    # Get PDF file path
    pdf_path = get_pdf_path()
    
    if choice == "summarise":
        # AI Summarization
        print(f"\n🤖 Processing PDF: {pdf_path}")
        text = parse_pdf(pdf_path)
        if text:
            print("\n🤖 Generating AI summary using Gemma3...")
            summary = summarize_text(text)
            print("\n" + "="*50)
            print("📄 AI SUMMARY:")
            print("="*50)
            print(summary)
            print("="*50)
        else:
            print("❌ Failed to extract text from PDF.")
    
    elif choice == "compare":
        # CV-Job Comparison
        print(f"\n🎯 Starting CV-Job comparison with: {pdf_path}")
        compare_cv_with_job(pdf_path)

if __name__ == "__main__":
    main()