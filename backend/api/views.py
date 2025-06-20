from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from django.contrib.sessions.models import Session
from core.neo4j_driver import get_officer_by_name
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from django.views.decorators.http import require_GET
import requests
from django.db.models import Max
from .models import CitizenPhoto
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes

@api_view(["POST"])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")

    if not username or not password or not role:
        return Response({"detail": "Missing fields"}, status=400)

    officer = get_officer_by_name(username)
    print(f"Officer {officer}")
    if officer:
        props = officer._properties
        if props.get("password") == password and props.get("role") == role:
            request.session["username"] = username
            request.session["role"] = role
            return Response({"detail": "Login successful"})
        else:
            return Response({"detail": "Invalid password or role"}, status=401)
    else:
        return Response({"detail": "User not found"}, status=404)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from neo4j import GraphDatabase
from .models import OfficerPhoto  # stored in PostgreSQL

# Neo4j driver setup
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "ssnssnssnssn"))

import base64

@api_view(['GET'])
def get_profile(request):
    officer_id = request.session.get("username")
    if not officer_id:
        return Response({"detail": "Officer not logged in"}, status=401)

    # Fetch details from Neo4j
    with driver.session() as session:
        result = session.run(
            """
            MATCH (o:PoliceOfficer {officerId: $officer_id})
            RETURN o.name AS name, o.role AS role, o.mobile AS mobile, o.email AS email, o.address AS address
            """,
            officer_id=int(officer_id)
        )
        record = result.single()
        if not record:
            return Response({"detail": "Officer not found in Neo4j"}, status=404)

    # Fetch and encode photo
    try:
        photo_entry = OfficerPhoto.objects.get(officer_id=str(officer_id))
        with open(photo_entry.photo.path, "rb") as img_file:
            encoded_photo = base64.b64encode(img_file.read()).decode("utf-8")
        photo_data = f"data:image/jpeg;base64,{encoded_photo}"
    except OfficerPhoto.DoesNotExist:
        photo_data = None

    return Response({
        "officer_id": officer_id,
        "name": record["name"],
        "role": record["role"],
        "mobile": record["mobile"],
        "email": record["email"],
        "address": record["address"],
        "photo_data": photo_data,
    })


driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "ssnssnssnssn"))
'''
@csrf_exempt
def file_fir(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)

    try:
        data = json.loads(request.body)

        # Get officer ID from frontend session
        officer_id = data.get("officer_id")  # Ideally should come from a secure session

        if not officer_id:
            return JsonResponse({"error": "Officer ID missing from request."}, status=400)

        # Prepare FIR data
        now = datetime.now()
        filed_date = now.date().isoformat()
        filed_time = now.time().isoformat(timespec='seconds')

        fir_props = {
            "complainant_name": data.get("name"),
            "contact": data.get("contact"),
            "email": data.get("email"),
            "incident_datetime": data.get("incidentDate"),
            "location": data.get("location"),
            "crime_type": data.get("crimeType"),
            "description": data.get("description"),
            "ipc_sections": data.get("ipcSections", []),
            "filed_date": filed_date,
            "filed_time": filed_time,
            "approved": False,
            "status": "Pending"
        }

        with driver.session() as session:
            session.write_transaction(create_fir_node, officer_id, fir_props)

        return JsonResponse({"message": "FIR filed successfully."}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
'''

