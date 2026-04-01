import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// Creates a controlled outlined Textbox that has a built-in tooltip and label.
// id = id of this Textbox
// sendTo = a function that we want to call when the user inputs something
// value = the value this Textbox should display, which should be a state variable
// toolTip = what the Textbox should say when it's hovered over
// label = what the Textbox is labelled as

// Best used for adding new assignments
export default function TextBoxListener({id, sendTo, value, toolTip, label}){
    return (<>
        <Tooltip title = {toolTip}>
        <TextField id = {id} label = {label} variant = "outlined" 
        value = {value} onChange = {sendTo}/>
        </Tooltip>
    </>);
}