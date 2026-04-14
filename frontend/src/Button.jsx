import Button from '@mui/material/Button';

// A contained button that calls a function when pressed.
// sendTo = the function that is called from the button
// label = the label of the button
// isDisabled = whether or not the button is disabled. Defaults to false.
export default function Button({sendTo, label, isDisabled}){
    return <Button variant = "contained" disabled = {isDisabled} onChange = {sendTo}>{label}</Button>
}
