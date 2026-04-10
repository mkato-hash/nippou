from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import httpx
import pandas as pd
from datetime import datetime, timedelta
from io import BytesIO
import os

app = FastAPI()

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000/api")
JWT_SECRET = os.getenv("JWT_SECRET", "secret")


class WeeklyReport(BaseModel):
    trainee_name: str
    total_reports: int
    reported_days: int
    has_problems: bool


class AnalyticsResponse(BaseModel):
    week_start: str
    week_end: str
    trainees: List[WeeklyReport]


async def verify_token(authorization: Optional[str]) -> dict:
    """Verify JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = authorization.split(" ")[1]
    # In production, verify the token properly
    # For now, just check if token exists
    return {"token_verified": True}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}


@app.get("/analytics/weekly", response_model=AnalyticsResponse)
async def get_weekly_analytics(authorization: Optional[str] = Header(None)):
    """Get weekly analytics summary"""

    await verify_token(authorization)

    try:
        headers = {"Authorization": authorization} if authorization else {}
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_BASE_URL}/reports", headers=headers)
            response.raise_for_status()
            reports = response.json()

        # Calculate weekly stats
        now = datetime.now()
        week_start = now - timedelta(days=now.weekday())
        week_end = week_start + timedelta(days=6)

        # Group reports by trainee
        trainees_data = {}
        for report in reports:
            report_date = datetime.fromisoformat(report['submittedAt'].replace('Z', '+00:00'))

            if week_start <= report_date <= week_end:
                user_id = report['userId']
                user_name = report['user']['name']

                if user_id not in trainees_data:
                    trainees_data[user_id] = {
                        'name': user_name,
                        'reports': [],
                    }

                trainees_data[user_id]['reports'].append(report)

        # Build response
        trainees = []
        for user_id, data in trainees_data.items():
            has_problems = any(
                r['problems'].strip() != ''
                for r in data['reports']
            )
            trainees.append(WeeklyReport(
                trainee_name=data['name'],
                total_reports=len(data['reports']),
                reported_days=len(set(
                    datetime.fromisoformat(r['submittedAt'].replace('Z', '+00:00')).date()
                    for r in data['reports']
                )),
                has_problems=has_problems,
            ))

        return AnalyticsResponse(
            week_start=week_start.isoformat(),
            week_end=week_end.isoformat(),
            trainees=trainees,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/export/csv")
async def export_csv(authorization: Optional[str] = Header(None)):
    """Export reports as CSV"""

    await verify_token(authorization)

    try:
        headers = {"Authorization": authorization} if authorization else {}
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_BASE_URL}/reports", headers=headers)
            response.raise_for_status()
            reports = response.json()

        # Prepare data for CSV
        data = []
        for report in reports:
            data.append({
                '提出者': report['user']['name'],
                'メールアドレス': report['user']['email'],
                '本日の研修内容': report['trainingContent'],
                '進捗状況': report['progressStatus'],
                '問題・困ったこと': report['problems'],
                '明日の予定': report['tomorrowPlan'],
                '提出日時': report['submittedAt'],
                '既読': '○' if report['isRead'] else '✕',
            })

        # Create DataFrame and save to CSV
        df = pd.DataFrame(data)
        csv_buffer = BytesIO()
        df.to_csv(csv_buffer, index=False, encoding='utf-8-sig')
        csv_buffer.seek(0)

        return FileResponse(
            iter([csv_buffer.getvalue()]),
            media_type='text/csv',
            filename=f"reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
