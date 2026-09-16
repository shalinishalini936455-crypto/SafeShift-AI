from database.database import SessionLocal, engine, Base
from models.habitation import Habitation
from models.redzone import RedZone
from models.safesite import SafeSite
Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    # Check whether demo data already exists
    existing_habitations = db.query(Habitation).count()
    existing_red_zones = db.query(RedZone).count()
    existing_safe_sites = db.query(SafeSite).count()

    if existing_habitations == 0 and existing_red_zones == 0 and existing_safe_sites == 0:

        # -------------------------
        # HABITATIONS
        # -------------------------
        habitations = [
            Habitation(
                name="Village A",
                district="Salem",
                latitude=11.6643,
                longitude=78.1460,
                population=1240,
                risk_level="Critical"
            ),
            Habitation(
                name="Village B",
                district="Salem",
                latitude=11.6800,
                longitude=78.1200,
                population=850,
                risk_level="High"
            ),
            Habitation(
                name="Village C",
                district="Erode",
                latitude=11.3410,
                longitude=77.7172,
                population=620,
                risk_level="High"
            ),
        ]

        # -------------------------
        # RED ZONES
        # -------------------------
        red_zones = [
            RedZone(
                zone_name="Flood Zone A",
                district="Salem",
                latitude=11.6700,
                longitude=78.1500,
                hazard_type="Flood",
                severity="High"
            ),
            RedZone(
                zone_name="Landslide Zone B",
                district="Salem",
                latitude=11.6900,
                longitude=78.1300,
                hazard_type="Landslide",
                severity="Critical"
            ),
            RedZone(
                zone_name="Flood Zone C",
                district="Erode",
                latitude=11.3500,
                longitude=77.7200,
                hazard_type="Flood",
                severity="Medium"
            ),
        ]

        # -------------------------
        # SAFE SITES
        # -------------------------
        safe_sites = [
            SafeSite(
                site_name="Safe Site R04",
                district="Salem",
                latitude=11.7000,
                longitude=78.1000,
                capacity=1800,
                available_capacity=1200,
                safety_level="High"
            ),
            SafeSite(
                site_name="Community Hall R02",
                district="Salem",
                latitude=11.6500,
                longitude=78.1100,
                capacity=1000,
                available_capacity=650,
                safety_level="High"
            ),
            SafeSite(
                site_name="Relief Centre R07",
                district="Erode",
                latitude=11.3600,
                longitude=77.7300,
                capacity=800,
                available_capacity=500,
                safety_level="High"
            ),
        ]

        db.add_all(habitations)
        db.add_all(red_zones)
        db.add_all(safe_sites)

        db.commit()

        print("Demo data inserted successfully!")

    else:
        print("Demo data already exists. No duplicate data inserted.")

finally:
    db.close()