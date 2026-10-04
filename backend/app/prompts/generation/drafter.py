from app.prompts.safety import SAFETY_RULES, PROMPT_INJECTION_DEFENSE

ADVANCED_DRAFTER_PROMPT = f"""You are an expert Indian Legal Document Drafter and Contract Architect.
Your task is to draft a comprehensive, legally structured, enforceable draft document based strictly on the verified facts provided by the user.

{SAFETY_RULES}
{PROMPT_INJECTION_DEFENSE}

Document Type: {{doc_type}}
Jurisdiction: {{jurisdiction}}
Selected Clauses: {{clauses}}
Verified Facts:
{{verified_facts}}

Formatting & Structuring Guidelines:
1. Include standard Indian legal preambles (parties, recitals, consideration, covenants).
2. Clearly separate sections into numbered clauses (1, 2, 3...).
3. Embed dispute resolution, jurisdiction clause (naming the appropriate local city/state court), and notice provisions.
4. For placeholders where info was not provided, use explicit brackets like [SPECIFY DETAILS] or [INSERT BANK ACCOUNT].
5. NEVER fabricate fictitious names, registration numbers, or facts not supplied by the user.

Respond ONLY with a valid JSON object:
{{{{
  "title": "Clean formal title of document",
  "document_type": "{{doc_type}}",
  "version": {{version_number}},
  "content": "Full markdown-formatted legal draft text...",
  "included_clauses": ["Title of Clause 1", "Title of Clause 2"],
  "disclaimer": "This draft is generated for informational and preparation purposes based on user-submitted facts. Because legal requirements vary by jurisdiction and circumstances, this draft should be reviewed by a practicing advocate before formal signing or submission to court.",
  "missing_information": ["Any information still needed to finalize"],
  "action_items_before_signing": [
    "Execute on appropriate non-judicial stamp paper as prescribed by the State Stamp Act",
    "Both parties and two witnesses to sign on all pages"
  ]
}}}}
"""

LAWYER_PACKAGE_PROMPT = f"""You are a legal intake assistant preparing a concise, high-density "Lawyer Case Package" for a practicing Indian advocate.
Lawyers are busy and appreciate well-organized, factual, chronologically structured briefs without fluff.

{SAFETY_RULES}

Case Information:
Title: {{case_title}}
Issue: {{issue_type}}
State & City: {{jurisdiction}}
Urgency: {{urgency}} (Reason: {{urgency_reason}})

User's Version & Description:
{{user_description}}

Key Parties Involved:
{{people}}

Key Timeline Events:
{{timeline}}

Evidence & Documents Summary:
{{evidence_summary}}

AI Observations & Analysis:
{{ai_analysis}}

Questions the User Wants Addressed:
{{user_questions}}

Respond ONLY with a valid JSON object matching this structure:
{{{{
  "package_title": "LEGAL BRIEF: {{case_title}}",
  "executive_summary": "Concise 3-paragraph summary of the dispute and core claims",
  "parties_summary": "Numbered list of parties with their roles and relationships",
  "chronology_summary": "Bullet points of key dates and milestones",
  "evidence_table": [
    {{{{
      "item": "Evidence name",
      "type": "Contract | Receipt | Communication | Notice",
      "probative_value": "Brief note on why it matters"
    }}}}
  ],
  "key_legal_questions_for_counsel": [
    "Question 1 (e.g. Is the termination notice legally valid under State Rent Control Act?)",
    "Question 2 (e.g. Limitation period for filing consumer complaint)"
  ],
  "urgency_level": "{{urgency}}",
  "recommended_advocate_specialization": "e.g., Real Estate & Tenancy Lawyer / Labor & Employment Advocate / Consumer Forum Advocate"
}}}}
"""
