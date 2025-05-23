import { useInView } from 'react-intersection-observer';

type InfiniteScrollContainerProps = {
    children: React.ReactNode;
    onBottomReached: () => void;
    className?: string;
};

const InfiniteScrollContainer = ({ children, onBottomReached, className }: InfiniteScrollContainerProps) => {
    const { ref } = useInView({
        rootMargin: '50px',
        onChange(inView) {
            if (inView) onBottomReached();
        },
    });

    return (
        <div className={className}>
            {children}
            <div ref={ref} />
        </div>
    );
};

export default InfiniteScrollContainer;
