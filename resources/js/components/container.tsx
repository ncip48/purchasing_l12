import { ReactNode } from 'react';

function Container({ children }: { children: ReactNode }) {
    return <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">{children}</div>;
}

export default Container;
