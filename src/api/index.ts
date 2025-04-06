const modules = import.meta.glob('./**/index.ts', { eager: true });

export default [...Object.values(modules)];