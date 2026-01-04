import streamlit as st
import os
import re

# Set page config
st.set_page_config(page_title="AI Code Quality Checker", layout="wide")

st.title("🤖 AI Code Quality Checker")
st.markdown("Upload your code files or paste code to analyze compliance with Security, Performance, and Style standards.")

# Sidebar for Checklist
st.sidebar.header("Quality Checklist")
checklist_items = {
    "security": st.sidebar.checkbox("Security Checks (e.g., No Hardcoded Secrets)", value=True),
    "performance": st.sidebar.checkbox("Performance Checks (e.g., No Console Logs)", value=True),
    "style": st.sidebar.checkbox("Style/Linting (PEP8/ESLint standards)", value=True),
}

# Input Area
code_input = st.text_area("Paste Code Here:", height=300)
uploaded_file = st.file_uploader("Or Upload a File", type=['js', 'py', 'ts', 'jsx', 'tsx'])

if uploaded_file is not None:
    code_input = uploaded_file.getvalue().decode("utf-8")

# Analysis Logic
def analyze_code(code):
    issues = []
    score = 100
    
    # 1. Security Checks
    if checklist_items["security"]:
        if re.search(r'(password|secret|key)\s*=\s*[\'"][^\'"]+[\'"]', code, re.IGNORECASE):
            issues.append(("🔴 CRITICAL", "Found potential hardcoded secrets/passwords."))
            score -= 20
        if "eval(" in code:
            issues.append(("🔴 CRITICAL", "Avoid using 'eval()'. It is a major security risk."))
            score -= 20

    # 2. Performance/Best Practices
    if checklist_items["performance"]:
        if "console.log" in code or "print(" in code:
            issues.append(("🟡 WARNING", "Found console output statements. Remove for production."))
            score -= 5
        if "while(true)" in code.lower() or "while true" in code.lower():
            issues.append(("🟡 WARNING", "Infinite loop detected. Verify 'break' conditions."))
            score -= 10

    # 3. Code Style
    if checklist_items["style"]:
        if len(code.split('\n')) > 300:
            issues.append(("🔵 INFO", "File is too long (>300 lines). Consider refactoring."))
            score -= 5
        if "TODO" in code:
            issues.append(("🔵 INFO", "Found TODO comments. Ensure they are tracked."))

    return max(score, 0), issues

# Run Analysis
if st.button("Analyze Code"):
    if not code_input:
        st.warning("Please input some code first.")
    else:
        st.subheader("Analysis Results")
        
        with st.spinner("AI Agent analyzing..."):
            score, issues = analyze_code(code_input)
            
            # Display Score
            col1, col2 = st.columns([1, 3])
            with col1:
                st.metric("Quality Score", f"{score}/100")
            
            with col2:
                if score > 80:
                    st.success("Code looks good! Production Ready.")
                elif score > 50:
                    st.warning("Needs Improvement. See issues below.")
                else:
                    st.error("Critical Issues Found! Do not deploy.")

            # Display Issues
            st.write("### Detailed Report")
            if not issues:
                st.info("No issues found based on current checklist.")
            else:
                for severity, msg in issues:
                    st.write(f"**{severity}**: {msg}")

st.markdown("---")
st.caption("Powered by Local Rule-Based AI Agent")
