interface AddProductCardProps {
    onClick: () => void;
}

function AddProductCard({ onClick }: AddProductCardProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center w-full h-full py-5 border-2 border-dashed border-surface-border rounded-xl bg-surface-card hover:bg-surface-hover hover:border-accent transition-all group"
            aria-label="Добавить товар"
        >
            <div className="flex flex-col items-center gap-3">
                {/* Plus icon */}
                <div className="w-16 h-16 rounded-full bg-surface-base group-hover:bg-accent transition-colors flex items-center justify-center">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-8 h-8 text-text-secondary group-hover:text-text-inverse transition-colors"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                
                {/* Text */}
                <span className="text-sm font-medium font-main text-text-secondary group-hover:text-text-primary transition-colors">
                    Добавить товар
                </span>
            </div>
        </button>
    );
}

export default AddProductCard;
