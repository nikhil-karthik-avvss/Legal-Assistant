from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "ssnssnssnssn"))
'''
def get_officer_by_name(officer_id):
    print(f"Officer with ID {officer_id} tries to log in")
    with driver.session(database="neo4j") as session:
        result = session.run("""
            MATCH (p:PoliceOfficer {officerId: $officer_id})
            RETURN p
        """, officer_id=int(officer_id))
        
        record = result.single()
        print(record)
        return record["p"] if record else None

'''
def get_officer_by_name(officer_id):
    print(f"Officer with ID {officer_id} tries to log in")
    with driver.session() as session:
        result = session.run("""
            MATCH (p:PoliceOfficer {officerId: $officer_id})
            RETURN p
        """, officer_id=int(officer_id))
        
        record = result.single()
        print(record)
        return record["p"] if record else None