export const getInitialName = (name: string): string => {
    const words = name.split(' ');
    if (words.length === 3) {
        return `${words[0][0]}${words[1][0]}`;
    }
    const initials = words.map((word) => word[0]).join('');
    return initials.length > 1 ? initials : name.slice(0, 2);
};
