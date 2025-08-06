interface IButton {
  type?: "button" | "submit" | "reset";
  onClick: () => void;
  btnText?: string;
}
const Button: React.FC<IButton> = ({ type, onClick, btnText }) => {
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
      type={type}
      onClick={onClick}
    >
      {btnText || "Click Me"}
    </button>
  );
};
export default Button;
