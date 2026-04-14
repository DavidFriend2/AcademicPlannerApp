
// An app that prints out a singular assignment
// Takes the title of the assignment, the due date of the assignment,
// And the description.
// The isComplete value takes a false or a true. Defaults to false.
// A true represents that the homework assignment is complete and should be crossed out
// A false represents that the homework assignment is not complete, and shouldn't be crossed out

export default function printAssignment({title, dueDate, description, isComplete = false}){
    if (isComplete){
        return <div>
            <h3><s>{title}: {dueDate}</s></h3><br/>
            <text><s>{description}</s></text>
        </div>;
    }
    return <div>
        <h3>{title}: {dueDate}</h3><br/>
        <text>{description}</text>
    </div>;
};