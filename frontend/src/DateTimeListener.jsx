import MobileDateTimePicker from '@mui/x-date-pickers/MobileDateTimePicker';
import Tooltip from '@mui/material/Tooltip';


// Creates a controlled DateTimePicker that has a built-in tooltip and label.
// sendTo = the function that we want to call when the user inputs a date and time
// value = the value this DateTimePicker should display, which should be a state variable
// toolTip = what the DateTimePicker should say when it's hovered over
// label = what the DateTimePicker is labelled as

// Best used for adding new assignments
export default function DateTimeListener({sendTo, value, toolTip, label}){
    return (<>
        <Tooltip title = {toolTip}>
        <MobileDateTimePicker label = {label} value = {value} onChange = {sendTo} />
        </Tooltip>
    </>);
}