@csrf_exempt
def file_fir(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)

    try:
        data = json.loads(request.body)

        officer_id = data.get("username")
        complainant_ids = data.get("complainant_ids", [])
        print(complainant_ids)
        accused_ids = data.get("accused_ids", [])
        print(accused_ids)

        if not officer_id:
            return JsonResponse({"error": "Missing officer ID"}, status=400)

        now = datetime.now()
        fir_props = {
            "incident_datetime": data.get("incidentDate"),
            "location": data.get("location"),
            "crime_type": data.get("crimeType"),
            "description": data.get("firDetails"),
            "ipc_sections": data.get("ipcSections", []),
            "filed_date": now.date().isoformat(),
            "filed_time": now.time().isoformat(timespec='seconds'),
            "approved": False,
            "status": "Pending"
        }

        with driver.session() as session:
            session.write_transaction(
                create_fir_with_all_relationships,
                officer_id, complainant_ids, accused_ids, fir_props
            )

        return JsonResponse({"message": "FIR filed successfully."}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def create_fir_with_all_relationships(tx, officer_id, complainant_ids, accused_ids, fir_props):
    # Log the officer and IDs for debugging
    print("Officer ID:", officer_id)
    print("Complainant IDs:", complainant_ids)
    print("Accused IDs:", accused_ids)
    print("FIR Props:", fir_props)

    # Clean the IDs (strip, convert to string, and upper case)
    complainant_ids = [str(x).strip().upper() for x in complainant_ids]
    accused_ids = [str(x).strip().upper() for x in accused_ids]

    # Log cleaned IDs for debugging
    print("Cleaned Complainant IDs:", complainant_ids)
    print("Cleaned Accused IDs:", accused_ids)

    # Cypher query to create the FIR and relationships
    query = """
    MATCH (o:PoliceOfficer {officerId: $officer_id})
    CREATE (f:FIR $fir_props)
    CREATE (o)-[:FILED]->(f)

    WITH f, o
    UNWIND $complainant_ids AS cid
    OPTIONAL MATCH (c:Citizen {citizenId: cid})
    FOREACH (_ IN CASE WHEN c IS NOT NULL THEN [1] ELSE [] END |
        CREATE (c)-[:COMPLAINED]->(f)
    )

    WITH f, o
    UNWIND $accused_ids AS aid
    OPTIONAL MATCH (a:Citizen {citizenId: aid})
    FOREACH (_ IN CASE WHEN a IS NOT NULL THEN [1] ELSE [] END |
        CREATE (a)-[:DEFENDS_AGAINST]->(f)
    )

    RETURN f
    """

    # Prepare parameters for the query
    params = {
        'officer_id': int(officer_id),
        'complainant_ids': complainant_ids,
        'accused_ids': accused_ids,
        'fir_props': fir_props
    }

    try:
        # Log the parameters being passed to Neo4j for debugging
        print("Query Parameters:", params)

        # Run the query and get results
        result = tx.run(query, params)
        records = list(result)

        if records:
            print("Successfully created FIR and relationships.")
            return True
        else:
            print("No results returned from Neo4j.")
            return False

    except Exception as e:
        # Catch and print any error that occurs, along with traceback for debugging
        print(f"Error occurred: {e}")
        return False




def create_fir_with_relationships(tx, officer_id, complainant_id, accused_ids, fir_props):
    query = """
    MATCH (o:PoliceOfficer {officerId: $officer_id})
    MATCH (c:Citizen {citizen_id: $complainant_id})
    CREATE (f:FIR $fir_props)
    CREATE (o)-[:FILED]->(f)
    CREATE (c)-[:REPORTED]->(f)
    WITH f
    UNWIND $accused_ids AS aid
    MATCH (a:Citizen {citizen_id: aid})
    CREATE (a)-[:DEFENDS_AGAINST]->(f)
    """
    tx.run(query, officer_id=officer_id, complainant_id=complainant_id, accused_ids=accused_ids, fir_props=fir_props)


def create_fir_node(tx, officer_id, fir_props):
    tx.run(
        """
        MATCH (o:PoliceOfficer {officerId: $officer_id})
        CREATE (f:FIR {
            complainant_name: $complainant_name,
            contact: $contact,
            email: $email,
            incident_datetime: $incident_datetime,
            location: $location,
            crime_type: $crime_type,
            description: $description,
            ipc_sections: $ipc_sections,
            filed_date: $filed_date,
            filed_time: $filed_time,
            approved: $approved,
            status: $status
        })
        CREATE (o)-[:FILED]->(f)
        """,
        officer_id=int(officer_id),
        **fir_props
    )

@require_GET
def get_unapproved_firs(request):
    with driver.session() as session:
        query = """
        MATCH (f:FIR)
        WHERE f.approved = false
        RETURN f
        """
        results = session.run(query)
        firs = []
        for record in results:
            f = record["f"]
            firs.append({
                "fir_id": f.id,  # Neo4j internal ID (optional, useful for approving/declining)
                "complainant_name": f.get("complainant_name"),
                "contact": f.get("contact"),
                "email": f.get("email"),
                "incident_datetime": f.get("incident_datetime"),
                "location": f.get("location"),
                "crime_type": f.get("crime_type"),
                "description": f.get("description"),
                "ipc_sections": f.get("ipc_sections"),
                "filed_date": f.get("filed_date"),
                "filed_time": f.get("filed_time"),
                "status": f.get("status"),
            })
        return JsonResponse({"firs": firs}, safe=False)

@require_GET
def get_fir_by_id(request, fir_id):
    with driver.session() as session:
        query = """
        MATCH (f:FIR)
        WHERE ID(f) = $fid
        RETURN f
        """
        result = session.run(query, fid=int(fir_id)).single()
        if result is None:
            return JsonResponse({"error": "FIR not found"}, status=404)
        print(result.data)
        f = result["f"]
        fir_data = {
            "fir_id": f.id,  # Neo4j's internal ID
            "name": f.get("complainant_name"),
            "contact": f.get("contact"),
            "email": f.get("email"),
            "incidentDate": f.get("incident_datetime"),
            "location": f.get("location"),
            "crimeType": f.get("crime_type"),
            "description": f.get("description"),
            "ipcSections": f.get("ipc_sections"),
            "filed_date":f.get("filed_date"),
            "filed_time":f.get("filed_time"),
        }
        #return JsonResponse({"fir": fir_data})
        return JsonResponse(fir_data)  # No {"fir": fir_data}



@csrf_exempt
def approve_fir(request, fir_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    import json
    data = json.loads(request.body)
    officer_id = data.get("officer_id")
    if not officer_id:
        return JsonResponse({"error": "Missing officer ID"}, status=400)
    print("Approve FIR CP-A")
    with driver.session() as session:
        query = """
        MATCH (o:PoliceOfficer {officerId: $officer_id}), (f:FIR)
        WHERE ID(f) = $fir_id
        SET f.approved = true
        MERGE (o)-[:APPROVED]->(f)
        RETURN f
        """
        print("Approve FIR CP-B")
        result = session.run(query, officer_id=int(officer_id), fir_id=fir_id).single()
        if result is None:
            return JsonResponse({"error": "Approval failed"}, status=400)
        return JsonResponse({"message": "FIR approved successfully"})

@csrf_exempt
def decline_fir(request, fir_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)

    with driver.session() as session:
        query = """
        MATCH (f:FIR {fir_id: $fir_id})
        DETACH DELETE f
        """
        session.run(query, fir_id=fir_id)
        return JsonResponse({"message": "FIR declined and deleted"})
     # adjust path as needed

@csrf_exempt
def handle_fir_action(request, fir_id, action):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        officer_id = data.get("officer_id")
        if not officer_id:
            return JsonResponse({"error": "Missing officer ID"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON: {str(e)}"}, status=400)

    with driver.session() as session:
        if action == "approve":
            query = """
            MATCH (o:PoliceOfficer {officerId: $officer_id})
            MATCH (f:FIR) WHERE ID(f) = toInteger($fir_id)
            SET f.approved = true
            MERGE (o)-[:APPROVED]->(f)
            RETURN f
            """
            result = session.run(query, officer_id=officer_id, fir_id=int(fir_id)).single()
            if result is None:
                return JsonResponse({"error": "Approval failed"}, status=400)

        elif action == "decline":
            query = """
            MATCH (f:FIR) WHERE ID(f) = toInteger($fir_id)
            DETACH DELETE f
            """
            session.run(query, fir_id=fir_id)

        else:
            return JsonResponse({"error": "Invalid action"}, status=400)

    return JsonResponse({"message": f"FIR {action}d successfully"})

'''
@csrf_exempt
def chat_with_assistant(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return JsonResponse({"error": "Empty prompt"}, status=400)

        # Simulated assistant response — replace with actual logic/LLM later
        response = f"Legal Assistant's reply to: '{prompt}'"

        return JsonResponse({"response": response})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
'''
import os

HEADERS = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}

API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
@csrf_exempt
def chat_with_assistant(request):
    if request.method != "POST":
        return JsonResponse({"response": "Invalid request method."}, status=405)

    try:
        data = json.loads(request.body)
        prompt = data.get("prompt", "").strip()

        if not prompt:
            return JsonResponse({"response": "Please enter a valid message."}, status=400)

        # Send prompt to Hugging Face
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.7,
                "return_full_text": False,
            }
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload)
        if response.status_code == 200:
            reply_data = response.json()
            if isinstance(reply_data, list) and "generated_text" in reply_data[0]:
                return JsonResponse({"response": reply_data[0]["generated_text"]})
            else:
                return JsonResponse({"response": "Unexpected AI response format."}, status=500)

        return JsonResponse({
            "response": f"Error from Hugging Face: {response.status_code} {response.text}"
        }, status=500)

    except Exception as e:
        return JsonResponse({"response": f"Error: {str(e)}"}, status=500)

@csrf_exempt
def hire_cop(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    try:
        name = request.POST.get("name")
        password = request.POST.get("password")
        role = request.POST.get("role")
        mobile = request.POST.get("mobile")
        email = request.POST.get("email")
        address = request.POST.get("address")
        photo = request.FILES.get("photo")

        if not all([name, password, role, mobile, email, address, photo]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Get max officer ID from OfficerPhoto table
        max_id = OfficerPhoto.objects.aggregate(Max('officer_id'))['officer_id__max'] or 0
        officer_id = int(max_id) + 1

        # Create node in Neo4j
        with driver.session() as session:
            query = """
            CREATE (o:PoliceOfficer {
                officerId: $officer_id,
                name: $name,
                password: $password,
                role: $role,
                mobile: $mobile,
                email: $email,
                address: $address
            })
            """
            session.run(query, officer_id=int(officer_id), name=name, password=password,
                        role=role, mobile=mobile, email=email, address=address)

        # Store profile photo in SQL
        OfficerPhoto.objects.create(officer_id=str(officer_id), photo=photo)

        return JsonResponse({"message": "Cop hired successfully", "officerId": officer_id})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
ROLE_HIERARCHY = [
    "Constable",
    "Assistant Sub-Inspector",
    "Sub Inspector",
    "Station House Officer"
]


@csrf_exempt
def change_cop_rank(request):
    if request.method == "GET":
        role_order = {
            "Station House Officer": 0,
            "Sub Inspector": 1,
            "Assistant Sub Inspector": 2,
            "Constable": 3,
        }

        with driver.session() as session:
            result = session.run("""
                MATCH (o:PoliceOfficer)
                RETURN o.officerId AS officerId,
                       o.name AS name,
                       o.role AS role
            """)
            data = [record.data() for record in result]
            data.sort(key=lambda x: role_order.get(x["role"], 4))
            return JsonResponse(data, safe=False)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            officer_id = data.get("officer_id")
            action = data.get("action")  # "promote" or "demote"

            if not officer_id or action not in ["promote", "demote"]:
                return JsonResponse({"error": "Invalid officerId or action"}, status=400)

            with driver.session() as session:
                result = session.run("""
                    MATCH (o:PoliceOfficer {officerId: $officer_id})
                    RETURN o.role AS role
                """, officer_id=int(officer_id)).single()

                if not result:
                    return JsonResponse({"error": "Officer not found"}, status=404)

                current_role = result["role"]
                if current_role not in ROLE_HIERARCHY:
                    return JsonResponse({"error": "Invalid role for this operation"}, status=400)

                index = ROLE_HIERARCHY.index(current_role)
                new_index = index + 1 if action == "promote" else index - 1

                if new_index < 0 or new_index >= len(ROLE_HIERARCHY):
                    return JsonResponse({"error": f"Cannot {action} further"}, status=400)

                new_role = ROLE_HIERARCHY[new_index]

                session.run("""
                    MATCH (o:PoliceOfficer {officerId: $officer_id})
                    SET o.role = $new_role
                    RETURN o
                """, officer_id=int(officer_id), new_role=new_role)

            return JsonResponse({"message": f"Officer {action}d to {new_role}"})

        except Exception as e:
            return JsonResponse({"error": f"Error: {str(e)}"}, status=500)

    else:
        return JsonResponse({"error": "Only GET and POST methods allowed"}, status=405)
    
@csrf_exempt
def fire_cop(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        officer_id = data.get("officer_id")

        if not officer_id:
            return JsonResponse({"error": "Officer ID is required"}, status=400)

        with driver.session() as session:
            result = session.run(
                "MATCH (o:PoliceOfficer {officerId: $officer_id}) DETACH DELETE o RETURN COUNT(o) AS deleted",
                officer_id=int(officer_id),
            )
            deleted = result.single()["deleted"]
            if deleted == 0:
                return JsonResponse({"error": "No officer found with that ID"}, status=404)

    except Exception as e:
        return JsonResponse({"error": f"Error: {str(e)}"}, status=500)

    return JsonResponse({"message": "Officer successfully fired"})



# neo4j_helper.py
from neo4j import GraphDatabase
from django.conf import settings

class Neo4jHelper:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return result

    def close(self):
        self.driver.close()

neo4j_helper = Neo4jHelper()

import uuid

def lodge_complaint(name, govt_id, address, mobile, email, title, main_body, against_people):
    complaint_id = str(uuid.uuid4())
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with neo4j_driver.session() as session:
        session.run(
            """
            CREATE (c:Complaint {
                complaint_id: $complaint_id,
                name: $name,
                govt_id: $govt_id,
                address: $address,
                mobile: $mobile,
                email: $email,
                title: $title,
                main_body: $main_body,
                against_people: $against_people,
                created_at: $created_at,
                status: 0,
                type: "none"
            })
            """,
            complaint_id=complaint_id,
            name=name,
            govt_id=govt_id,
            address=address,
            mobile=mobile,
            email=email,
            title=title,
            main_body=main_body,
            against_people=against_people,
            created_at=created_at,
        )

    return {"message": "Complaint lodged successfully", "complaint_id": complaint_id}
    
@api_view(['POST'])
def lodge_complaint_view(request):
    if request.method == 'POST':
        data = request.data

        name = data.get("name")
        govt_id = data.get("govt_id")
        address = data.get("address")
        mobile = data.get("mobile")
        email = data.get("email")
        title = data.get("title")
        main_body = data.get("main_body")
        against_people = data.get("against_people")

        try:
            result = lodge_complaint(
                name, govt_id, address, mobile, email, title, main_body, against_people
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

neo4j_driver = GraphDatabase.driver(settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD))

def get_complaint_status(request, complaint_id):
    with neo4j_driver.session() as session:
        result = session.run(
            """
            MATCH (c:Complaint)
            WHERE c.complaint_id = $complaint_id
            RETURN c.complaint_id AS complaint_id,
                   c.address AS address,
                   c.mobile AS mobile,
                   c.name AS name,
                   c.created_at AS created_at,
                   c.title AS title,
                   c.main_body AS main_body,               // 🟢 ADD THIS
                   c.against_people AS against_people,     // 🟢 AND THIS
                   c.type AS type,
                   c.email AS email,
                   c.status AS status
            """,
            complaint_id=complaint_id,
        )

        if result.peek() is None:
            return JsonResponse({"error": "Complaint not found"}, status=404)

        complaint_data = result.single()

        response_data = {
            "complaint_id": complaint_data["complaint_id"],
            "address": complaint_data["address"],
            "mobile": complaint_data["mobile"],
            "name": complaint_data["name"],
            "created_at": complaint_data["created_at"],
            "title": complaint_data["title"],
            "main_body": complaint_data["main_body"],              # 🟢 Include here
            "against_people": complaint_data["against_people"],    # 🟢 And here
            "type": complaint_data["type"],
            "email": complaint_data["email"],
            "status": complaint_data["status"],
            "status_text": "Not Seen" if complaint_data["status"] == 0 else ("Accepted" if complaint_data["status"] == 1 else "Rejected")
        }

        return JsonResponse(response_data)
    
def get_pending_complaints(request):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Complaint)
            WHERE c.status = 0
            RETURN c.complaint_id AS id,
                   c.name AS name,
                   c.title AS title,
                   c.main_body AS main_body,
                   c.created_at AS created_at,
                   c.address AS address,
                   c.govt_id AS govt_id,
                   c.mobile AS mobile,
                   c.email AS email,
                   c.against_people AS against_people,
                   c.status AS status,
                   c.type AS type
            ORDER BY c.created_at DESC
            """
        )
        data = [record.data() for record in result]
        return JsonResponse(data, safe=False)


@csrf_exempt
def update_complaint(request, complaint_id):
    print(request.body)
    if request.method == "POST":
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload"}, status=400)

        updates = {}
        if "status" in payload:
            updates["status"] = payload["status"]  # Removed int cast

        if "type" in payload:
            updates["type"] = payload["type"]

        if not updates:
            return JsonResponse({"error": "No valid fields to update"}, status=400)

        set_clauses = [f"c.{key} = ${key}" for key in updates]
        query = f"""
        MATCH (c:Complaint {{complaint_id: $complaint_id}})
        SET {', '.join(set_clauses)}
        RETURN c.complaint_id AS id
        """

        with driver.session() as session:
            result = session.run(query, complaint_id=complaint_id, **updates)
            if result.single():
                return JsonResponse({"message": "Complaint updated successfully"})
            else:
                return JsonResponse({"error": "Complaint not found"}, status=404)

    return JsonResponse({"error": "Invalid method"}, status=405)


def get_approved_complaints(request):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Complaint)
            WHERE c.status = 'Approved'
            RETURN c.complaint_id AS id,
                   c.name AS name,
                   c.title AS title,
                   c.main_body AS main_body,
                   c.created_at AS created_at,
                   c.address AS address,
                   c.govt_id AS govt_id,
                   c.mobile AS mobile,
                   c.email AS email,
                   c.against_people AS against_people,
                   c.status AS status,
                   c.type AS type
            ORDER BY c.created_at DESC
            """
        )
        data = [record.data() for record in result]
        return JsonResponse(data, safe=False)

def get_declined_complaints(request):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Complaint)
            WHERE c.status = 'Declined'
            RETURN c.complaint_id AS id,
                   c.name AS name,
                   c.title AS title,
                   c.main_body AS main_body,
                   c.created_at AS created_at,
                   c.address AS address,
                   c.govt_id AS govt_id,
                   c.mobile AS mobile,
                   c.email AS email,
                   c.against_people AS against_people,
                   c.status AS status,
                   c.type AS type
            ORDER BY c.created_at DESC
            """
        )
        data = [record.data() for record in result]
        return JsonResponse(data, safe=False)

def list_all_cops(request):
    role_order = {
        "Station House Officer": 0,
        "Sub Inspector": 1,
        "Assistant Sub-Inspector": 2,
        "Constable": 3,
    }

    with driver.session() as session:
        result = session.run("""
            MATCH (o:PoliceOfficer)
            RETURN o.officerId AS officerId,
                   o.name AS name,
                   o.role AS role,
                   o.mobile AS mobile,
                   o.email AS email,
                   o.address AS address
        """)
        data = [record.data() for record in result]

        # Attach photo
        for cop in data:
            try:
                photo_entry = OfficerPhoto.objects.get(officer_id=cop["officerId"])
                with open(photo_entry.photo.path, "rb") as img_file:
                    encoded_photo = base64.b64encode(img_file.read()).decode("utf-8")
                cop["photo_data"] = f"data:image/jpeg;base64,{encoded_photo}"
            except OfficerPhoto.DoesNotExist:
                cop["photo_data"] = None

        # Sort by role using custom order
        data.sort(key=lambda x: role_order.get(x["role"], 4))

        return JsonResponse(data, safe=False)


@require_GET
def get_current_firs(request):
    with driver.session() as session:
        query = """
        MATCH (f:FIR)
        WHERE f.approved = true AND f.status = 'Pending'
        RETURN id(f) as fir_id, f.complainant_name as name
        """
        results = session.run(query)
        firs = [{"fir_id": r["fir_id"], "name": r["name"]} for r in results]
        return JsonResponse({"firs": firs})

@require_GET
def get_fir_with_updates(request, fir_id):
    with driver.session() as session:
        query = """
        MATCH (f:FIR)
        WHERE id(f) = $fid
        OPTIONAL MATCH (f)<-[:RELATED_TO]-(u:Update)<-[:UPDATED]-(o:PoliceOfficer)
        WITH f, u, o
        ORDER BY u.timestamp
        RETURN f, collect({desc: u.description, officer_id: o.officerId}) AS updates
        """
        result = session.run(query, fid=int(fir_id)).single()
        if not result:
            return JsonResponse({"error": "FIR not found"}, status=404)

        f = result["f"]
        updates = result["updates"] or []

        fir_data = {
            "fir_id": f.id,
            "name": f.get("complainant_name"),
            "crimeType": f.get("crime_type"),
            "location": f.get("location"),
            "description": f.get("description"),
            "status": f.get("status"),
            "updates": updates,
        }
        print(json.dumps(fir_data, indent=2))  # inside your view just before returning JsonResponse
        return JsonResponse({"fir": fir_data})

@csrf_exempt
def add_fir_update(request, fir_id):
    #print("AFU-CP-A")
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    data = json.loads(request.body)
    officer_id = data.get("officer_id")
    description = data.get("description")
    print(officer_id,description)

    with driver.session() as session:
        query = """
        MATCH (f:FIR), (o:PoliceOfficer)
        WHERE ID(f) = $fid AND o.officerId = $officer_id
        CREATE (u:Update {description: $description, timestamp: timestamp()})
        MERGE (u)-[:RELATED_TO]->(f)
        MERGE (o)-[:UPDATED]->(u)
        RETURN u
        """
        session.run(query, fid=int(fir_id), officer_id=int(officer_id), description=description)
        return JsonResponse({"message": "Update added"})

@csrf_exempt
def mark_fir_status(request, fir_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    
    data = json.loads(request.body)
    status = data.get("status")  # e.g., 'concluded' or 'inconclusive'

    with driver.session() as session:
        query = """
        MATCH (f:FIR)
        WHERE ID(f) = $fid
        SET f.status = $status
        RETURN f
        """
        session.run(query, fid=int(fir_id), status=status)
        return JsonResponse({"message": f"FIR marked as {status}"})

# views.py
@api_view(['GET'])
def view_past_firs(request):
    with driver.session() as session:
        result = session.run("""
            MATCH (f:FIR)
            WHERE f.status IN ['concluded', 'inconclusive']
            OPTIONAL MATCH (f)<-[:FILED]-(officer:PoliceOfficer)
            OPTIONAL MATCH (f)<-[:ABOUT]-(complainant:Complainant)
            OPTIONAL MATCH (f)<-[:RELATED_TO]-(update:Update)<-[:UPDATED]-(updateOfficer:PoliceOfficer)
            RETURN f, officer, complainant,
                   collect({description: update.description, officerId: updateOfficer.officerId}) AS updates
        """)

        firs = []
        for record in result:
            fir = record['f']
            officer = record.get('officer')
            complainant = record.get('complainant')
            updates_raw = record.get('updates', [])

            # Filter out null updates (may happen if no updates exist)
            updates = [
                u for u in updates_raw if u['description'] is not None and u['officerId'] is not None
            ]

            firs.append({
                'id': fir['id'],
                'name': fir.get('complainant_name') or (complainant['name'] if complainant else "Unknown"),
                'crime': fir.get('crime_type', ''),
                'location': fir.get('location', ''),
                'description': fir.get('description', ''),
                'status': fir.get('status', ''),
                'filedDate': fir.get('filed_date', ''),
                'filedTime': fir.get('filed_time', ''),
                'officer': officer['name'] if officer else None,
                'complainant': complainant['name'] if complainant else None,
                'updates': updates
            })

        return JsonResponse({'firs': firs})
    
@csrf_exempt
@require_GET
def crime_analytics(request):
    with driver.session() as session:
        result = session.read_transaction(get_crime_analytics)
    return JsonResponse(result)

def get_crime_analytics(tx):
    data = {
        "counts": {},
        "crime_type_freq": [],
        "location_freq": [],
        "ipc_freq": [],
    }

    # FIR counts
    data["counts"]["ongoing_firs"] = tx.run("MATCH (f:FIR) WHERE f.status = 'pending' AND f.approved = true RETURN count(f) AS count").single().value()
    data["counts"]["concluded_firs"] = tx.run("MATCH (f:FIR) WHERE f.status = 'concluded' RETURN count(f) AS count").single().value()
    data["counts"]["inconclusive_firs"] = tx.run("MATCH (f:FIR) WHERE f.status = 'inconclusive' RETURN count(f) AS count").single().value()
    data["counts"]["total_firs"] = tx.run("MATCH (f:FIR) RETURN count(f) AS count").single().value()

    # Complaint counts
    data["counts"]["approved_complaints"] = tx.run("MATCH (c:Complaint) WHERE c.status = 1 RETURN count(c) AS count").single().value()
    data["counts"]["declined_complaints"] = tx.run("MATCH (c:Complaint) WHERE c.status = -1 RETURN count(c) AS count").single().value()
    data["counts"]["total_complaints"] = tx.run("MATCH (c:Complaint) RETURN count(c) AS count").single().value()

    # CSR count
    data["counts"]["total_csrs"] = tx.run("MATCH (c:CSR) RETURN count(c) AS count").single().value()

    # Crime type frequency
    crime_types = tx.run("MATCH (f:FIR) RETURN f.crime_type AS type, count(*) AS count ORDER BY count DESC")
    data["crime_type_freq"] = [{"type": row["type"], "count": row["count"]} for row in crime_types]

    # Location frequency
    locations = tx.run("MATCH (f:FIR) RETURN f.location AS location, count(*) AS count ORDER BY count DESC")
    data["location_freq"] = [{"location": row["location"], "count": row["count"]} for row in locations]

    # IPC frequency
    ipc_sections = tx.run("MATCH (f:FIR)-[:MENTIONS]->(i:IPC) RETURN i.section AS section, count(*) AS count ORDER BY count DESC")
    data["ipc_freq"] = [{"section": row["section"], "count": row["count"]} for row in ipc_sections]

    return data

@csrf_exempt
def add_citizen(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed."}, status=405)

    name = request.POST.get("name")
    dob = request.POST.get("dob")
    mobile = request.POST.get("mobile")
    email = request.POST.get("email")
    address = request.POST.get("address")
    photo_file = request.FILES.get("photo")

    if not all([name, dob, mobile, email, address, photo_file]):
        return JsonResponse({"error": "All fields are required."}, status=400)

    # 1. Generate new citizen ID (+1 from last)
    last = max(CitizenPhoto.objects.all(), key=lambda x: int(x.citizen_id), default=None)
    new_citizen_id = str(int(last.citizen_id) + 1) if last else "1"

    print(new_citizen_id)

    # 2. Store in Neo4j
    with driver.session() as session:
        session.run(
            """
            CREATE (c:Citizen {
                name: $name,
                citizenId: $citizen_id,
                dob: $dob,
                mobile: $mobile,
                email: $email,
                address: $address
            })
            """,
            name=name,
            citizen_id=new_citizen_id,
            dob=dob,
            mobile=mobile,
            email=email,
            address=address,
        )

    # 3. Store photo in relational DB
    CitizenPhoto.objects.create(citizen_id=new_citizen_id, photo=photo_file)

    return JsonResponse({"message": "Citizen added successfully.", "citizenId": new_citizen_id})

def view_all_citizens(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'GET method required'}, status=405)

    citizens = []

    with driver.session() as session:
        query = """
            MATCH (c:Citizen)
            RETURN c
        """
        result = session.run(query)

        for record in result:
            c = record['c']
            citizen_id = c['citizenId']

            # Get photo and convert to base64
            try:
                photo_obj = CitizenPhoto.objects.get(citizen_id=str(citizen_id))
                print(photo_obj.photo.path)
                with open(photo_obj.photo.path, "rb") as img_file:
                    encoded_photo = base64.b64encode(img_file.read()).decode("utf-8")
                photo_data = f"data:image/jpeg;base64,{encoded_photo}"
                print("Successful")
            except CitizenPhoto.DoesNotExist:
                print("No")
                photo_data = None

            citizens.append({
                'citizenId': citizen_id,
                'name': c.get('name', ''),
                'dob': c.get('dob', ''),
                'mobile': c.get('mobile', ''),
                'email': c.get('email', ''),
                'address': c.get('address', ''),
                'photo_data': photo_data
            })

    return JsonResponse(citizens, safe=False)

@csrf_exempt
def list_citizens(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed."}, status=405)

    try:
        with driver.session() as session:
            result = session.run("MATCH (c:Citizen) RETURN c.name AS name, c.citizen_id AS id")
            citizens = [{"label": record["name"], "value": record["id"]} for record in result]
        return JsonResponse({"citizens": citizens})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

def get_citizens(request):
    uri = "bolt://localhost:7687"
    driver = GraphDatabase.driver(uri, auth=("neo4j", "ssnssnssnssn"))

    session = driver.session()

    query = "MATCH (c:Citizen) RETURN c.citizenId AS id, c.name AS name"
    result = session.run(query)
    citizens = [{"id": record["id"], "name": record["name"]} for record in result]
    #citizens = [{"id": str(record["id"]), "name": record["name"]} for record in result]
    session.close()
    return JsonResponse(citizens, safe=False)

def view_citizen_details(request, citizen_id):
    try:
        # Get Citizen node by citizenId
        citizen = driver.session().run(
            """
            MATCH (c:Citizen {citizenId: $citizen_id})
            RETURN c
            """, 
            citizen_id=citizen_id
        ).single()

        if not citizen:
            return JsonResponse({'error': 'Citizen not found'}, status=404)

        citizen_data = citizen['c']

        # Fetch complaints made by the citizen
        complaints = []
        complaint_results = driver.session().run(
            """
            MATCH (c:Citizen {citizenId: $citizen_id})-[:COMPLAINED]->(comp:Complaint)
            RETURN comp
            """,
            citizen_id=citizen_id
        )

        for record in complaint_results:
            complaints.append({'complaintId': record['comp'].get('complaintId', ''), 'name': record['comp'].get('name', '')})

        # Fetch FIRs that the citizen complained about
        firs_complained = []
        fir_complaints_results = driver.session().run(
            """
            MATCH (c:Citizen {citizenId: $citizen_id})-[:COMPLAINED]->(f:FIR)
            RETURN id(f) AS firId, f.crime_type AS crime_type
            """,
            citizen_id=citizen_id
        )

        for record in fir_complaints_results:
            firs_complained.append({'firId': record['firId'], 'crime_type': record['crime_type']})

        # Fetch FIRs that the citizen defended
        firs_defended = []
        fir_defended_results = driver.session().run(
            """
            MATCH (c:Citizen {citizenId: $citizen_id})-[:DEFENDS_AGAINST]->(f:FIR)
            RETURN id(f) AS firId, f.crime_type AS crime_type
            """,
            citizen_id=citizen_id
        )

        for record in fir_defended_results:
            firs_defended.append({'firId': record['firId'], 'crime_type': record['crime_type']})

        # Return citizen details along with complaints, FIRs complained, and FIRs defended
        citizen_details = {
            'citizenId': citizen_data['citizenId'],
            'name': citizen_data.get('name', ''),
            'dob': citizen_data.get('dob', ''),
            'mobile': citizen_data.get('mobile', ''),
            'email': citizen_data.get('email', ''),
            'address': citizen_data.get('address', ''),
            'complaints': complaints,
            'firsComplained': firs_complained,
            'firsDefended': firs_defended
        }

        return JsonResponse(citizen_details)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
