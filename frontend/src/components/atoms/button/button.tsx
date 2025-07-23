interface IButton {
    type?: "button" | "submit" | "reset";
    onClick: () => void;
}
const Button:React.FC<IButton>=({type,onClick})=>{
    return(
        
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300" type={type} onClick={onClick}>
                Click Me
            </button>
        
    )

}
export default Button;