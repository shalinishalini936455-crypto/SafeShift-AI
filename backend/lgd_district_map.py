# backend/lgd_district_map.py

# ============================================================
# LGD = Local Government Directory
# District-level LGD codes used by SACHET alerts.
#
# This file converts:
#
#     SACHET LGD CODE
#             ↓
#        DISTRICT NAME
#
# Coordinate resolution is handled separately by
# sachet_service.py / district_coordinates.py.
# ============================================================


LGD_DISTRICT_MAP = {

    # ============================================================
    # ODISHA
    # ============================================================

    "344": "Anugul",
    "345": "Balangir",
    "346": "Baleshwar",
    "347": "Bargarh",
    "348": "Bhadrak",
    "349": "Boudh",
    "350": "Cuttack",
    "351": "Deogarh",
    "352": "Dhenkanal",
    "353": "Gajapati",
    "354": "Ganjam",
    "355": "Jagatsinghpur",
    "356": "Jajapur",
    "357": "Jharsuguda",
    "358": "Kalahandi",
    "359": "Kandhamal",
    "360": "Kendrapara",
    "361": "Kendujhar",
    "362": "Khordha",
    "363": "Koraput",
    "364": "Malkangiri",
    "365": "Mayurbhanj",
    "366": "Nabarangpur",
    "367": "Nayagarh",
    "368": "Nuapada",
    "369": "Puri",
    "370": "Rayagada",
    "371": "Sambalpur",
    "372": "Sonepur",
    "373": "Sundargarh",


    # ============================================================
    # CHHATTISGARH
    # ============================================================

    "374": "Bijapur",
    "375": "Bilaspur",
    "376": "Balod",
    "377": "Narayanpur",
    "378": "Raipur",
    "379": "Koriya",
    "380": "Mahasamund",
    "382": "Mungeli",
    "383": "Manendragarh Chirimiri Bharatpur",
    "384": "Korba",
    "385": "Raigarh",
    "386": "Sakti",
    "387": "Sukma",
    "388": "Bastar",
    "389": "Sarangarh Bilaigarh",

    "636": "Dantewada",
    "637": "Dhamtari",
    "642": "Durg",
    "643": "Gariyaband",
    "644": "Jashpur",
    "645": "Kabeerdham",
    "646": "Khairagarh Chhuikhadan Gandai",
    "647": "Kondagaon",
    "648": "Surguja",
    "649": "Balodabazar",
    "650": "Rajnandgaon",

    "734": "Bemetara",
    "760": "Janjgir-Champa",
    "762": "Surajpur",
    "763": "Balrampur",


    # ============================================================
    # ANDHRA PRADESH
    # ============================================================

    "519": "Srikakulam",
    "520": "Visakhapatnam",
    "521": "Vizianagaram",


    # ============================================================
    # MAHARASHTRA
    # ============================================================

    "469": "Chhatrapati Sambhajinagar",
    "479": "Jalna",
    "665": "Palghar",
    "497": "Thane",


    # ============================================================
    # JHARKHAND
    # ============================================================

    "607": "Chatra",
    "606": "East Singhbhum",
    "322": "Dhanbad",
    "339": "Garhwa",
    "332": "Latehar",
    "325": "Bokaro",


    # ============================================================
    # BIHAR
    # ============================================================

    # Additional Bihar LGD codes can be added here after
    # verification against the current LGD directory.


    # ============================================================
    # RAJASTHAN
    # ============================================================

    "86": "Ajmer",
    "87": "Alwar",
    "88": "Banswara",
    "89": "Baran",
    "90": "Barmer",
    "91": "Bharatpur",
    "92": "Bhilwara",
    "93": "Bikaner",
    "94": "Bundi",
    "95": "Chittorgarh",
    "96": "Churu",
    "97": "Dausa",
    "98": "Dholpur",
    "99": "Dungarpur",

    "102": "Jaipur",

    "109": "Kota",
    "110": "Nagaur",
    "111": "Pali",
    "112": "Rajsamand",
    "113": "Sawai Madhopur",
    "114": "Sawai Madhopur",

    "768": "Nagaur",
    "770": "Bikaner",
    "774": "Barmer",
    "782": "Chittorgarh",


    # ============================================================
    # SIKKIM
    # ============================================================

    "742": "Gangtok",
    "228": "Gyalshing",
    "227": "Mangan",
    "225": "Namchi",
    "226": "Pakyong",
    "741": "Soreng",


    # ============================================================
    # ASSAM
    # ============================================================

    "296": "Golaghat",
    "709": "Dibrugarh",
    "288": "Sonitpur",
    "705": "Barpeta",


    # ============================================================
    # DADRA AND NAGAR HAVELI AND DAMAN AND DIU
    # ============================================================

    "463": "Daman",
    "464": "Diu",
    "465": "Dadra And Nagar Haveli",


    # ============================================================
    # KARNATAKA
    # ============================================================

    "525": "Bengaluru Urban",
    "526": "Bengaluru Rural",
    "531": "Chamarajanagara",
    "532": "Chikkamagaluru",
    "534": "Dakshina Kannada",
    "542": "Kolar",
    "545": "Mysuru",
    "550": "Uttara Kannada",
    "630": "Chikkaballapura",


    # ============================================================
    # GUJARAT
    # ============================================================

    "438": "Ahmedabad",
    "439": "Amreli",
    "440": "Anand",
    "441": "Banas Kantha",
    "442": "Bharuch",
    "443": "Bhavnagar",
    "444": "Dangs",
    "445": "Dohad",
    "446": "Gandhinagar",
    "447": "Jamnagar",
    "448": "Junagadh",
    "449": "Kachchh",
    "450": "Kheda",
    "451": "Mahesana",
    "452": "Narmada",
    "453": "Navsari",
    "454": "Panch Mahals",
    "455": "Patan",
    "456": "Porbandar",
    "457": "Rajkot",
    "458": "Sabar Kantha",
    "459": "Surat",
    "460": "Surendranagar",
    "461": "Vadodara",
    "462": "Valsad",

    "641": "Tapi",
    "668": "Chhota Udepur",
    "669": "Mahisagar",
    "672": "Arvalli",
    "673": "Morbi",
    "674": "Devbhumi Dwarka",
    "675": "Gir Somnath",
    "676": "Botad",


    # ============================================================
    # UTTARAKHAND
    # ============================================================

    "45": "Almora",
    "46": "Bageshwar",
    "47": "Chamoli",
    "48": "Champawat",
    "49": "Dehradun",
    "51": "Nainital",
    "52": "Pauri Garhwal",
    "53": "Pithoragarh",
    "54": "Rudraprayag",
    "55": "Tehri Garhwal",
    "57": "Uttarkashi",


    # ============================================================
    # TELANGANA
    # ============================================================

    "501": "Adilabad",
    "507": "Jayashankar Bhupalapally",
    "512": "Jangaon",
    "513": "Medak",
    "516": "Nizamabad",
    "518": "Nalgonda",
    "522": "Warangal Rural",

    "680": "Nirmal",
    "681": "Jagtial",
    "682": "Peddapalli",
    "684": "Mancherial",
    "685": "Komaram Bheem Asifabad",
    "686": "Warangal Urban",
    "687": "Mahabubabad",
    "688": "Bhadradri Kothagudem",
    "689": "Khammam",
    "690": "Bhadradri Kothagudem",
    "691": "Jayashankar Bhupalapally",
    "692": "Mulugu",
    "698": "Vikarabad",
    "699": "Kumuram Bheem Asifabad",
    "700": "Medchal Malkajgiri",
    "720": "Mulugu",
    # ============================================================
# ANDHRA PRADESH - ADDITIONAL SACHET LGD CODES
# ============================================================

"752": "Chittoor",
"503": "Sri Potti Sriramulu Nellore",
"515": "Tirupati",
# ============================================================
# TAMIL NADU
# Official Tamil Nadu LGD district codes
# ============================================================

"523": "Coimbatore",
"524": "Cuddalore",
"525": "Dharmapuri",
"526": "Dindigul",
"527": "Erode",
"528": "Kancheepuram",
"529": "Kanyakumari",
"530": "Karur",
"531": "Krishnagiri",
"532": "Madurai",
"533": "Nagapattinam",
"534": "Namakkal",
"535": "Perambalur",
"536": "Pudukkottai",
"537": "Ramanathapuram",
"538": "Salem",
"539": "Sivaganga",
"540": "Thanjavur",
"541": "The Nilgiris",
"542": "Theni",
"543": "Tiruvallur",
"544": "Tiruvarur",
"545": "Tiruchirappalli",
"546": "Tirunelveli",
"547": "Tiruvannamalai",
"548": "Thoothukudi",
"549": "Vellore",
"550": "Viluppuram",
"551": "Virudhunagar",
"560": "Ariyalur",
"578": "Tiruppur",

# Newer Tamil Nadu districts
"296956": "Tenkasi",
"296959": "Kallakurichi",
"296974": "Chengalpattu",
}



# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_district_name_from_lgd(code):
    """
    Convert a single LGD code to a district name.

    Example:
        "344" -> "Anugul"
    """

    if code is None:
        return None

    code = str(code).strip()

    if not code:
        return None

    return LGD_DISTRICT_MAP.get(code)


def get_district_names_from_lgd_codes(codes):
    """
    Convert multiple LGD codes into district names.

    Unknown codes are ignored.

    Example:
        ["344", "365"]
        -> ["Anugul", "Mayurbhanj"]
    """

    districts = []

    for code in codes or []:

        name = get_district_name_from_lgd(code)

        if name and name not in districts:
            districts.append(name)

    return districts


def get_unmapped_lgd_codes(codes):
    """
    Return LGD codes that are not currently present
    in the LGD_DISTRICT_MAP.

    Useful for debugging new SACHET alerts.
    """

    unmapped = []

    for code in codes or []:

        code = str(code).strip()

        if code and code not in LGD_DISTRICT_MAP:
            if code not in unmapped:
                unmapped.append(code)

    return unmapped


def get_mapping_status(codes):
    """
    Return a debugging summary for a list of LGD codes.
    """

    mapped = []
    unmapped = []

    for code in codes or []:

        code = str(code).strip()

        if not code:
            continue

        if code in LGD_DISTRICT_MAP:

            district = LGD_DISTRICT_MAP[code]

            mapped.append({
                "lgd_code": code,
                "district": district
            })

        else:

            unmapped.append(code)

    return {
        "mapped": mapped,
        "unmapped": unmapped,
        "mapped_count": len(mapped),
        "unmapped_count": len(unmapped),
    }