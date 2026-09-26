"""
routes/assistant.py

Real AI Assistant backend: pulls a live snapshot of your actual
database (habitations, red zones, safe sites, relocation plans) plus
current SACHET alerts, hands that as grounding context to an LLM
(Groq, free tier), and returns an answer based only on that data.

Setup:
    pip install groq python-dotenv
    Add GROQ_API_KEY=gsk_... to your backend's .env file

Wire it in (in your main FastAPI file):
    from routes.assistant import router as assistant_router
    app.include_router(assistant_router)

Note on scale: this loads your full current dataset into the prompt
on every question rather than doing embeddings/vector search. That's
the right call at the size of a hackathon dataset (dozens to low
hundreds of rows) — simpler, always accurate, no stale index. If your
dataset grows into the thousands of rows, you'd want to switch to
retrieving only the relevant subset instead of sending everything.
"""

import os

from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel

from database.database import SessionLocal
from models.habitation import Habitation
from models.redzone import RedZone
from models.safesite import SafeSite
from models.relocation import RelocationPlan
from sachet_service import fetch_sachet_alerts

load_dotenv()

try:
    from groq import Groq

    _groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
except Exception:
    _groq_client = None

GROQ_MODEL = "llama-3.3-70b-versatile"

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])


class ChatRequest(BaseModel):
    message: str


# Cap how many rows go into the prompt so token usage stays sane even
# if your dataset grows a bit. Raise these if you have room.
MAX_HABITATIONS_IN_CONTEXT = 60
MAX_ALERTS_IN_CONTEXT = 20


def build_context() -> str:
    """
    Snapshot your real, current data as plain text for the LLM to
    read. Nothing here is invented — if a table is empty, that's
    stated plainly instead of being papered over.
    """
    db = SessionLocal()

    try:
        habitations = db.query(Habitation).limit(MAX_HABITATIONS_IN_CONTEXT).all()
        red_zones = db.query(RedZone).all()
        safe_sites = db.query(SafeSite).all()
        relocation_plans = db.query(RelocationPlan).all()

        lines = []

        lines.append("=== HABITATIONS ===")
        if habitations:
            for h in habitations:
                lines.append(
                    f"- {h.name} (district: {h.district}, population: {h.population}, "
                    f"risk level: {h.risk_level})"
                )
        else:
            lines.append("No habitations recorded.")

        lines.append("\n=== RED ZONES ===")
        if red_zones:
            for rz in red_zones:
                fields = {
                    k: v
                    for k, v in vars(rz).items()
                    if not k.startswith("_")
                }
                lines.append(f"- {fields}")
        else:
            lines.append("No red zones recorded.")

        lines.append("\n=== SAFE SITES ===")
        if safe_sites:
            for site in safe_sites:
                fields = {
                    k: v
                    for k, v in vars(site).items()
                    if not k.startswith("_")
                }
                lines.append(f"- {fields}")
        else:
            lines.append("No safe sites recorded.")

        lines.append("\n=== RELOCATION PLANS ===")
        if relocation_plans:
            for plan in relocation_plans:
                lines.append(
                    f"- Plan {plan.id}: habitation {plan.habitation_id} -> "
                    f"safe site {plan.safe_site_id}, priority {plan.priority}, "
                    f"{plan.people_to_relocate} people, {plan.distance_km} km, "
                    f"status: {plan.status}"
                )
        else:
            lines.append("No relocation plans recorded.")

        return "\n".join(lines)

    finally:
        db.close()


def build_alert_context() -> str:
    """
    Live SACHET alerts, trimmed to a manageable count for the prompt.
    """
    try:
        data = fetch_sachet_alerts()
    except Exception as exc:
        return f"Could not fetch live SACHET alerts: {exc}"

    alerts = data.get("alerts", [])[:MAX_ALERTS_IN_CONTEXT]

    if not alerts:
        return "No active SACHET alerts right now."

    lines = ["=== ACTIVE SACHET ALERTS ==="]
    for alert in alerts:
        lines.append(
            f"- [{alert.get('severity', 'Unknown')}] {alert.get('hazard_type')}: "
            f"{alert.get('headline')} "
            f"(districts: {', '.join(alert.get('affected_districts', [])) or 'unspecified'})"
        )
    return "\n".join(lines)


SYSTEM_PROMPT = """You are the SafeShift AI Assistant, embedded in a disaster \
risk and relocation decision-support dashboard for Indian disaster management \
officers.

You will be given a snapshot of the system's real current data (habitations, \
red zones, safe sites, relocation plans) and live NDMA SACHET disaster alerts. \
Answer the user's question using ONLY this data.

Rules:
- If the data doesn't contain the answer, say so plainly. Never invent \
numbers, places, or facts not present in the provided context.
- Be concise and operational — this is for officers making real decisions, \
not a general chat.
- When citing numbers (population, capacity, counts), pull them exactly from \
the context provided.
- If asked something unrelated to disaster management/this system, politely \
redirect to what you can help with."""


@router.post("/chat")
def chat(request: ChatRequest):
    if _groq_client is None:
        return {
            "reply": (
                "AI Assistant isn't configured yet — add GROQ_API_KEY to the "
                "backend's .env file and restart the server."
            ),
            "error": True,
        }

    db_context = build_context()
    alert_context = build_alert_context()

    full_context = f"{db_context}\n\n{alert_context}"

    try:
        completion = _groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"CURRENT SYSTEM DATA:\n{full_context}\n\nQUESTION: {request.message}",
                },
            ],
            temperature=0.2,
            max_tokens=600,
        )
        reply = completion.choices[0].message.content
    except Exception as exc:
        return {"reply": f"AI Assistant error: {exc}", "error": True}

    return {"reply": reply, "error": False}
