
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
        # HABITATIONS (real risk-prone settlements across India)
        # -------------------------
        habitations = [
            Habitation(
                name="Musiri",
                district="Tiruchirappalli",
                latitude=10.9412,
                longitude=78.4436,
                population=21500,
                risk_score=8.2,
                risk_level="Critical"
            ),
            Habitation(
                name="Paradip",
                district="Jagatsinghpur",
                latitude=20.3167,
                longitude=86.6167,
                population=45000,
                risk_score=9.1,
                risk_level="Critical"
            ),
            Habitation(
                name="Majuli",
                district="Majuli",
                latitude=26.9500,
                longitude=94.1700,
                population=15500,
                risk_score=8.9,
                risk_level="Critical"
            ),
            Habitation(
                name="Wayanad Hill Settlements",
                district="Wayanad",
                latitude=11.6854,
                longitude=76.1320,
                population=12300,
                risk_score=8.7,
                risk_level="Critical"
            ),
            Habitation(
                name="Gosaba Sundarbans",
                district="South 24 Parganas",
                latitude=22.1667,
                longitude=88.8000,
                population=17600,
                risk_score=9.0,
                risk_level="Critical"
            ),
            Habitation(
                name="Supaul Kosi Belt",
                district="Supaul",
                latitude=26.1229,
                longitude=86.6003,
                population=26400,
                risk_score=8.5,
                risk_level="Critical"
            ),
            Habitation(
                name="Cuddalore Coastal Belt",
                district="Cuddalore",
                latitude=11.7480,
                longitude=79.7714,
                population=34200,
                risk_score=7.6,
                risk_level="High"
            ),
            Habitation(
                name="Rudraprayag Hillside",
                district="Rudraprayag",
                latitude=30.2844,
                longitude=78.9811,
                population=6400,
                risk_score=8.0,
                risk_level="High"
            ),
            Habitation(
                name="Konaseema Delta Villages",
                district="East Godavari",
                latitude=16.7500,
                longitude=82.2333,
                population=27800,
                risk_score=7.7,
                risk_level="High"
            ),
            Habitation(
                name="Raichur Riverside",
                district="Raichur",
                latitude=16.2076,
                longitude=77.3463,
                population=18900,
                risk_score=5.8,
                risk_level="Moderate"
            ),
        ]
 
        # -------------------------
        # RED ZONES (real hazard-prone zones across India)
        # -------------------------
        red_zones = [
            RedZone(
                zone_name="Cauvery Flood Zone",
                district="Tiruchirappalli",
                latitude=10.9500,
                longitude=78.4500,
                hazard_type="Flood",
                severity="High"
            ),
            RedZone(
                zone_name="Paradip Cyclone Belt",
                district="Jagatsinghpur",
                latitude=20.3200,
                longitude=86.6100,
                hazard_type="Cyclone",
                severity="Critical"
            ),
            RedZone(
                zone_name="Brahmaputra Flood Zone",
                district="Majuli",
                latitude=26.9600,
                longitude=94.1800,
                hazard_type="Flood",
                severity="Critical"
            ),
            RedZone(
                zone_name="Wayanad Landslide Zone",
                district="Wayanad",
                latitude=11.6900,
                longitude=76.1400,
                hazard_type="Landslide",
                severity="Critical"
            ),
            RedZone(
                zone_name="Sundarbans Tidal Surge Zone",
                district="South 24 Parganas",
                latitude=22.1700,
                longitude=88.8100,
                hazard_type="Cyclone",
                severity="Critical"
            ),
            RedZone(
                zone_name="Kosi Flood Zone",
                district="Supaul",
                latitude=26.1300,
                longitude=86.6100,
                hazard_type="Flood",
                severity="High"
            ),
            RedZone(
                zone_name="Rudraprayag Landslide Zone",
                district="Rudraprayag",
                latitude=30.2900,
                longitude=78.9900,
                hazard_type="Landslide",
                severity="High"
            ),
        ]
 
        # -------------------------
        # SAFE SITES (relief centres / evacuation points across India)
        # -------------------------
        safe_sites = [
            SafeSite(
                site_name="Tiruchirappalli Relief Centre",
                district="Tiruchirappalli",
                latitude=10.9600,
                longitude=78.4600,
                capacity=2000,
                available_capacity=1500,
                safety_level="High"
            ),
            SafeSite(
                site_name="Paradip Cyclone Shelter",
                district="Jagatsinghpur",
                latitude=20.3300,
                longitude=86.6200,
                capacity=3000,
                available_capacity=2100,
                safety_level="High"
            ),
            SafeSite(
                site_name="Majuli Flood Relief Camp",
                district="Majuli",
                latitude=26.9700,
                longitude=94.1900,
                capacity=1500,
                available_capacity=900,
                safety_level="High"
            ),
            SafeSite(
                site_name="Wayanad Community Hall",
                district="Wayanad",
                latitude=11.6950,
                longitude=76.1450,
                capacity=1200,
                available_capacity=800,
                safety_level="High"
            ),
            SafeSite(
                site_name="Gosaba Cyclone Shelter",
                district="South 24 Parganas",
                latitude=22.1750,
                longitude=88.8150,
                capacity=1800,
                available_capacity=1300,
                safety_level="High"
            ),
            SafeSite(
                site_name="Supaul Relief Centre",
                district="Supaul",
                latitude=26.1350,
                longitude=86.6150,
                capacity=1600,
                available_capacity=1000,
                safety_level="High"
            ),
            SafeSite(
                site_name="Rudraprayag Relief Camp",
                district="Rudraprayag",
                latitude=30.2950,
                longitude=78.9950,
                capacity=900,
                available_capacity=600,
                safety_level="High"
            ),
        ]
 
        db.add_all(habitations)
        db.add_all(red_zones)
        db.add_all(safe_sites)
 
        db.commit()
 
        print("Real data inserted successfully!")
 
    else:
        print("Data already exists. No duplicate data inserted.")
 
finally:
    db.close()
 

