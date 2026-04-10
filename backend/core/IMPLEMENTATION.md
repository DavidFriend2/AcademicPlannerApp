Features: 
User registration and database schema stubs.
Foundational Assignment class with create method.
Basic API endpoint stubs for Course retrieval.

Individual Contribution Breakdown:
Jo: Completed Django models for courses, assignments, and exams. Developed correspnding Django Rest Framework serializers to manage data translation layer between the database and API. I implemented these components through individual, hand-coded development. I defined the models with proper data types (e.g., DateTimeField for deadlines) and used DRF ModelSerializers to automate the JSON conversion. I then used the DefaultRouter to generate clean API paths. This implementation directly builds on the Client-Server architectural pattern we chose in PM3. By setting up the Django models and Serializers first, I’ve created the "Server-side" logic that handles data persistence, which allows the "Client-side" (React) to later fetch and render that data as "AssignmentCards" as seen in our design sketch.
David:
Kat: