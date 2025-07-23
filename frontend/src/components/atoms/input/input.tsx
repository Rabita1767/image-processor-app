interface IInput {
    className:string,
    type?: string,
    value?: string;
    isRequired?: boolean,
    onChange: (value: string) => void;
}
const Input: React.FC<IInput> = ({ className,type, value, isRequired, onChange }) => {
    return (
        <div>
            <input className={className}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={isRequired}
            />
        </div>
    )
}

export default Input